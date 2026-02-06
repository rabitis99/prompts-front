import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { paymentApi } from '../api/payment.api';
import { PaymentMethod, PaymentUserType, UserTier } from '../types/payment.types';

// 토스페이먼츠 클라이언트 키 (환경변수에서 로드)
const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || '';

interface TossPaymentFormProps {
  amount: number;
  currency: string;
  productName: string;
  userType?: PaymentUserType; // PaymentModal에서 전달받은 userType
  tier?: UserTier; // PaymentModal에서 전달받은 tier (업그레이드할 티어)
  onSuccess: (paymentId: number) => void; // 토스페이먼츠는 리다이렉트 방식이라 실제로 호출되지 않음
  onError: (error: string) => void;
  onProcessingChange: (processing: boolean) => void;
}

export function TossPaymentForm({
  amount,
  currency,
  productName,
  userType: propUserType,
  tier: propTier,
  onSuccess: _onSuccess, // 토스페이먼츠는 리다이렉트 방식이라 사용되지 않음
  onError,
  onProcessingChange,
}: TossPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [userType, setUserType] = useState<PaymentUserType>(
    propUserType || PaymentUserType.PERSONAL
  );
  const [userTier, setUserTier] = useState<UserTier>(propTier || UserTier.FREE);

  // propUserType이 변경되면 내부 state도 업데이트
  useEffect(() => {
    if (propUserType) {
      setUserType(propUserType);
    }
  }, [propUserType]);

  // 사용자 티어 정보 로드 (propTier가 없을 때만)
  useEffect(() => {
    if (propTier) {
      setUserTier(propTier);
      return;
    }
    
    const loadTier = async () => {
      try {
        const response = await paymentApi.getMyTierInfo();
        if (response.data.data) {
          setUserTier(response.data.data.tier);
        }
      } catch (error) {
        console.error('[TossPaymentForm] 티어 정보 로드 실패:', error);
        // 실패 시 기본값 유지
      }
    };
    loadTier();
  }, [propTier]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 토스(국내 결제) 정책상 원화 결제만 지원하도록 가드
    if (currency !== 'KRW') {
      onError(`토스페이먼츠는 KRW만 지원합니다. 현재 통화: ${currency}`);
      return;
    }

    if (!customerName.trim()) {
      onError('이름을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim() || !emailRegex.test(customerEmail)) {
      onError('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    onProcessingChange(true);

    try {
      console.log('[TossPaymentForm] 결제 요청 시작', { amount, currency, productName });
      
      // 1. 백엔드에 결제 요청
      const response = await paymentApi.requestPayment({
        amount,
        currency,
        payment_method: PaymentMethod.TOSS,
        user_type: userType,
        metadata: JSON.stringify({
          product_name: productName,
          customer_name: customerName,
          customer_email: customerEmail,
        }),
      });

      console.log('[TossPaymentForm] 백엔드 응답', response.data);

      if (!response.data.success || !response.data.data) {
        const errorMessage = response.data.error?.message || '결제 요청에 실패했습니다.';
        throw new Error(errorMessage);
      }

      const paymentData = response.data.data;
      console.log('[TossPaymentForm] 결제 데이터', paymentData);

      // 2. 토스페이먼츠 SDK 로드 및 결제창 호출
      if (!TOSS_CLIENT_KEY) {
        console.error('[TossPaymentForm] TOSS_CLIENT_KEY 없음');
        throw new Error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다. .env 파일에 VITE_TOSS_CLIENT_KEY를 설정하세요.');
      }

      console.log('[TossPaymentForm] 토스페이먼츠 SDK 로드 시작');
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      console.log('[TossPaymentForm] 토스페이먼츠 SDK 로드 완료');

      // amount를 number로 변환 (BigDecimal이 올 수 있음)
      const paymentAmount = typeof paymentData.amount === 'number' 
        ? paymentData.amount 
        : Number(paymentData.amount);

      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        throw new Error(`유효하지 않은 결제 금액입니다: ${paymentData.amount}`);
      }

      /**
       * Toss Payments용 orderId 생성
       * 
       * 요구사항:
       * 1. 결제 시도 단위로 유니크해야 함 (재시도 시 새로운 orderId 필요)
       * 2. 내부 주문 ID는 유지하되, Toss 결제용 orderId는 별도로 생성
       * 3. 사람이 보기에 의미를 추적할 수 있는 포맷
       * 
       * 포맷: ORDER-{내부주문ID}-{timestamp}
       * 예시: ORDER-123-1704067200000
       * 
       * Toss Payments orderId 정책:
       * - 영문 대소문자, 숫자, 특수문자(-, _)만 허용
       * - 6자 이상 64자 이하
       */
      const internalOrderId = paymentData.id;
      const timestamp = Date.now();
      const tossOrderId = `ORDER-${internalOrderId}-${timestamp}`;

      console.log('[TossPaymentForm] Toss 결제용 orderId 생성', {
        internalOrderId,
        tossOrderId,
        timestamp,
      });

      console.log('[TossPaymentForm] 결제창 호출', {
        amount: paymentAmount,
        orderId: tossOrderId,
        internalOrderId,
        orderName: productName,
        // PII 보호: 고객 정보는 로그에서 제외
      });

      /**
       * 토스페이먼츠 결제 위젯 호출
       * 
       * ⚠️ 중요: paymentKey는 토스페이먼츠 결제 위젯에서 결제 성공 시 생성되는 고유 키입니다.
       * - 이 키는 토스페이먼츠 서버에서 결제 위젯이 성공적으로 처리된 후에만 생성됩니다.
       * - 서버에서는 이 값을 생성하거나 추측할 수 없습니다.
       * - 프론트엔드에서 토스 결제 위젯의 성공 콜백 또는 리다이렉트 URL의 쿼리 파라미터로만 획득 가능합니다.
       * - 결제 성공 시 successUrl로 리다이렉트되며, URL 파라미터로 orderId, paymentKey, amount가 전달됩니다.
       * - PaymentSuccessPage에서 이 값들을 추출하여 백엔드 /api/payments/confirm로 POST 요청합니다.
       * - pgToken은 토스페이먼츠에서 사용하지 않으므로 보내지 않습니다.
       */
      await tossPayments.requestPayment('카드', {
        amount: paymentAmount,
        orderId: tossOrderId,
        orderName: productName,
        customerName,
        customerEmail,
        successUrl: `${window.location.origin}/payment/success?orderId=${tossOrderId}&internalOrderId=${internalOrderId}&amount=${paymentAmount}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });

      console.log('[TossPaymentForm] 결제창 호출 완료 (리다이렉트 예정)');

      // 주의: 이 아래 코드는 실행되지 않습니다.
      // 토스페이먼츠 결제창이 열리면서 페이지가 이동하기 때문입니다.
      // 실제 결제 승인은 successUrl(PaymentSuccessPage)에서 처리됩니다.
    } catch (error) {
      console.error('[TossPaymentForm] 결제 오류 발생:', error);
      // 개발 환경에서만 상세 스택 트레이스 로깅
      if (import.meta.env.DEV) {
        console.error('[TossPaymentForm] 에러 상세:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        });
      }
      // 프로덕션 환경에서는 Sentry, DataDog 등의 에러 리포팅 서비스로 전송하는 것을 권장합니다.
      // 예: Sentry.captureException(error);
      
      const errorMessage =
        error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.';
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
      onProcessingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 이름 */}
      <div className="space-y-2">
        <label htmlFor="customer-name" className="block text-sm font-medium text-neutral-700">
          이름
        </label>
        <input
          id="customer-name"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="홍길동"
          disabled={isProcessing}
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all disabled:bg-neutral-50 disabled:cursor-not-allowed"
          required
          aria-label="고객 이름"
        />
      </div>

      {/* 이메일 */}
      <div className="space-y-2">
        <label htmlFor="customer-email" className="block text-sm font-medium text-neutral-700">
          이메일
        </label>
        <input
          id="customer-email"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="example@email.com"
          disabled={isProcessing}
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all disabled:bg-neutral-50 disabled:cursor-not-allowed"
          required
          aria-label="이메일 주소"
        />
      </div>

      {/* 사용자 타입 - PaymentModal에서 선택하므로 여기서는 표시만 */}
      {propUserType && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">결제 유형</label>
          <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl">
            <span className="text-sm font-medium text-violet-900">
              {userType === PaymentUserType.PERSONAL ? '개인' : '사업자'}
            </span>
          </div>
        </div>
      )}

      {/* 결제 버튼 */}
      <button
        type="submit"
        disabled={isProcessing || !customerName.trim() || !customerEmail.trim()}
        className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            처리 중...
          </>
        ) : (
          <>
            {currency === 'KRW' ? `₩${amount.toLocaleString()}` : `$${amount.toFixed(2)}`} 결제하기
          </>
        )}
      </button>

      {/* 안내 메시지 */}
      <p className="text-xs text-center text-neutral-500">
        토스페이먼츠 결제창으로 이동합니다
      </p>

      {/* 환경 변수 경고 */}
      {!TOSS_CLIENT_KEY && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ 토스페이먼츠 클라이언트 키가 설정되지 않았습니다.
            <br />
            .env 파일에 <code className="bg-yellow-100 px-1 rounded">VITE_TOSS_CLIENT_KEY</code>를 추가하세요.
          </p>
        </div>
      )}
    </form>
  );
}
