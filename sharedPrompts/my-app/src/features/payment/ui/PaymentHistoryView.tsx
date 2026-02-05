import { useState, useEffect } from 'react';
import { paymentApi } from '../api/payment.api';
import type { PaymentResponseDto, PaymentStatus } from '../types/payment.types';
import { LoadingState, EmptyState } from '@/shared/components';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-blue-100 text-blue-800',
  FAILED: 'bg-red-100 text-red-800',
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: '대기중',
  COMPLETED: '완료',
  CANCELLED: '취소',
  REFUNDED: '환불',
  FAILED: '실패',
};

export function PaymentHistoryView() {
  const [payments, setPayments] = useState<PaymentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentApi.getPaymentHistory(pageNum, 20);
      const data = response.data.data;
      
      if (pageNum === 0) {
        setPayments(data.content);
      } else {
        setPayments((prev) => [...prev, ...data.content]);
      }
      
      setHasMore(!data.last);
      return true; // 성공
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        '결제 내역을 불러오는데 실패했습니다.'
      );
      return false; // 실패
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments(0);
  }, []);

  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      const success = await loadPayments(nextPage);
      // 성공한 경우에만 페이지 증가
      if (success) {
        setPage(nextPage);
      }
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency || 'KRW',
    }).format(amount);
  };

  if (loading && payments.length === 0) {
    return <LoadingState message="결제 내역을 불러오는 중..." />;
  }

  if (error && payments.length === 0) {
    return (
      <div className="p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => loadPayments(0)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (payments.length === 0) {
    return <EmptyState message="결제 내역이 없습니다." />;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">결제 내역</h2>
      
      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-lg">
                  {formatCurrency(payment.amount, payment.currency)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {format(new Date(payment.created_at), 'yyyy년 MM월 dd일 HH:mm', {
                    locale: ko,
                  })}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  PAYMENT_STATUS_COLORS[payment.status]
                }`}
              >
                {PAYMENT_STATUS_LABELS[payment.status]}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <div>결제 수단: {payment.payment_method}</div>
              {payment.external_payment_id && (
                <div>결제 번호: {payment.external_payment_id}</div>
              )}
              {payment.approved_at && (
                <div>
                  승인 시간:{' '}
                  {format(new Date(payment.approved_at), 'yyyy-MM-dd HH:mm', {
                    locale: ko,
                  })}
                </div>
              )}
              {payment.used_point_amount && payment.used_point_amount > 0 && (
                <div className="text-blue-600">
                  사용 포인트: {formatCurrency(payment.used_point_amount, payment.currency)}
                </div>
              )}
            </div>

            {payment.failure_reason && (
              <div className="mt-2 text-sm text-red-600">
                실패 사유: {payment.failure_reason}
              </div>
            )}
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
    </div>
  );
}

