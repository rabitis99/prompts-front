import { Flag, AlertCircle, Loader2 } from 'lucide-react';
import { useReports } from '@/features/report/hooks/useReports';
import { ReportItem } from '@/features/report/ui/ReportItem';

export function ReportsTab() {
  const { reports, isLoading, error, hasMore, loadMore, reload } = useReports();

  if (isLoading && reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          <p className="text-neutral-600">신고 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <p className="text-neutral-600">{error}</p>
          <button
            onClick={reload}
            className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Flag className="w-12 h-12 text-neutral-300" />
          <p className="text-neutral-600 text-lg font-medium">신고 내역이 없습니다</p>
          <p className="text-neutral-500 text-sm">신고한 내역이 여기에 표시됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Flag className="w-6 h-6 text-violet-600" />
          <h2 className="text-xl font-bold text-neutral-900">내 신고 내역</h2>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <ReportItem key={report.id} report={report} />
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '로딩 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

