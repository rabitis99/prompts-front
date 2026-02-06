import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, ArrowRight, Home, Receipt } from 'lucide-react';
import { paymentApi } from '@/features/payment/api/payment.api';

/**
 * 결제 성공 콜백 페이지
 * 
 * 토스페이먼츠와 카카오페이 결제 완료 후 이 페이지로 리다이렉트됩니다.
 * URL 파라미터로 전달된 정보를 사용하여 백엔드에 결제 승인 요청을 보냅니다.
 * 
 * ⚠️ 중요: paymentKey와 pgToken은 서버에서 생성할 수 없으며 반드시 프론트엔드에서 전달해야 합니다.
 * - paymentKey: 토스페이먼츠 결제 위젯에서 결제 성공 시 생성되는 고유 키
 * - pgToken: 카카오페이 결제 승인 후 카카오에서 리다이렉트할 때 전달되는 1회성 토큰
 * 
 * 토스페이먼츠 URL 파라미터:
 * - orderId: 주문 ID (백엔드에서 생성)
 * - paymentKey: 토스페이먼츠 결제 키 (토스 결제 위젯에서 생성, 프론트엔드에서만 획득 가능)
 * - amount: 결제 금액
 * 
 * 카카오페이 URL 파라미터:
 * - orderId: 주문 ID (백엔드에서 생성)
 * - tid: 결제 키 (카카오페이에서 생성, paymentKey로 사용)
 * - pg_token: 카카오페이 승인 토큰 (1회성, 승인 API 호출 후 즉시 무효화, 프론트엔드에서만 획득 가능)
 * - amount: 결제 금액
 */
export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'toss' | 'kakao' | null>(null);
  const [paymentData, setPaymentData] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // ⭐ StrictMode / 재렌더에서도 1회 실행 보장
  const calledRef = useRef(false);
  // 카운트다운 interval 정리를 위한 ref
  const countdownIntervalRef = useRef<number | null>(null);
  const MAX_RETRY_COUNT = import.meta.env.DEV ? 999 : 3; // 개발 환경에서는 거의 무제한

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  // 카운트다운 시작 및 자동 이동
  const startCountdownAndNavigate = () => {
    setCountdown(3);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          // navigate는 상태 업데이트와 분리하여 다음 이벤트 루프에서 실행
          setTimeout(() => {
            navigate('/payments');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 결제 승인 로직 (재사용 가능하도록 분리)
  const handleConfirmPayment = async (isRetry = false) => {
      // URL 파라미터 추출
      let orderId = searchParams.get('orderId');
      const paymentKey = searchParams.get('paymentKey'); // 토스페이먼츠
      let tid = searchParams.get('tid'); // 카카오페이 (paymentKey로 사용)
      const pgToken = searchParams.get('pg_token'); // 카카오페이
      let amount = searchParams.get('amount');

      // 결제 수단 판별: pg_token이 있으면 카카오페이, paymentKey가 있으면 토스페이먼츠
      const isKakaoPay = !!pgToken;
      const isToss = !!paymentKey && !pgToken;

      if (isKakaoPay) {
        setPaymentMethod('kakao');
        
        // ⚠️ 백엔드가 approval_url에 파라미터를 포함하지 않는 경우를 대비해
        // sessionStorage에서 결제 정보 가져오기
        if (!orderId || !tid || !amount) {
          try {
            const storedInfo = sessionStorage.getItem('kakao_payment_info');
            if (storedInfo) {
              const paymentInfo = JSON.parse(storedInfo);
              console.log('[PaymentSuccessPage] sessionStorage에서 결제 정보 복원', paymentInfo);
              orderId = orderId || paymentInfo.orderId;
              tid = tid || paymentInfo.tid;
              amount = amount || paymentInfo.amount?.toString();
              // 사용 후 삭제
              sessionStorage.removeItem('kakao_payment_info');
            }
          } catch (e) {
            console.error('[PaymentSuccessPage] sessionStorage 읽기 실패:', e);
          }
        }

        // 3순위: status 조회로 tid 복원 (백엔드가 external_payment_id로 tid 제공하는 경우)
        if (orderId && !tid) {
          const paymentIdNum = Number(orderId);
          if (!Number.isNaN(paymentIdNum) && paymentIdNum > 0) {
            try {
              const statusRes = await paymentApi.checkPaymentStatus(paymentIdNum);
              const externalPaymentId = statusRes.data?.data?.external_payment_id;
              if (externalPaymentId) {
                tid = externalPaymentId;
                console.log('[PaymentSuccessPage] status 조회로 tid 복원 성공', {
                  orderId,
                  tid,
                });
              }
            } catch (e) {
              console.warn('[PaymentSuccessPage] status 조회로 tid 복원 실패:', e);
            }
          }
        }
        
        // 카카오페이 필수 파라미터 검증
        if (!orderId || !tid || !pgToken || !amount) {
          // 디버깅 정보는 콘솔에만 출력
          console.error('[PaymentSuccessPage] 카카오페이 파라미터 누락:', {
            orderId, tid: !!tid, pgToken: !!pgToken, amount
          });
          
          setStatus('error');
          setErrorMessage(
            '카카오페이 결제 정보가 올바르지 않습니다.\n' +
            '문제가 지속되면 고객센터로 문의해주세요.'
          );
          return;
        }

        // 재시도 버튼 클릭 시에는 재시도 횟수 증가
        // 로컬 변수로 계산하여 로그/메시지에서 정확한 값 사용 (try/catch 블록 모두에서 사용)
        const nextRetryCount = isRetry ? retryCount + 1 : retryCount;
        
        try {
          // 재시도 횟수 체크 (개발 환경에서는 제한 없음)
          if (!import.meta.env.DEV && nextRetryCount >= MAX_RETRY_COUNT) {
            setStatus('error');
            setErrorMessage(
              '결제 승인 요청이 너무 많이 시도되었습니다.\n' +
              '고객센터로 문의하시거나 잠시 후 다시 시도해주세요.'
            );
            return;
          }

          if (isRetry) {
            setRetryCount(nextRetryCount);
          }

          console.log('[PaymentSuccessPage] 카카오페이 결제 승인 요청', {
            orderId,
            amount: Number(amount),
            paymentKey: tid,
            pgToken,
            retryCount: nextRetryCount,
            isRetry,
          });

          /**
           * ⚠️ 중요: pgToken은 카카오페이에서 결제 승인 후 리다이렉트할 때만 전달되는 1회성 토큰입니다.
           * - 이 토큰은 카카오페이 결제 페이지에서 사용자가 결제를 승인한 후에만 생성됩니다.
           * - 서버에서는 이 값을 생성하거나 추측할 수 없습니다.
           * - 프론트엔드에서 리다이렉트 URL의 쿼리 파라미터로만 획득 가능합니다.
           * - 승인 API 호출 후 즉시 무효화되므로, 프론트엔드에서 누락되면 결제 승인은 절대 성공할 수 없습니다.
           */
          const response = await paymentApi.confirmPayment({
            order_id: orderId,
            amount: Number(amount),
            payment_key: tid, // 카카오페이에서는 tid를 paymentKey로 사용
            pg_token: pgToken, // 카카오페이 승인 시 필수
          });

          if (!response.data.success) {
            throw new Error(response.data.error?.message || '결제 승인에 실패했습니다.');
          }

          // 성공 시 재시도 카운터 리셋
          setRetryCount(0);

          setPaymentData({
            orderId,
            amount: Number(amount),
          });
          setStatus('success');

          // URL 정리 (뒤로 가기 / 리렌더 재호출 방지)
          window.history.replaceState({}, '', '/payment/success');

          // 카운트다운 시작
          startCountdownAndNavigate();
        } catch (error) {
          console.error('[PaymentSuccessPage] 카카오페이 결제 승인 오류:', error);
          
          const message =
            error instanceof Error ? error.message : '결제 승인 중 오류가 발생했습니다.';
          
          // 재시도 가능 여부에 따른 메시지 추가
          // setRetryCount가 비동기이므로, 실제 증가된 값을 사용하기 위해 nextRetryCount 사용
          const retryMessage = import.meta.env.DEV
            ? `${message}\n\n[개발 모드] 재시도 ${nextRetryCount}회`
            : nextRetryCount >= MAX_RETRY_COUNT
            ? `${message}\n\n재시도 횟수를 초과했습니다. 고객센터로 문의해주세요.`
            : `${message}\n\n(재시도 가능: ${MAX_RETRY_COUNT - nextRetryCount}회 남음)`;
          
          setStatus('error');
          setErrorMessage(retryMessage);
        }
      } else if (isToss) {
        setPaymentMethod('toss');
        
        // 토스페이먼츠 필수 파라미터 검증
        if (!orderId || !paymentKey || !amount) {
          setStatus('error');
          setErrorMessage('토스페이먼츠 결제 정보가 올바르지 않습니다.');
          return;
        }

        /**
         * Toss 결제용 orderId 파싱
         * 
         * 포맷: ORDER-{내부주문ID}-{timestamp}
         * 예시: ORDER-123-1704067200000
         * 
         * 내부 주문 ID는 URL 파라미터에서 직접 받거나, orderId에서 파싱
         */
        let internalOrderId: string | null = searchParams.get('internalOrderId');
        let tossOrderId = orderId;

        // orderId가 새로운 포맷인지 확인 (ORDER-로 시작하는지)
        if (orderId.startsWith('ORDER-')) {
          // ORDER-{내부주문ID}-{timestamp} 형식에서 내부 주문 ID 추출
          const parts = orderId.split('-');
          if (parts.length >= 3 && !internalOrderId) {
            internalOrderId = parts[1]; // 두 번째 부분이 내부 주문 ID
          }
        } else {
          // 기존 포맷 (숫자만)인 경우 호환성 유지
          // 토스페이먼츠 orderId 정책: 6자 이상 64자 이하
          tossOrderId = String(orderId).padStart(6, '0');
          if (!internalOrderId) {
            internalOrderId = orderId;
          }
        }

        console.log('[PaymentSuccessPage] Toss 결제용 orderId 파싱', {
          originalOrderId: orderId,
          tossOrderId,
          internalOrderId,
        });

        // 재시도 버튼 클릭 시에는 재시도 횟수 증가
        // 로컬 변수로 계산하여 로그/메시지에서 정확한 값 사용 (try/catch 블록 모두에서 사용)
        const nextRetryCount = isRetry ? retryCount + 1 : retryCount;
        
        try {
          // 재시도 횟수 체크 (개발 환경에서는 제한 없음)
          if (!import.meta.env.DEV && nextRetryCount >= MAX_RETRY_COUNT) {
            setStatus('error');
            setErrorMessage(
              '결제 승인 요청이 너무 많이 시도되었습니다.\n' +
              '고객센터로 문의하시거나 잠시 후 다시 시도해주세요.'
            );
            return;
          }

          if (isRetry) {
            setRetryCount(nextRetryCount);
          }

          console.log('[PaymentSuccessPage] 토스페이먼츠 결제 승인 요청', {
            tossOrderId,
            internalOrderId,
            originalOrderId: orderId,
            amount: Number(amount),
            paymentKey,
            retryCount: nextRetryCount,
            isRetry,
          });

          /**
           * ⚠️ 중요: paymentKey는 토스페이먼츠 결제 위젯에서 결제 성공 시 생성되는 고유 키입니다.
           * - 이 키는 토스페이먼츠 서버에서 결제 위젯이 성공적으로 처리된 후에만 생성됩니다.
           * - 서버에서는 이 값을 생성하거나 추측할 수 없습니다.
           * - 프론트엔드에서 토스 결제 위젯의 성공 콜백 또는 리다이렉트 URL의 쿼리 파라미터로만 획득 가능합니다.
           * - pgToken은 토스페이먼츠에서는 사용하지 않으므로 보내지 않습니다.
           * 
           * ⚠️ order_id와 toss_order_id 구분:
           * - order_id: 내부 주문 ID (숫자 문자열, 백엔드에서 getOrderIdAsLong()으로 변환)
           * - toss_order_id: Toss Payments 위젯에서 사용한 orderId (ORDER-{내부주문ID}-{timestamp})
           * - 백엔드는 toss_order_id가 있으면 이를 Toss Payments API에 전달하고,
           *   없으면 payment.getId()를 사용합니다.
           */
          if (!internalOrderId) {
            setStatus('error');
            setErrorMessage('내부 주문 ID를 찾을 수 없습니다.');
            return;
          }

          const response = await paymentApi.confirmPayment({
            order_id: internalOrderId, // 내부 주문 ID (숫자 문자열)
            amount: Number(amount),
            payment_key: paymentKey,
            toss_order_id: tossOrderId, // Toss Payments용 orderId
            // pgToken은 토스페이먼츠에서 사용하지 않음
          });

          if (!response.data.success) {
            throw new Error(response.data.error?.message || '결제 승인에 실패했습니다.');
          }

          // 성공 시 재시도 카운터 리셋
          setRetryCount(0);

          setPaymentData({
            orderId: internalOrderId || tossOrderId, // UI에는 내부 주문 ID 표시
            amount: Number(amount),
          });
          setStatus('success');

          // URL 정리 (뒤로 가기 / 리렌더 재호출 방지)
          window.history.replaceState({}, '', '/payment/success');

          // 카운트다운 시작
          startCountdownAndNavigate();
        } catch (error) {
          console.error('[PaymentSuccessPage] 토스페이먼츠 결제 승인 오류:', error);
          
          const message =
            error instanceof Error ? error.message : '결제 승인 중 오류가 발생했습니다.';
          
          // 재시도 가능 여부에 따른 메시지 추가
          // setRetryCount가 비동기이므로, 실제 증가된 값을 사용하기 위해 nextRetryCount 사용
          const retryMessage = import.meta.env.DEV
            ? `${message}\n\n[개발 모드] 재시도 ${nextRetryCount}회`
            : nextRetryCount >= MAX_RETRY_COUNT
            ? `${message}\n\n재시도 횟수를 초과했습니다. 고객센터로 문의해주세요.`
            : `${message}\n\n(재시도 가능: ${MAX_RETRY_COUNT - nextRetryCount}회 남음)`;
          
          setStatus('error');
          setErrorMessage(retryMessage);
        }
      } else {
        setStatus('error');
        setErrorMessage('결제 정보가 올바르지 않습니다. (paymentKey 또는 pg_token이 필요합니다)');
      }
  };

  useEffect(() => {
    // 이미 실행됐으면 즉시 종료
    if (calledRef.current) return;
    calledRef.current = true;

    handleConfirmPayment(false);

    // cleanup: 컴포넌트 unmount 시 interval 정리
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // navigate는 안정적이므로 의존성에서 제외

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {status === 'confirming' && (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-20 h-20 text-violet-600 animate-spin" />
                <div className="absolute inset-0 rounded-full border-4 border-violet-100"></div>
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-neutral-900">결제 승인 중</h2>
              <p className="text-neutral-500 text-lg">잠시만 기다려 주세요...</p>
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-full">
                  <div className="w-2 h-2 bg-violet-600 rounded-full animate-pulse"></div>
                  <span className="text-sm text-violet-700 font-medium">처리 중</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && paymentData && (
          <div className="text-center space-y-6 py-4">
            {/* 성공 아이콘 */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500">
                  <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            {/* 성공 메시지 */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-neutral-900">결제가 완료되었습니다</h2>
              <p className="text-neutral-500">감사합니다. 결제가 성공적으로 처리되었습니다.</p>
            </div>

            {/* 결제 정보 카드 */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-violet-700">
                  <Receipt className="w-5 h-5" />
                  <span className="font-semibold">결제 정보</span>
                </div>
                
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center py-2 border-b border-violet-200">
                    <span className="text-neutral-600 font-medium">결제 수단</span>
                    <span className="text-neutral-900 font-semibold">
                      {paymentMethod === 'kakao' ? '카카오페이' : '토스페이먼츠'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-violet-200">
                    <span className="text-neutral-600 font-medium">주문 번호</span>
                    <span className="text-neutral-900 font-mono text-sm">#{paymentData.orderId}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-neutral-600 font-medium">결제 금액</span>
                    <span className="text-2xl font-bold text-violet-700">
                      {formatAmount(paymentData.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-blue-700">
                {countdown > 0 ? (
                  <span>{countdown}초 후 결제 내역 페이지로 이동합니다...</span>
                ) : (
                  <span>이동 중...</span>
                )}
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate('/payments')}
                className="flex-1 py-3.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Receipt className="w-5 h-5" />
                결제 내역 보기
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3.5 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                홈으로
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-6 py-4">
            {/* 에러 아이콘 */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500">
                <AlertCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* 에러 메시지 */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-neutral-900">결제에 실패했습니다</h2>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-sm text-red-700 whitespace-pre-line text-left">{errorMessage}</p>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
              <p className="text-sm text-neutral-600">
                문제가 지속되면 고객센터로 문의해 주세요.
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-2">
              {import.meta.env.DEV || retryCount < MAX_RETRY_COUNT ? (
                <button
                  onClick={async () => {
                    if (isRetrying) return; // 이미 재시도 중이면 무시
                    
                    // 재시도 시 상태를 'confirming'으로 변경하고 결제 승인 로직 다시 실행
                    setIsRetrying(true);
                    setStatus('confirming');
                    setErrorMessage('');
                    // 재시도 버튼 클릭 시 재시도 횟수는 handleConfirmPayment 내부에서 증가
                    try {
                      await handleConfirmPayment(true);
                    } finally {
                      setIsRetrying(false);
                    }
                  }}
                  disabled={isRetrying}
                  className="flex-1 py-3.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-5 h-5" />
                  {isRetrying 
                    ? '재시도 중...' 
                    : import.meta.env.DEV 
                      ? `다시 시도 (${retryCount + 1}회)` 
                      : `다시 시도 (${retryCount + 1}/${MAX_RETRY_COUNT})`}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/payments')}
                  className="flex-1 py-3.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Receipt className="w-5 h-5" />
                  결제 내역 보기
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3.5 bg-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-300 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                홈으로
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
