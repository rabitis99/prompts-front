import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { paymentApi } from '../api/payment.api';
import { PaymentMethod, PaymentUserType, UserTier } from '../types/payment.types';

interface PaypalButtonProps {
  amount: number;
  currency: string;
  productName: string;
  userType?: PaymentUserType; // PaymentModal에서 전달받은 userType
  tier?: UserTier; // PaymentModal에서 전달받은 tier (업그레이드할 티어)
  onSuccess: (paymentId: number) => void;
  onError: (error: string) => void;
  onProcessingChange: (processing: boolean) => void;
}

export function PaypalButton({
  amount,
  currency,
  productName,
  userType = PaymentUserType.PERSONAL, // 기본값은 PERSONAL
  tier: propTier,
  onSuccess,
  onError,
  onProcessingChange,
}: PaypalButtonProps) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [backendPaymentId, setBackendPaymentId] = useState<number | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [userTier, setUserTier] = useState<UserTier>(propTier || UserTier.FREE);
  const [isTierLoading, setIsTierLoading] = useState(!propTier); // propTier가 없으면 로딩 중

  // 사용자 티어 정보 로드 (propTier가 없을 때만)
  useEffect(() => {
    if (propTier) {
      setUserTier(propTier);
      setIsTierLoading(false);
      return;
    }
    
    const loadTier = async () => {
      try {
        const response = await paymentApi.getMyTierInfo();
        if (response.data.data) {
          setUserTier(response.data.data.tier);
        }
      } catch (error) {
        console.error('[PaypalButton] 티어 정보 로드 실패:', error);
        // 실패 시 기본값 유지
      } finally {
        setIsTierLoading(false);
      }
    };
    loadTier();
  }, [propTier]);

  // 컴포넌트 마운트 시 백엔드에 결제 정보 생성
  // 티어가 결정된 후에만 실행 (propTier가 있거나 티어 로딩이 완료된 경우)
  useEffect(() => {
    // 티어가 아직 로딩 중이면 결제 생성을 지연
    if (isTierLoading) {
      return;
    }

    const createPayment = async () => {
      setIsCreatingPayment(true);
      try {
        const response = await paymentApi.requestPayment({
          amount,
          currency,
          payment_method: PaymentMethod.PAYPAL,
          user_type: userType,
          tier: userTier,
          metadata: JSON.stringify({
            product_name: productName,
          }),
        });

        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || '결제 요청에 실패했습니다.');
        }

        setBackendPaymentId(response.data.data.id);
      } catch (error) {
        console.error('PayPal 결제 준비 오류:', error);
        const errorMessage =
          error instanceof Error ? error.message : '결제 준비 중 오류가 발생했습니다.';
        onError(errorMessage);
      } finally {
        setIsCreatingPayment(false);
      }
    };

    createPayment();
  }, [amount, currency, productName, userType, userTier, isTierLoading, onError]);

  if (isPending || isCreatingPayment) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-sm text-neutral-600">PayPal 로딩 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* PayPal 안내 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#0070BA] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-neutral-900 mb-1">PayPal로 안전하게 결제</h4>
            <p className="text-xs text-neutral-600">
              전 세계에서 사용 가능한 안전한 결제 서비스입니다. 신용카드나 PayPal 계정으로
              결제할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* PayPal 버튼 */}
      {backendPaymentId ? (
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay',
          }}
          createOrder={(_data, actions) => {
            // PayPal Order 생성
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount.toString(),
                    currency_code: currency,
                  },
                  description: productName,
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            onProcessingChange(true);
            try {
              if (!actions.order) {
                throw new Error('PayPal order actions not found');
              }

              // PayPal에서 결제 승인
              const order = await actions.order.capture();

              // 백엔드에 결제 완료 알림
              await paymentApi.confirmPayment({
                order_id: backendPaymentId.toString(),
                amount,
                payment_key: order.id,
              });

              onSuccess(backendPaymentId);
            } catch (error) {
              console.error('PayPal 승인 오류:', error);
              const errorMessage =
                error instanceof Error ? error.message : 'PayPal 결제 승인에 실패했습니다.';
              onError(errorMessage);
            } finally {
              onProcessingChange(false);
            }
          }}
          onError={(err) => {
            console.error('PayPal 에러:', err);
            onError('PayPal 결제 중 오류가 발생했습니다.');
            onProcessingChange(false);
          }}
          onCancel={() => {
            onError('PayPal 결제가 취소되었습니다.');
            onProcessingChange(false);
          }}
        />
      ) : (
        <div className="p-4 text-center text-sm text-neutral-500">
          결제 준비 중 오류가 발생했습니다.
        </div>
      )}

      {/* 지원 통화 안내 */}
      <div className="text-xs text-center text-neutral-500">
        <p>지원 통화: USD, EUR, GBP, JPY 등</p>
        <p className="mt-1">PayPal 계정 또는 신용카드로 결제 가능</p>
      </div>
    </div>
  );
}
