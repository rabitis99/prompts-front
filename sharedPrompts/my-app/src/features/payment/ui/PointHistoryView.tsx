import { useState, useEffect } from 'react';
import { pointApi } from '../api/point.api';
import type { PointResponseDto } from '../types/payment.types';
import { LoadingState, EmptyState } from '@/shared/components';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const POINT_TYPE_LABELS: Record<string, string> = {
  EARNED: '적립',
  USED: '사용',
  REFUNDED: '환불',
  USE: '사용',
};

const POINT_TYPE_COLORS: Record<string, string> = {
  EARNED: 'text-green-600',
  USED: 'text-red-600',
  REFUNDED: 'text-blue-600',
  USE: 'text-red-600',
};

const PAGE_SIZE = 20;

export function PointHistoryView() {
  const [points, setPoints] = useState<PointResponseDto[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPoints = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // 잔액 조회
      if (pageNum === 0) {
        const balanceResponse = await pointApi.getBalance();
        setBalance(balanceResponse.data.data.current_balance);
      }

      // 포인트 내역 조회
      const response = await pointApi.getPointHistory(pageNum, PAGE_SIZE);
      const data = response.data.data;
      
      if (pageNum === 0) {
        setPoints(data.content);
      } else {
        setPoints((prev) => [...prev, ...data.content]);
      }
      
      const isLast = data.last ?? data.content.length < PAGE_SIZE;
      setHasMore(!isLast);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        '포인트 내역을 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoints(0);
  }, []);

  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      try {
        await loadPoints(nextPage);
        // 성공한 경우에만 페이지 증가
        setPage(nextPage);
      } catch {
        // 실패 시 페이지는 증가하지 않음
      }
    }
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount.toLocaleString()}P`;
  };

  if (loading && points.length === 0) {
    return <LoadingState message="포인트 내역을 불러오는 중..." />;
  }

  if (error && points.length === 0) {
    return (
      <div className="p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => loadPoints(0)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {balance !== null && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">현재 포인트</div>
          <div className="text-3xl font-bold">{balance.toLocaleString()}P</div>
        </div>
      )}

      <h2 className="text-xl font-bold">포인트 내역</h2>
      
      {points.length === 0 ? (
        <EmptyState message="포인트 내역이 없습니다." />
      ) : (
        <>
          <div className="space-y-3">
            {points.map((point) => (
              <div
                key={point.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div
                      className={`font-semibold text-lg ${
                        POINT_TYPE_COLORS[point.type] || 'text-gray-800'
                      }`}
                    >
                      {formatAmount(point.amount)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {format(new Date(point.created_at), 'yyyy년 MM월 dd일 HH:mm', {
                        locale: ko,
                      })}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                    {POINT_TYPE_LABELS[point.type] || point.type}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  {point.description && <div>{point.description}</div>}
                  <div>잔액: {point.balance.toLocaleString()}P</div>
                  {point.expired && (
                    <div className="text-red-600">만료됨</div>
                  )}
                  {point.expired_at && !point.expired && (
                    <div className="text-gray-500">
                      만료일:{' '}
                      {format(new Date(point.expired_at), 'yyyy-MM-dd', {
                        locale: ko,
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full py-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? '로딩 중...' : '더 보기'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

