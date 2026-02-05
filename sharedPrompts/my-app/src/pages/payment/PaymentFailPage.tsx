import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Home, RefreshCw, HelpCircle } from 'lucide-react';

/**
 * 결제 실패 콜백 페이지
 *
 * 토스페이먼츠와 카카오페이 결제창에서 결제 실패 시 failUrl로 리다이렉트됩니다.
 *
 * URL 파라미터:
 * - code: 오류 코드
 * - message: 오류 메시지
 * - orderId: 주문 ID (선택)
 */
export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorCode = searchParams.get('code') || 'UNKNOWN_ERROR';
  const errorMessage = searchParams.get('message') || '결제 중 오류가 발생했습니다.';
  const orderId = searchParams.get('orderId');

  // 에러 코드에 따른 사용자 친화적 메시지
  const getErrorMessage = (code: string, message: string) => {
    const errorMessages: Record<string, string> = {
      'USER_CANCEL': '결제가 취소되었습니다.',
      'INVALID_CARD': '유효하지 않은 카드 정보입니다.',
      'INSUFFICIENT_FUNDS': '잔액이 부족합니다.',
      'CARD_EXPIRED': '카드 유효기간이 만료되었습니다.',
      'NETWORK_ERROR': '네트워크 오류가 발생했습니다.',
      'TIMEOUT': '결제 시간이 초과되었습니다.',
    };

    return errorMessages[code] || message || '결제 중 오류가 발생했습니다.';
  };

  const friendlyMessage = getErrorMessage(errorCode, errorMessage);

  // 에러 코드 설명
  const getErrorDescription = (code: string) => {
    const descriptions: Record<string, string> = {
      'USER_CANCEL': '사용자가 결제를 취소했습니다.',
      'INVALID_CARD': '카드 정보를 확인하고 다시 시도해 주세요.',
      'INSUFFICIENT_FUNDS': '카드 잔액을 확인하고 다시 시도해 주세요.',
      'CARD_EXPIRED': '카드 유효기간을 확인하고 다시 시도해 주세요.',
      'NETWORK_ERROR': '인터넷 연결을 확인하고 다시 시도해 주세요.',
      'TIMEOUT': '잠시 후 다시 시도해 주세요.',
    };

    return descriptions[code] || '다시 시도하거나 다른 결제 수단을 이용해 주세요.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-6 py-4">
          {/* 에러 아이콘 */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500">
                <AlertCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-neutral-900">결제에 실패했습니다</h2>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-base text-red-700 font-medium">{friendlyMessage}</p>
            </div>
            {getErrorDescription(errorCode) && (
              <p className="text-sm text-neutral-600">{getErrorDescription(errorCode)}</p>
            )}
          </div>

          {/* 주문 정보 (있는 경우) */}
          {orderId && (
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
              <div className="flex items-center justify-center gap-2 text-neutral-600 mb-2">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-medium">주문 번호</span>
              </div>
              <p className="text-sm font-mono text-neutral-900">#{orderId}</p>
            </div>
          )}

          {/* 에러 코드 정보 */}
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">오류 코드</span>
              <span className="font-mono text-neutral-700">{errorCode}</span>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900 mb-1">문제가 지속되나요?</p>
                <p className="text-xs text-blue-700">
                  고객센터로 문의하시면 빠르게 해결해 드리겠습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              다시 시도
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/payments')}
                className="flex-1 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
              >
                결제 내역
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                홈으로
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
