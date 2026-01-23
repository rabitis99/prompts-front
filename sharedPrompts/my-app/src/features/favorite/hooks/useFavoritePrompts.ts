import { useState, useEffect, useCallback } from 'react';
import { favoriteApi } from '../api/favorite.api';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';

interface UseFavoritePromptsOptions {
  pageSize?: number;
}

export function useFavoritePrompts({ pageSize = 20 }: UseFavoritePromptsOptions = {}) {
  const [prompts, setPrompts] = useState<PromptResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0); // 0-based
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFavorites = useCallback(
    async (pageNum: number = 0) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await favoriteApi.getFavoritePrompts(pageNum, pageSize);
        const data = response.data.data;

        setPrompts(data.content);
        const totalElements = data.total_elements ?? data.content.length;
        const calculatedTotalPages =
          data.total_pages ?? Math.max(1, Math.ceil(totalElements / pageSize));

        setTotalCount(totalElements);
        setTotalPages(calculatedTotalPages);
      } catch (err: any) {
        setError('즐겨찾기 목록을 불러오는데 실패했습니다.');
        console.error('Failed to fetch favorites:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  const refresh = useCallback(async () => {
    setPage(0);
    setPrompts([]);
    setHasMore(true);
    setError(null);
    // 이미 첫 페이지에 있어도 강제로 새로고침
    await fetchFavorites(0);
  }, [fetchFavorites]);

  useEffect(() => {
    fetchFavorites(page);
  }, [fetchFavorites, page]);

  const hasMore = page + 1 < totalPages;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setPage((prev) => prev + 1);
  }, [isLoading, hasMore]);

  const goToPage = useCallback(
    (targetPage: number) => {
      if (targetPage < 0 || targetPage >= totalPages) return;
      setPage(targetPage);
    },
    [totalPages]
  );

  return {
    prompts,
    isLoading,
    error,
    page,
    totalCount,
    totalPages,
    hasMore,
    loadMore,
    refresh,
    goToPage,
  };
}
