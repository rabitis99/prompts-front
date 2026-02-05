import { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { PaymentMethod, PaymentUserType, UserTier } from '../types/payment.types';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { TossPaymentForm } from './TossPaymentForm';
import { KakaoPayButton } from './KakaoPayButton';
import { PaypalButton } from './PaypalButton';

// PayPal 설정
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
const paypalOptions = {
  clientId: PAYPAL_CLIENT_ID,
  currency: 'USD',
  intent: 'capture',
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  amount: number;
  currency?: string;
  tier?: UserTier; // 결제할 티어 (TierInfoView에서 전달)
  onPaymentSuccess?: (paymentId: number) => void;
  onPaymentError?: (error: string) => void;
}

type PaymentState = 'select' | 'processing' | 'success' | 'error';

export function PaymentModal({
  isOpen,
  onClose,
  productName,
  amount,
  currency = 'KRW',
  tier,
  onPaymentSuccess,
  onPaymentError,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [userType, setUserType] = useState<PaymentUserType>(PaymentUserType.PERSONAL);
  const [paymentState, setPaymentState] = useState<PaymentState>('select');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successPaymentId, setSuccessPaymentId] = useState<number | null>(null);

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(null);
      setUserType(PaymentUserType.PERSONAL);
      setPaymentState('select');
      setErrorMessage('');
      setSuccessPaymentId(null);
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && paymentState !== 'processing') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, paymentState, onClose]);

  // Body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSuccess = (paymentId: number) => {
    setPaymentState('success');
    setSuccessPaymentId(paymentId);
    onPaymentSuccess?.(paymentId);
  };

  const handleError = (error: string) => {
    setPaymentState('error');
    setErrorMessage(error);
    onPaymentError?.(error);
  };

  const handleCloseModal = () => {
    if (paymentState === 'processing') {
      return; // 결제 처리 중에는 모달 닫기 방지
    }
    onClose();
  };

  const handleRetry = () => {
    setPaymentState('select');
    setErrorMessage('');
    setSelectedMethod(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCloseModal}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col z-[101] max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-600" />
            <h2 id="payment-modal-title" className="text-xl font-bold text-neutral-900">
              결제하기
            </h2>
          </div>
          <button
            onClick={handleCloseModal}
            disabled={paymentState === 'processing'}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 결제 성공 화면 */}
          {paymentState === 'success' && successPaymentId && (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-900">결제가 완료되었습니다</h3>
                <p className="text-neutral-500">
                  결제 ID: <span className="font-mono text-sm">#{successPaymentId}</span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
              >
                확인
              </button>
            </div>
          )}

          {/* 결제 실패 화면 */}
          {paymentState === 'error' && (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-900">결제에 실패했습니다</h3>
                <p className="text-sm text-neutral-600">{errorMessage}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                >
                  다시 시도
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-neutral-200 text-neutral-900 rounded-xl font-medium hover:bg-neutral-300 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          )}

          {/* 결제 진행 화면 */}
          {(paymentState === 'select' || paymentState === 'processing') && (
            <>
              {/* 상품 정보 */}
              <div className="mb-6 p-4 bg-neutral-50 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-600">상품명</span>
                  <span className="text-base font-semibold text-neutral-900">{productName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-600">결제 금액</span>
                  <span className="text-xl font-bold text-violet-600">
                    {currency === 'KRW' && `₩${amount.toLocaleString()}`}
                    {currency === 'USD' && `$${amount.toFixed(2)}`}
                    {currency === 'EUR' && `€${amount.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* 사용자 타입 선택 */}
              <div className="mb-6 space-y-2">
                <label className="block text-sm font-medium text-neutral-700">결제 유형</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType(PaymentUserType.PERSONAL)}
                    disabled={paymentState === 'processing'}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      userType === PaymentUserType.PERSONAL
                        ? 'bg-violet-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    개인
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType(PaymentUserType.BUSINESS)}
                    disabled={paymentState === 'processing'}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      userType === PaymentUserType.BUSINESS
                        ? 'bg-violet-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    사업자
                  </button>
                </div>
              </div>

              {/* 결제 수단 선택 */}
              {!selectedMethod ? (
                <PaymentMethodSelector
                  onSelectMethod={setSelectedMethod}
                  disabled={paymentState === 'processing'}
                />
              ) : (
                <div className="space-y-4">
                  {/* 선택된 결제 수단 표시 */}
                  <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-200 rounded-xl">
                    <span className="text-sm font-medium text-violet-900">
                      {selectedMethod === PaymentMethod.TOSS && '토스페이먼츠'}
                      {selectedMethod === PaymentMethod.KAKAO_PAY && '카카오페이'}
                      {selectedMethod === PaymentMethod.PAYPAL && 'PayPal'}
                    </span>
                    <button
                      onClick={() => setSelectedMethod(null)}
                      disabled={paymentState === 'processing'}
                      className="text-sm text-violet-600 hover:text-violet-700 font-medium disabled:opacity-50"
                    >
                      변경
                    </button>
                  </div>

                  {/* 결제 폼 */}
                  {selectedMethod === PaymentMethod.TOSS && (
                    <TossPaymentForm
                      amount={amount}
                      currency={currency}
                      productName={productName}
                      userType={userType}
                      tier={tier}
                      onSuccess={handleSuccess}
                      onError={handleError}
                      onProcessingChange={(processing) =>
                        setPaymentState(processing ? 'processing' : 'select')
                      }
                    />
                  )}

                  {selectedMethod === PaymentMethod.KAKAO_PAY && (
                    <KakaoPayButton
                      amount={amount}
                      currency={currency}
                      productName={productName}
                      userType={userType}
                      tier={tier}
                      onSuccess={handleSuccess}
                      onError={handleError}
                      onProcessingChange={(processing) =>
                        setPaymentState(processing ? 'processing' : 'select')
                      }
                    />
                  )}

                  {selectedMethod === PaymentMethod.PAYPAL && (
                    <PayPalScriptProvider options={paypalOptions}>
                      <PaypalButton
                        amount={amount}
                        currency={currency}
                        productName={productName}
                        userType={userType}
                        tier={tier}
                        onSuccess={handleSuccess}
                        onError={handleError}
                        onProcessingChange={(processing) =>
                          setPaymentState(processing ? 'processing' : 'select')
                        }
                      />
                    </PayPalScriptProvider>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {paymentState !== 'success' && paymentState !== 'error' && (
          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <CreditCard className="w-4 h-4" />
              <span>안전한 결제를 위해 암호화된 연결을 사용합니다</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
