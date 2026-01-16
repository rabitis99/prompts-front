import { useState, useEffect, useCallback } from 'react';
import { reportApi } from '../api/report.api';
import type { ReportResponseDto } from '../types/report.types';
import { REPORT_CONSTANTS } from '../constants/report.constants';

export function useReports() {
  const [reports, setReports] = useState<ReportResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadReports = useCallback(async (targetPage: number, reset = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await reportApi.getMyReports(
        targetPage,
        REPORT_CONSTANTS.PAGE_SIZE
      );
      const newReports = response.data.data.content || [];
      
      if (reset) {
        setReports(newReports);
      } else {
        setReports((prev) => [...prev, ...newReports]);
      }

      // last 필드가 없으면 content 길이로 판단
      const isLast = response.data.data.last ?? newReports.length < REPORT_CONSTANTS.PAGE_SIZE;
      setHasMore(!isLast);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError(
        err.response?.data?.message || '신고 내역을 불러오는데 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, hasMore]);

  const reload = useCallback(() => {
    setPage(0);
    setReports([]);
    loadReports(0, true);
  }, [loadReports]);

  // 초기 로드
  useEffect(() => {
    loadReports(0, true);
  }, [loadReports]);

  // 페이지 변경 시 추가 로드
  useEffect(() => {
    if (page > 0) {
      loadReports(page, false);
    }
  }, [page, loadReports]);

  return {
    reports,
    isLoading,
    error,
    hasMore,
    loadMore,
    reload,
  };
}
