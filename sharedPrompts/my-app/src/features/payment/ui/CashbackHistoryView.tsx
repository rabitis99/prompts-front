import { useState, useEffect, useRef } from 'react';
import { cashbackApi } from '../api/cashback.api';
import type { CashbackResponseDto } from '../types/payment.types';
import { LoadingState, EmptyState } from '@/shared/components';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function CashbackHistoryView() {
  const [cashbacks, setCashbacks] = useState<CashbackResponseDto[]>([]);
  const [unpaidTotal, setUnpaidTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unpaid'>('all');
  // 요청 경합 방지를 위한 요청 ID 추적
  const requestIdRef = useRef(0);

  const loadCashbacks = async (pageNum: number, tab: 'all' | 'unpaid') => {
    // 새로운 요청 ID 생성
    const currentRequestId = ++requestIdRef.current;
    
    try {
      setLoading(true);
      setError(null);
      
      // 미지급 총액 조회
      if (pageNum === 0 && tab === 'unpaid') {
        const totalResponse = await cashbackApi.getUnpaidCashbackTotal();
        // 최신 요청인지 확인
        if (currentRequestId === requestIdRef.current) {
          setUnpaidTotal(totalResponse.data.data);
        }
      }

      // 캐시백 내역 조회
      const response =
        tab === 'unpaid'
          ? await cashbackApi.getUnpaidCashbacks(pageNum, 20)
          : await cashbackApi.getCashbackHistory(pageNum, 20);
      
      // 최신 요청인지 확인 (탭 전환 또는 추가 로딩 중 이전 요청이 늦게 도착한 경우 무시)
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      
      const data = response.data.data;
      
      if (pageNum === 0) {
        setCashbacks(data.content);
      } else {
        setCashbacks((prev) => [...prev, ...data.content]);
      }
      
      setHasMore(!data.last);
    } catch (err: any) {
      // 최신 요청인지 확인
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        '캐시백 내역을 불러오는데 실패했습니다.'
      );
    } finally {
      // 최신 요청인지 확인
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCashbacks(0, activeTab);
  }, [activeTab]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadCashbacks(nextPage, activeTab);
    }
  };

  const handleTabChange = (tab: 'all' | 'unpaid') => {
    setActiveTab(tab);
    setPage(0);
    setCashbacks([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  if (loading && cashbacks.length === 0) {
    return <LoadingState message="캐시백 내역을 불러오는 중..." />;
  }

  if (error && cashbacks.length === 0) {
    return (
      <div className="p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => loadCashbacks(0, activeTab)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {unpaidTotal !== null && activeTab === 'unpaid' && (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">미지급 캐시백</div>
          <div className="text-3xl font-bold">{formatCurrency(unpaidTotal)}</div>
        </div>
      )}

      <div className="flex border-b">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'all'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          전체 내역
        </button>
        <button
          onClick={() => handleTabChange('unpaid')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'unpaid'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          미지급
        </button>
      </div>

      <h2 className="text-xl font-bold">캐시백 내역</h2>
      
      {cashbacks.length === 0 ? (
        <EmptyState message="캐시백 내역이 없습니다." />
      ) : (
        <>
          <div className="space-y-3">
            {cashbacks.map((cashback) => (
              <div
                key={cashback.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-lg text-green-600">
                      +{formatCurrency(cashback.amount)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {format(new Date(cashback.created_at), 'yyyy년 MM월 dd일 HH:mm', {
                        locale: ko,
                      })}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cashback.paid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {cashback.paid ? '지급완료' : '미지급'}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <div>
                    결제 금액: {formatCurrency(cashback.payment_amount)} (적립률:{' '}
                    {(cashback.rate * 100).toFixed(1)}%)
                  </div>
                  {cashback.description && <div>{cashback.description}</div>}
                  {cashback.paid_at && (
                    <div>
                      지급 시간:{' '}
                      {format(new Date(cashback.paid_at), 'yyyy-MM-dd HH:mm', {
                        locale: ko,
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && cashbacks.length > 0 && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
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

