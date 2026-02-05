import { PaymentMethod } from '../types/payment.types';

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  onSelectMethod,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      method: PaymentMethod.TOSS,
      name: '토스페이먼츠',
      description: '간편하고 안전한 결제',
      icon: (
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          T
        </div>
      ),
    },
    {
      method: PaymentMethod.KAKAO_PAY,
      name: '카카오페이',
      description: '카카오톡으로 쉽고 편하게',
      icon: (
        <div className="w-12 h-12 bg-[#FEE500] rounded-xl flex items-center justify-center">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.87 5.33 4.67 6.77l-.95 3.53c-.05.18.15.34.32.24l4.12-2.72c.59.08 1.2.13 1.84.13 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
          </svg>
        </div>
      ),
    },
    {
      method: PaymentMethod.PAYPAL,
      name: 'PayPal',
      description: '전 세계에서 사용 가능',
      icon: (
        <div className="w-12 h-12 bg-[#0070BA] rounded-xl flex items-center justify-center text-white font-bold text-xl">
          P
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-neutral-900 mb-3">
        결제 수단 선택
      </label>

      {paymentMethods.map(({ method, name, description, icon }) => (
        <button
          type="button"
          key={method}
          onClick={() => onSelectMethod(method)}
          disabled={disabled}
          className="w-full flex items-center gap-4 p-4 border-2 border-neutral-200 rounded-xl hover:border-violet-400 hover:bg-violet-50/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          aria-label={`${name}로 결제하기`}
        >
          {icon}
          <div className="flex-1 text-left">
            <div className="font-semibold text-neutral-900 group-hover:text-violet-700">
              {name}
            </div>
            <div className="text-sm text-neutral-500">{description}</div>
          </div>
          <svg
            className="w-5 h-5 text-neutral-400 group-hover:text-violet-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
