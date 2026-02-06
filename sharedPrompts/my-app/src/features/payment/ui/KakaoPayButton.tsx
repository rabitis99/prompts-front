import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { paymentApi } from '../api/payment.api';
import { PaymentMethod, PaymentUserType, UserTier } from '../types/payment.types';

interface KakaoPayButtonProps {
  amount: number;
  currency: string;
  productName: string;
  userType?: PaymentUserType; // PaymentModal에서 전달받은 userType
  tier?: UserTier; // PaymentModal에서 전달받은 tier (업그레이드할 티어)
  onSuccess: (paymentId: number) => void; // 카카오페이는 리다이렉트 방식이라 실제로 호출되지 않음
  onError: (error: string) => void;
  onProcessingChange: (processing: boolean) => void;
}

export function KakaoPayButton({
  amount,
  currency,
  productName,
  userType = PaymentUserType.PERSONAL, // 기본값은 PERSONAL
  tier: propTier,
  onSuccess: _onSuccess, // 카카오페이는 리다이렉트 방식이라 사용되지 않음
  onError,
  onProcessingChange,
}: KakaoPayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [userTier, setUserTier] = useState<UserTier>(propTier || UserTier.FREE);

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
        console.error('[KakaoPayButton] 티어 정보 로드 실패:', error);
        // 실패 시 기본값 유지
      }
    };
    loadTier();
  }, [propTier]);

  const handleKakaoPay = async () => {
    // 카카오페이는 원화(KRW) 결제만 지원 (프로젝트 정책)
    if (currency !== 'KRW') {
      onError(`카카오페이는 KRW만 지원합니다. 현재 통화: ${currency}`);
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      onError(`유효하지 않은 결제 금액입니다: ${amount}`);
      return;
    }

    setIsProcessing(true);
    onProcessingChange(true);

    try {
      console.log('[KakaoPayButton] 카카오페이 결제 요청 시작', { amount, currency, productName });

      // 1. 백엔드에 카카오페이 결제 준비 요청
      const requestData = {
        amount,
        currency,
        payment_method: PaymentMethod.KAKAO_PAY,
        user_type: userType,
        metadata: JSON.stringify({
          product_name: productName,
        }),
      };
      
      // 디버깅: 실제로 보내는 데이터 확인
      console.log('[KakaoPayButton] 백엔드로 전송할 요청 데이터:', JSON.stringify(requestData, null, 2));
      console.log('[KakaoPayButton] 데이터 타입 확인:', {
        amount: typeof amount,
        currency: typeof currency,
        payment_method: typeof requestData.payment_method,
        user_type: typeof requestData.user_type,
        metadata: typeof requestData.metadata,
      });
      
      const response = await paymentApi.requestPayment(requestData);

      console.log('[KakaoPayButton] 백엔드 응답', response.data);

      if (!response.data.success || !response.data.data) {
        const errorMessage = response.data.error?.message || '결제 요청에 실패했습니다.';
        throw new Error(errorMessage);
      }

      const paymentData = response.data.data;
      console.log('[KakaoPayButton] 결제 데이터', paymentData);

      // ⚠️ 백엔드가 approval_url에 파라미터를 포함하지 않는 경우를 대비해
      // orderId와 amount를 sessionStorage에 저장
      // PaymentSuccessPage에서 URL 파라미터가 없을 때 사용
      try {
        let tidFromMetadata: string | null = null;
        if (paymentData.metadata && typeof paymentData.metadata === 'string') {
          try {
            const parsed = JSON.parse(paymentData.metadata) as { tid?: string };
            tidFromMetadata = parsed?.tid ?? null;
          } catch {
            tidFromMetadata = null;
          }
        }

        const paymentInfo = {
          orderId: paymentData.id.toString(),
          amount: paymentData.amount,
          // tid는 카카오페이 준비 API 응답에서 찾기
          tid:
            (paymentData as any).tid ||
            (paymentData as any).external_payment_id ||
            tidFromMetadata ||
            null,
        };
        sessionStorage.setItem('kakao_payment_info', JSON.stringify(paymentInfo));
        console.log('[KakaoPayButton] 결제 정보를 sessionStorage에 저장', paymentInfo);
      } catch (e) {
        console.error('[KakaoPayButton] sessionStorage 저장 실패:', e);
      }

      /**
       * 카카오페이 결제 준비 API 호출 후 리다이렉트
       * 
       * ⚠️ 중요: pg_token은 카카오페이에서 결제 승인 후 리다이렉트할 때만 전달되는 1회성 토큰입니다.
       * - 이 토큰은 카카오페이 결제 페이지에서 사용자가 결제를 승인한 후에만 생성됩니다.
       * - 서버에서는 이 값을 생성하거나 추측할 수 없습니다.
       * - 프론트엔드에서 리다이렉트 URL의 쿼리 파라미터로만 획득 가능합니다.
       * - 승인 API 호출 후 즉시 무효화되므로, 프론트엔드에서 누락되면 결제 승인은 절대 성공할 수 없습니다.
       * 
       * 플로우:
       * 1. 백엔드에서 카카오페이 준비 API(/v1/payment/ready) 호출
       * 2. next_redirect_pc_url로 리다이렉트 (카카오페이 결제 페이지)
       * 3. 사용자가 결제 승인
       * 4. approval_url로 리다이렉트 (이 URL에 pg_token 포함)
       * 5. PaymentSuccessPage에서 pg_token 추출하여 백엔드 /api/payments/confirm로 POST 요청
       */

      // 2. 카카오페이 결제창으로 리다이렉트 URL 찾기
      // 백엔드에서 카카오페이 준비 API를 호출하고 redirect URL을 반환해야 함
      // 여러 위치에서 URL을 찾아봄:
      // - metadata.next_redirect_pc_url
      // - metadata.redirect_url
      // - metadata.kakao_redirect_url
      // - paymentData의 다른 필드

      let redirectUrl: string | null = null;

      // 방법 1: metadata에서 찾기
      if (paymentData.metadata) {
        try {
          const metadata = typeof paymentData.metadata === 'string' 
            ? JSON.parse(paymentData.metadata) 
            : paymentData.metadata;
          
          console.log('[KakaoPayButton] 파싱된 metadata', metadata);
          
          redirectUrl = 
            metadata.next_redirect_pc_url || 
            metadata.redirect_url || 
            metadata.kakao_redirect_url ||
            metadata.next_redirect_url;
        } catch (e) {
          console.error('[KakaoPayButton] metadata 파싱 실패:', e);
        }
      }

      // 방법 2: paymentData의 직접 필드에서 찾기 (백엔드가 다른 방식으로 반환할 수 있음)
      if (!redirectUrl) {
        redirectUrl = 
          (paymentData as any).redirect_url ||
          (paymentData as any).next_redirect_pc_url ||
          (paymentData as any).kakao_redirect_url;
      }

      console.log('[KakaoPayButton] 찾은 redirect URL', redirectUrl);

      if (redirectUrl) {
        /**
         * ⚠️ 중요: 백엔드에서 카카오페이 준비 API 호출 시 approval_url을 구성할 때
         * orderId와 amount를 쿼리 파라미터로 포함시켜야 합니다.
         * 
         * 예시:
         * approval_url: https://yourdomain.com/payment/success?orderId=123&tid=TID&amount=10000
         * 
         * 결제 승인 후 카카오페이가 이 URL로 리다이렉트하며 pg_token을 추가합니다:
         * https://yourdomain.com/payment/success?orderId=123&tid=TID&amount=10000&pg_token=TOKEN
         * 
         * PaymentSuccessPage에서 이 값들을 추출하여 백엔드 /api/payments/confirm로 POST 요청합니다.
         */
        console.log('[KakaoPayButton] 카카오페이 결제창으로 리다이렉트', redirectUrl);
        // 카카오페이 결제창으로 이동
        // 결제 완료 후 approval_url로 리다이렉트됨 (이 URL에 pg_token 포함)
        window.location.href = redirectUrl;
      } else {
        console.error('[KakaoPayButton] redirect URL을 찾을 수 없음', {
          paymentData,
          metadata: paymentData.metadata,
        });
        throw new Error(
          '백엔드에서 카카오페이 결제 URL을 반환하지 않았습니다.\n\n' +
          '백엔드에서 카카오페이 준비 API(/v1/payment/ready)를 호출하고 ' +
          'next_redirect_pc_url을 다음 중 하나의 위치에 포함해야 합니다:\n' +
          '- metadata.next_redirect_pc_url\n' +
          '- metadata.redirect_url\n' +
          '- paymentData.redirect_url\n\n' +
          '또한 approval_url을 구성할 때 orderId와 amount를 쿼리 파라미터로 포함시켜야 합니다.\n' +
          '예: /payment/success?orderId=123&tid=TID&amount=10000&pg_token=TOKEN\n\n' +
          '현재 응답 데이터를 확인하려면 브라우저 콘솔을 확인하세요.'
        );
      }

      // 주의: 이 아래 코드는 실행되지 않습니다.
      // 카카오페이 결제창으로 리다이렉트되기 때문입니다.
      // 실제 결제 승인은 approval_url(PaymentSuccessPage)에서 처리됩니다.
    } catch (error) {
      console.error('[KakaoPayButton] 카카오페이 결제 오류:', error);
      console.error('[KakaoPayButton] 에러 상세:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
      
      const errorMessage =
        error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.';
      onError(errorMessage);
      setIsProcessing(false);
      onProcessingChange(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 카카오페이 안내 */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#FEE500] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.87 5.33 4.67 6.77l-.95 3.53c-.05.18.15.34.32.24l4.12-2.72c.59.08 1.2.13 1.84.13 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-neutral-900 mb-1">카카오페이로 간편결제</h4>
            <p className="text-xs text-neutral-600">
              카카오톡에 등록된 결제 수단으로 안전하고 편리하게 결제할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 카카오페이 결제 버튼 */}
      <button
        onClick={handleKakaoPay}
        disabled={isProcessing}
        className="w-full py-3.5 bg-[#FEE500] text-[#191919] rounded-xl font-semibold hover:bg-[#FDD800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            카카오페이 결제창 호출 중...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.87 5.33 4.67 6.77l-.95 3.53c-.05.18.15.34.32.24l4.12-2.72c.59.08 1.2.13 1.84.13 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
            </svg>
            {currency === 'KRW' ? `₩${amount.toLocaleString()}` : `$${amount.toFixed(2)}`} 카카오페이로
            결제
          </>
        )}
      </button>

      {/* 안내 메시지 */}
      <p className="text-xs text-center text-neutral-500">
        카카오페이 결제창으로 이동하여 결제를 진행합니다
      </p>
    </div>
  );
}

