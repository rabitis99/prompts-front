/**
 * 결제 모달 사용 예제
 *
 * 이 컴포넌트는 PaymentModal의 사용 방법을 보여줍니다.
 * 실제 프로젝트에서는 필요에 맞게 수정하여 사용하세요.
 */

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export function PaymentExample() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    amount: number;
    currency: string;
  } | null>(null);

  const handleOpenPayment = (name: string, amount: number, currency: string = 'KRW') => {
    setSelectedPlan({ name, amount, currency });
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (paymentId: number) => {
    console.log('결제 성공:', paymentId);
    // 성공 후 처리 로직
    // 예: 백엔드에 결제 완료 알림, 사용자 등급 업그레이드 등
    alert(`결제가 완료되었습니다! (Payment ID: ${paymentId})`);
  };

  const handlePaymentError = (error: string) => {
    console.error('결제 실패:', error);
    // 에러 로깅, 사용자에게 에러 메시지 표시 등
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">결제 플랜 선택</h1>
        <p className="text-neutral-500">원하는 플랜을 선택하고 결제를 진행하세요</p>
      </div>

      {/* 플랜 카드들 */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className="border border-neutral-200 rounded-2xl p-6 hover:border-violet-400 transition-all">
          <h3 className="text-xl font-bold text-neutral-900 mb-2">Free</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold text-neutral-900">₩0</span>
            <span className="text-neutral-500">/월</span>
          </div>
          <ul className="space-y-2 mb-6 text-sm text-neutral-600">
            <li>✓ 기본 기능</li>
            <li>✓ 일일 15회 사용</li>
            <li>✓ 커뮤니티 지원</li>
          </ul>
          <button
            onClick={() => handleOpenPayment('Free Plan', 0, 'KRW')}
            className="w-full py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            disabled
          >
            <CreditCard className="w-4 h-4" />
            현재 플랜
          </button>
        </div>

        {/* Pro Plan */}
        <div className="border-2 border-violet-600 rounded-2xl p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-violet-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
              인기
            </span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">Pro</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold text-violet-600">₩9,900</span>
            <span className="text-neutral-500">/월</span>
          </div>
          <ul className="space-y-2 mb-6 text-sm text-neutral-600">
            <li>✓ 모든 기본 기능</li>
            <li>✓ 일일 100회 사용</li>
            <li>✓ 이메일 지원</li>
            <li>✓ 우선 처리</li>
          </ul>
          <button
            onClick={() => handleOpenPayment('Pro Plan', 9900, 'KRW')}
            className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            구매하기
          </button>
        </div>

        {/* Premium Plan */}
        <div className="border border-neutral-200 rounded-2xl p-6 hover:border-violet-400 transition-all">
          <h3 className="text-xl font-bold text-neutral-900 mb-2">Premium</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold text-neutral-900">₩29,900</span>
            <span className="text-neutral-500">/월</span>
          </div>
          <ul className="space-y-2 mb-6 text-sm text-neutral-600">
            <li>✓ 모든 프로 기능</li>
            <li>✓ 일일 300회 사용</li>
            <li>✓ 우선 지원</li>
            <li>✓ 고급 분석</li>
          </ul>
          <button
            onClick={() => handleOpenPayment('Premium Plan', 29900, 'KRW')}
            className="w-full py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            구매하기
          </button>
        </div>
      </div>

      {/* 결제 방법 안내 */}
      <div className="mt-12 p-6 bg-neutral-50 rounded-2xl">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">지원하는 결제 방법</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <div>
              <div className="font-medium text-neutral-900">토스페이먼츠</div>
              <div className="text-xs text-neutral-500">간편결제</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FEE500] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#191919">
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.87 5.33 4.67 6.77l-.95 3.53c-.05.18.15.34.32.24l4.12-2.72c.59.08 1.2.13 1.84.13 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-neutral-900">카카오페이</div>
              <div className="text-xs text-neutral-500">카카오톡 간편결제</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0070BA] rounded-lg flex items-center justify-center text-white font-bold">
              P
            </div>
            <div>
              <div className="font-medium text-neutral-900">PayPal</div>
              <div className="text-xs text-neutral-500">글로벌 결제</div>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 모달 */}
      {selectedPlan && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          productName={selectedPlan.name}
          amount={selectedPlan.amount}
          currency={selectedPlan.currency}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </div>
  );
}
