import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { paymentApi } from '../api/payment.api';
import { UserTier } from '../types/payment.types';
import type { TierInfoResponseDto, UserTierHistoryResponseDto } from '../types/payment.types';
import { LoadingState, EmptyState } from '@/shared/components';
import { PaymentModal } from './PaymentModal';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const TIER_LABELS: Record<string, string> = {
  FREE: '무료',
  PRO: '프로',
  PREMIUM: '프리미엄',
};

const TIER_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-800',
  PRO: 'bg-blue-100 text-blue-800',
  PREMIUM: 'bg-purple-100 text-purple-800',
};

// 티어별 가격 정보
const TIER_PRICING: Record<UserTier, { name: string; amount: number; description: string }> = {
  FREE: { name: '무료', amount: 0, description: '일일 15회 사용' },
  PRO: { name: '프로', amount: 9900, description: '일일 100회 사용' },
  PREMIUM: { name: '프리미엄', amount: 29900, description: '일일 300회 사용' },
};

// 다음 티어 정보
const getNextTier = (currentTier: UserTier): UserTier | null => {
  switch (currentTier) {
    case UserTier.FREE:
      return UserTier.PRO;
    case UserTier.PRO:
      return UserTier.PREMIUM;
    case UserTier.PREMIUM:
      return null; // 최고 티어
    default:
      return null;
  }
};

export function TierInfoView() {
  const [tierInfo, setTierInfo] = useState<TierInfoResponseDto | null>(null);
  const [history, setHistory] = useState<UserTierHistoryResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const loadTierInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentApi.getMyTierInfo();
      setTierInfo(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '티어 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (pageNum: number) => {
    try {
      setHistoryLoading(true);
      const response = await paymentApi.getMyTierHistory(pageNum, 20);
      const data = response.data.data;
      
      if (pageNum === 0) {
        setHistory(data.content);
      } else {
        setHistory((prev) => [...prev, ...data.content]);
      }
      
      setHasMore(!data.last);
    } catch (err: any) {
      console.error('티어 변경 이력 조회 실패:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadTierInfo();
    loadHistory(0);
  }, []);

  const handleLoadMore = () => {
    if (!historyLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadHistory(nextPage);
    }
  };

  if (loading) {
    return <LoadingState message="티어 정보를 불러오는 중..." />;
  }

  if (error || !tierInfo) {
    return (
      <div className="p-4">
        <div className="text-red-600 mb-4">
          {error || '티어 정보를 불러올 수 없습니다.'}
        </div>
        <button
          onClick={loadTierInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const usagePercent = tierInfo.daily_limit > 0 
    ? (tierInfo.today_used_count / tierInfo.daily_limit) * 100 
    : 0;

  const nextTier = getNextTier(tierInfo.tier);
  const nextTierInfo = nextTier ? TIER_PRICING[nextTier] : null;

  const handlePaymentSuccess = (paymentId: number) => {
    console.log('결제 성공:', paymentId);
    setIsPaymentModalOpen(false);
    // 티어 정보 새로고침
    loadTierInfo();
    loadHistory(0);
  };

  return (
    <div className="p-4 space-y-6">
      {/* 현재 티어 정보 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="text-sm opacity-90 mb-2">현재 티어</div>
        <div className="text-3xl font-bold mb-2">
          {TIER_LABELS[tierInfo.tier] || tierInfo.tier}
        </div>
        <div className="text-sm opacity-90">{tierInfo.tier_description}</div>
      </div>

      {/* 티어 업그레이드 섹션 */}
      {nextTierInfo && (
        <div className="border-2 border-violet-200 rounded-lg p-6 bg-gradient-to-br from-violet-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">
                {nextTierInfo.name}로 업그레이드
              </h3>
              <p className="text-sm text-neutral-600">{nextTierInfo.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-violet-600">
                ₩{nextTierInfo.amount.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500">/월</div>
            </div>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            결제하기
          </button>
        </div>
      )}

      {/* 최고 티어 안내 */}
      {!nextTierInfo && tierInfo.tier === UserTier.PREMIUM && (
        <div className="border-2 border-yellow-200 rounded-lg p-6 bg-gradient-to-br from-yellow-50 to-amber-50">
          <div className="text-center">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              최고 등급입니다!
            </h3>
            <p className="text-sm text-neutral-600">
              프리미엄 플랜의 모든 혜택을 이용하고 계십니다.
            </p>
          </div>
        </div>
      )}

      {/* 일일 사용량 */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">일일 사용량</span>
          <span className="text-sm text-gray-600">
            {tierInfo.today_used_count} / {tierInfo.daily_limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all ${
              usagePercent >= 100
                ? 'bg-red-500'
                : usagePercent >= 80
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
        <div className="text-sm text-gray-600">
          남은 횟수: <span className="font-semibold">{tierInfo.remaining_count}회</span>
        </div>
      </div>

      {/* 티어 변경 이력 */}
      <div>
        <h3 className="text-lg font-bold mb-4">티어 변경 이력</h3>
        {history.length === 0 ? (
          <EmptyState message="티어 변경 이력이 없습니다." />
        ) : (
          <>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        TIER_COLORS[item.previous_tier] || 'bg-gray-100'
                      }`}
                    >
                      {TIER_LABELS[item.previous_tier] || item.previous_tier}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        TIER_COLORS[item.new_tier] || 'bg-gray-100'
                      }`}
                    >
                      {TIER_LABELS[item.new_tier] || item.new_tier}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(item.created_at), 'yyyy년 MM월 dd일 HH:mm', {
                      locale: ko,
                    })}
                  </div>
                  {item.reason && (
                    <div className="text-sm text-gray-500 mt-1">{item.reason}</div>
                  )}
                </div>
              ))}
            </div>

            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={historyLoading}
                className="w-full py-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 mt-4"
              >
                {historyLoading ? '로딩 중...' : '더 보기'}
              </button>
            )}
          </>
        )}
      </div>

      {/* 결제 모달 */}
      {nextTierInfo && nextTier && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          productName={`${nextTierInfo.name} 플랜`}
          amount={nextTierInfo.amount}
          currency="KRW"
          tier={nextTier}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={(error) => {
            console.error('결제 실패:', error);
          }}
        />
      )}
    </div>
  );
}

