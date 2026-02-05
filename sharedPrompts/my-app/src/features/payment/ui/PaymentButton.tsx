import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

interface PaymentButtonProps {
  productName: string;
  amount: number;
  currency?: string;
  className?: string;
  onPaymentSuccess?: (paymentId: number) => void;
  onPaymentError?: (error: string) => void;
}

/**
 * 결제 버튼 컴포넌트
 * 
 * 간단하게 결제 모달을 열 수 있는 버튼입니다.
 * 
 * @example
 * ```tsx
 * <PaymentButton
 *   productName="Premium Plan"
 *   amount={29900}
 *   currency="KRW"
 *   onPaymentSuccess={(paymentId) => {
 *     console.log('결제 성공:', paymentId);
 *   }}
 * />
 * ```
 */
export function PaymentButton({
  productName,
  amount,
  currency = 'KRW',
  className = '',
  onPaymentSuccess,
  onPaymentError,
}: PaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors ${className}`}
      >
        <CreditCard className="w-5 h-5" />
        결제하기
      </button>

      <PaymentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productName={productName}
        amount={amount}
        currency={currency}
        onPaymentSuccess={(paymentId) => {
          setIsOpen(false);
          onPaymentSuccess?.(paymentId);
        }}
        onPaymentError={onPaymentError}
      />
    </>
  );
}

