import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Search, Filter } from 'lucide-react';
import { adminApi } from '../../api';
import type { AuditLogResponseDto, AuditAction, AuditEntityType } from '../../types/admin.types';
import type { PageResponse } from '@/shared/types/api';

const PAGE_SIZE = 50;

export function AuditLogsTab() {
  const [logs, setLogs] = useState<AuditLogResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<{
    actorId?: number;
    entityType?: AuditEntityType;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
  }>({});
  const [showFilters, setShowFilters] = useState(false);
  const requestIdRef = useRef(0);

  const loadLogs = useCallback(async (targetPage: number, reset = false) => {
    const currentRequestId = ++requestIdRef.current;
    if (targetPage === 0) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const params: any = {
        page: targetPage,
        size: PAGE_SIZE,
      };
      
      if (filters.actorId) params.actorId = filters.actorId;
      if (filters.entityType) params.entityType = filters.entityType;
      if (filters.action) params.action = filters.action;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await adminApi.getAuditLogs(params);
      
      if (currentRequestId !== requestIdRef.current) return;

      const pageData: PageResponse<AuditLogResponseDto> = response.data.data;
      const newLogs = pageData.content || [];

      if (reset) {
        setLogs(newLogs);
      } else {
        setLogs((prev) => [...prev, ...newLogs]);
      }

      setHasMore(!pageData.last);
    } catch (err: any) {
      if (currentRequestId !== requestIdRef.current) return;
      setError(err?.response?.data?.error?.message || '감사 로그를 불러오는데 실패했습니다.');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    loadLogs(0, true);
  }, [loadLogs]);

  useEffect(() => {
    if (page > 0) {
      loadLogs(page, false);
    }
  }, [page, loadLogs]);

  const handleApplyFilters = () => {
    setPage(0);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(0);
  };

  const getActionBadge = (action: AuditAction) => {
    const styles: Record<AuditAction, string> = {
      CREATE: 'bg-green-100 text-green-700',
      UPDATE: 'bg-blue-100 text-blue-700',
      DELETE: 'bg-red-100 text-red-700',
      BLOCK: 'bg-orange-100 text-orange-700',
      UNBLOCK: 'bg-teal-100 text-teal-700',
      ROLE_CHANGE: 'bg-purple-100 text-purple-700',
    };
    const labels: Record<AuditAction, string> = {
      CREATE: '생성',
      UPDATE: '수정',
      DELETE: '삭제',
      BLOCK: '차단',
      UNBLOCK: '해제',
      ROLE_CHANGE: '권한 변경',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[action]}`}>
        {labels[action]}
      </span>
    );
  };

  const getEntityTypeBadge = (entityType: AuditEntityType) => {
    const styles: Record<AuditEntityType, string> = {
      USER: 'bg-blue-100 text-blue-700',
      PROMPT: 'bg-violet-100 text-violet-700',
      REPORT: 'bg-red-100 text-red-700',
      COMMENT: 'bg-gray-100 text-gray-700',
    };
    const labels: Record<AuditEntityType, string> = {
      USER: '사용자',
      PROMPT: '프롬프트',
      REPORT: '신고',
      COMMENT: '댓글',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[entityType]}`}>
        {labels[entityType]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">감사 로그</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            필터
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  행위자 ID
                </label>
                <input
                  type="number"
                  value={filters.actorId || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      actorId: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="사용자 ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  엔티티 타입
                </label>
                <select
                  value={filters.entityType || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      entityType: e.target.value ? (e.target.value as AuditEntityType) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">전체</option>
                  <option value="USER">사용자</option>
                  <option value="PROMPT">프롬프트</option>
                  <option value="REPORT">신고</option>
                  <option value="COMMENT">댓글</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  액션
                </label>
                <select
                  value={filters.action || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      action: e.target.value ? (e.target.value as AuditAction) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">전체</option>
                  <option value="CREATE">생성</option>
                  <option value="UPDATE">수정</option>
                  <option value="DELETE">삭제</option>
                  <option value="BLOCK">차단</option>
                  <option value="UNBLOCK">해제</option>
                  <option value="ROLE_CHANGE">권한 변경</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  시작 날짜
                </label>
                <input
                  type="datetime-local"
                  value={filters.startDate || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      startDate: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  종료 날짜
                </label>
                <input
                  type="datetime-local"
                  value={filters.endDate || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      endDate: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
              >
                적용
              </button>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200"
              >
                초기화
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {isLoading && logs.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-neutral-500">
          감사 로그가 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">행위자</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">엔티티</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">액션</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">설명</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">IP 주소</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-neutral-900">{log.id}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900">
                      {log.actor_nickname} ({log.actor_id})
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        {getEntityTypeBadge(log.entity_type)}
                        <span className="text-xs text-neutral-500">ID: {log.entity_id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 max-w-xs truncate">
                      {log.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {new Date(log.created_at).toLocaleString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {hasMore && (
            <div className="p-4 text-center">
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
        </div>
      )}
    </div>
  );
}

