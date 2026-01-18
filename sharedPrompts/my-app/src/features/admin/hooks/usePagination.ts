import { useState, useEffect, useCallback, useRef } from 'react';
import type { PageResponse } from '@/shared/types/api';

interface UsePaginationOptions<T> {
  loadData: (page: number, keyword?: string) => Promise<PageResponse<T>>;
  keyword?: string;
  pageSize?: number;
  autoLoad?: boolean;
  dependencies?: React.DependencyList;
}

interface UsePaginationReturn<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  loadMore: () => void;
  reload: () => void;
  setItems: (items: T[] | ((prev: T[]) => T[])) => void;
}

/**
 * 페이지네이션 로직을 처리하는 공통 훅
 */
export function usePagination<T>({
  loadData,
  keyword,
  pageSize = 20,
  autoLoad = true,
  dependencies = [],
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const requestIdRef = useRef(0);

  const loadPage = useCallback(
    async (targetPage: number, reset = false) => {
      const currentRequestId = ++requestIdRef.current;
      
      if (targetPage === 0) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await loadData(targetPage, keyword);
        
        if (currentRequestId !== requestIdRef.current) return;

        const pageData = response;
        const newItems = pageData.content || [];

        if (reset) {
          setItems(newItems);
        } else {
          setItems((prev) => [...prev, ...newItems]);
        }

        setHasMore(!pageData.last);
      } catch (err: any) {
        if (currentRequestId !== requestIdRef.current) return;
        setError(err?.response?.data?.error?.message || '데이터를 불러오는데 실패했습니다.');
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [loadData, keyword, ...dependencies]
  );

  // 초기 로드
  useEffect(() => {
    if (autoLoad) {
      loadPage(0, true);
    }
  }, [loadPage, autoLoad]);

  // 페이지 변경 시 추가 로드
  useEffect(() => {
    if (page > 0) {
      loadPage(page, false);
    }
  }, [page, loadPage]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setPage((prev) => prev + 1);
  }, [isLoading, hasMore]);

  const reload = useCallback(() => {
    setPage(0);
    setError(null);
    loadPage(0, true);
  }, [loadPage]);

  return {
    items,
    isLoading,
    error,
    hasMore,
    page,
    loadMore,
    reload,
    setItems,
  };
}

