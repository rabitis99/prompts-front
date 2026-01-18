import { useState, useEffect, useCallback } from 'react';
import { favoriteApi } from '../api/favorite.api';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';

interface UseFavoritePromptsOptions {
  pageSize?: number;
}

export function useFavoritePrompts({ pageSize = 20 }: UseFavoritePromptsOptions = {}) {
  const [prompts, setPrompts] = useState<PromptResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchFavorites = useCallback(
    async (pageNum: number = 0, append: boolean = false) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await favoriteApi.getFavoritePrompts(pageNum, pageSize);
        const data = response.data.data;

        if (append) {
          setPrompts((prev) => [...prev, ...data.content]);
        } else {
          setPrompts(data.content);
        }

        setHasMore(!data.last);
      } catch (err: any) {
        setError('즐겨찾기 목록을 불러오는데 실패했습니다.');
        console.error('Failed to fetch favorites:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFavorites(nextPage, true);
    }
  }, [isLoading, hasMore, page, fetchFavorites]);

  const refresh = useCallback(() => {
    setPage(0);
    setPrompts([]);
    fetchFavorites(0, false);
  }, [fetchFavorites]);

  useEffect(() => {
    fetchFavorites(0, false);
  }, [fetchFavorites]);

  return {
    prompts,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

