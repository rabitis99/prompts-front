import { useState, useEffect, useCallback, useRef } from 'react';
import { reportApi } from '../api/report.api';
import type { ReportResponseDto } from '../types/report.types';
import { REPORT_CONSTANTS } from '../constants/report.constants';

export function useReports() {
  const [reports, setReports] = useState<ReportResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  // 레이스 컨디션 방지를 위한 요청 ID 추적
  const requestIdRef = useRef(0);
  // 언마운트 여부 추적
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadReports = useCallback(async (targetPage: number, reset = false) => {
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const response = await reportApi.getMyReports(
        targetPage,
        REPORT_CONSTANTS.PAGE_SIZE
      );
      
      // 최신 요청인지 확인하고, 컴포넌트가 마운트되어 있는지 확인
      if (currentRequestId !== requestIdRef.current || !isMountedRef.current) {
        return;
      }

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
      // 최신 요청인지 확인하고, 컴포넌트가 마운트되어 있는지 확인
      if (currentRequestId !== requestIdRef.current || !isMountedRef.current) {
        return;
      }
      console.error('Failed to load reports:', err);
      setError(
        err.response?.data?.message || '신고 내역을 불러오는데 실패했습니다.'
      );
    } finally {
      // 최신 요청인지 확인하고, 컴포넌트가 마운트되어 있는지 확인
      if (currentRequestId === requestIdRef.current && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    // useEffect가 실행되기 전 연속 클릭 방지
    setIsLoading(true);
    setPage((prev) => prev + 1);
  }, [isLoading, hasMore]);

  const reload = useCallback(() => {
    setPage(0);
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
