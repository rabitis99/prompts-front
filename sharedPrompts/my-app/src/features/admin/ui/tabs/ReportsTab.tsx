import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminApi } from '../../api';
import type { ReportResponseDto, ReportDetailResponseDto, ReportProcessRequestDto } from '@/features/report/types/report.types';
import type { ReportStatus } from '@/features/report/types/report.types';
import type { PageResponse } from '@/shared/types/api';

const PAGE_SIZE = 20;

export function ReportsTab() {
  const [reports, setReports] = useState<ReportResponseDto[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | undefined>(undefined);
  const [processComment, setProcessComment] = useState('');
  const requestIdRef = useRef(0);

  const loadReports = useCallback(async (targetPage: number, reset = false) => {
    const currentRequestId = ++requestIdRef.current;
    if (targetPage === 0) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await adminApi.getReports(
        statusFilter,
        targetPage,
        PAGE_SIZE
      );
      
      if (currentRequestId !== requestIdRef.current) return;

      // 응답 구조 확인
      const pageData: PageResponse<ReportResponseDto> = response.data?.data;
      
      if (!pageData) {
        console.error('ReportsTab: pageData is undefined', response);
        setError('응답 데이터 형식이 올바르지 않습니다.');
        return;
      }

      const newReports = Array.isArray(pageData.content) ? pageData.content : [];
      
      // 디버깅: 파싱된 데이터 확인
      console.log('ReportsTab: statusFilter=', statusFilter, 'targetPage=', targetPage, 'pageData=', pageData, 'newReports.length=', newReports.length);

      if (reset) {
        setReports(newReports);
      } else {
        setReports((prev) => [...prev, ...newReports]);
      }

      setHasMore(!pageData.last);
    } catch (err: any) {
      if (currentRequestId !== requestIdRef.current) return;
      setError(err?.response?.data?.error?.message || '신고 목록을 불러오는데 실패했습니다.');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [statusFilter]);

  useEffect(() => {
    loadReports(0, true);
  }, [loadReports]);

  useEffect(() => {
    if (page > 0) {
      loadReports(page, false);
    }
  }, [page, loadReports]);

  const handleStatusFilter = (status: ReportStatus | undefined) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handleViewDetail = async (reportId: number) => {
    try {
      const response = await adminApi.getReportDetail(reportId);
      setSelectedReport(response.data.data);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || '신고 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleProcessReport = async (reportId: number, status: ReportStatus) => {
    try {
      const data: ReportProcessRequestDto = {
        status,
        process_comment: processComment || undefined,
      };
      await adminApi.processReport(reportId, data);
      
      // 목록 업데이트
      const response = await adminApi.getReportDetail(reportId);
      const updatedReport = response.data.data;
      
      setReports((prev) => {
        // 현재 필터와 맞지 않으면 목록에서 제거, 맞으면 업데이트
        if (statusFilter !== undefined && updatedReport.status !== statusFilter) {
          return prev.filter((report) => report.id !== reportId);
        }
        return prev.map((report) => (report.id === reportId ? { ...report, status: updatedReport.status } : report));
      });
      
      setSelectedReport(updatedReport);
      setProcessComment('');
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || '신고 처리에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      RESOLVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    const icons = {
      PENDING: Clock,
      PROCESSING: Clock,
      RESOLVED: CheckCircle,
      REJECTED: XCircle,
    };
    const labels = {
      PENDING: '대기 중',
      PROCESSING: '처리 중',
      RESOLVED: '처리 완료',
      REJECTED: '거부됨',
    };

    const Icon = icons[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">신고 처리</h2>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleStatusFilter(undefined)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === undefined
                ? 'bg-violet-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => handleStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === 'PENDING'
                ? 'bg-violet-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            대기 중
          </button>
          <button
            onClick={() => handleStatusFilter('PROCESSING')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === 'PROCESSING'
                ? 'bg-violet-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            처리 중
          </button>
          <button
            onClick={() => handleStatusFilter('RESOLVED')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === 'RESOLVED'
                ? 'bg-violet-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            처리 완료
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 신고 목록 */}
        <div className="space-y-4">
          {isLoading && reports.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-neutral-500">
              신고가 없습니다.
            </div>
          ) : (
            <>
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`bg-white rounded-2xl border border-neutral-200 p-6 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedReport?.id === report.id ? 'ring-2 ring-violet-500' : ''
                  }`}
                  onClick={() => handleViewDetail(report.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-neutral-900">
                          {report.report_type === 'PROMPT' ? '프롬프트' : '댓글'} 신고
                        </span>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        신고자: {report.reporter_nickname}
                      </p>
                      <p className="text-xs text-neutral-500">
                        신고 사유: {report.reason}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-400">
                    {new Date(report.created_at).toLocaleString('ko-KR')}
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin inline" />
                    ) : (
                      '더 보기'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 신고 상세 및 처리 */}
        <div>
          {selectedReport ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">신고 상세</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm text-neutral-600 mb-1">신고 타입</div>
                  <div className="text-sm font-medium text-neutral-900">
                    {selectedReport.report_type === 'PROMPT' ? '프롬프트' : '댓글'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600 mb-1">신고자</div>
                  <div className="text-sm font-medium text-neutral-900">
                    {selectedReport.reporter_nickname} (ID: {selectedReport.reporter_id})
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-neutral-600 mb-1">신고 사유</div>
                  <div className="text-sm font-medium text-neutral-900">{selectedReport.reason}</div>
                </div>
                
                {selectedReport.description && (
                  <div>
                    <div className="text-sm text-neutral-600 mb-1">상세 설명</div>
                    <div className="text-sm text-neutral-900 bg-neutral-50 rounded-lg p-3">
                      {selectedReport.description}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="text-sm text-neutral-600 mb-1">현재 상태</div>
                  <div>{getStatusBadge(selectedReport.status)}</div>
                </div>
                
                {selectedReport.processor_nickname && (
                  <div>
                    <div className="text-sm text-neutral-600 mb-1">처리자</div>
                    <div className="text-sm font-medium text-neutral-900">
                      {selectedReport.processor_nickname}
                    </div>
                  </div>
                )}
                
                {selectedReport.process_comment && (
                  <div>
                    <div className="text-sm text-neutral-600 mb-1">처리 의견</div>
                    <div className="text-sm text-neutral-900 bg-neutral-50 rounded-lg p-3">
                      {selectedReport.process_comment}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-neutral-400">
                  신고일: {new Date(selectedReport.created_at).toLocaleString('ko-KR')}
                </div>
              </div>

              {selectedReport.status === 'PENDING' || selectedReport.status === 'PROCESSING' ? (
                <div className="space-y-3 pt-4 border-t border-neutral-200">
                  <textarea
                    value={processComment}
                    onChange={(e) => setProcessComment(e.target.value)}
                    placeholder="처리 의견 (선택사항)"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    rows={3}
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProcessReport(selectedReport.id, 'RESOLVED')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      처리 완료
                    </button>
                    <button
                      onClick={() => handleProcessReport(selectedReport.id, 'REJECTED')}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      거부
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-neutral-500">
              신고를 선택하여 상세 정보를 확인하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

