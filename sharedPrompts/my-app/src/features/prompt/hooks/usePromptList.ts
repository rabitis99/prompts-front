/**
 * 프롬프트 목록 조회 Hook
 * 
 * 기능:
 * - 프롬프트 목록 조회 및 페이지네이션
 * - 캐싱 및 중복 요청 방지
 * - Debounce 적용
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { promptApi } from '@/features/prompt/api/prompt.api';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';
import { SortType } from '@/features/prompt/types/prompt.types';
import type { SortOption } from '../model/homeFeed.constants';
import { DOMAIN_OPTIONS, PAGE_SIZE } from '../model/homeFeed.constants';
import { rateLimitTracker } from '@/shared/utils/rateLimit';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface UsePromptListOptions {
  selectedDomain: string;
  sortBy: SortOption;
  page: number;
}

interface UsePromptListReturn {
  prompts: PromptResponseDto[];
  totalCount: number;
  isLoading: boolean;
  hasMore: boolean;
  error: Error | null;
  setPrompts: React.Dispatch<React.SetStateAction<PromptResponseDto[]>>;
  fetchPrompts: (
    pageNum: number,
    domain: string,
    sort: SortOption,
    abortSignal: AbortSignal
  ) => Promise<{
    prompts: PromptResponseDto[];
    totalCount: number;
  } | null>;
}

/**
 * 프롬프트 목록을 조회하는 Hook
 */
export function usePromptList(
  options: UsePromptListOptions
): UsePromptListReturn {
  const { selectedDomain, sortBy, page } = options;
  const [prompts, setPrompts] = useState<PromptResponseDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce된 필터 값
  const debouncedDomain = useDebounce(selectedDomain, 300);
  const debouncedSort = useDebounce(sortBy, 300);

  /**
   * 프롬프트 목록 조회 (캐싱 + 중복 요청 방지)
   */
  const fetchPrompts = useCallback(
    async (
      pageNum: number,
      domain: string,
      sort: SortOption,
      abortSignal: AbortSignal
    ) => {
      // 요청 키 생성 (중복 체크용)
      const requestKey = rateLimitTracker.createRequestKey('GET', '/prompts', {
        page: pageNum,
        size: PAGE_SIZE,
        sort: sort === 'latest' ? SortType.LATEST : sort === 'comments' ? SortType.COMMENTS : SortType.POPULAR,
        prompt_category: domain !== 'all' ? domain : undefined,
      });

      // 동일한 요청이 진행 중이면 기존 Promise 재사용
      const response = await rateLimitTracker.getOrCreateRequest(
        requestKey,
        async () => {
          const selectedDomainOption = DOMAIN_OPTIONS.find((d) => d.id === domain);

          const searchCondition: Parameters<typeof promptApi.getPrompts>[0] = {
            page: pageNum,
            size: PAGE_SIZE,
            sort: sort === 'latest' ? SortType.LATEST : sort === 'comments' ? SortType.COMMENTS : SortType.POPULAR,
          };

          if (domain !== 'all' && selectedDomainOption?.category) {
            searchCondition.prompt_category = selectedDomainOption.category;
          }

          return promptApi.getPrompts(searchCondition);
        }
      );

      // 요청이 취소되었는지 확인
      if (abortSignal.aborted) {
        return null;
      }

      const newPrompts = response.data.data.content;
      const totalElements = response.data.data.total_elements ?? 0;

      return {
        prompts: newPrompts,
        totalCount: totalElements,
      };
    },
    []
  );

  // API 호출
  useEffect(() => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const loadPrompts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchPrompts(
          page,
          debouncedDomain,
          debouncedSort,
          abortController.signal
        );

        if (!result || abortController.signal.aborted) {
          return;
        }

        if (page === 0) {
          setPrompts(result.prompts);
          setTotalCount(result.totalCount);
        } else {
          setPrompts((prev) => [...prev, ...result.prompts]);
        }

        setHasMore(result.prompts.length === PAGE_SIZE);
      } catch (err) {
        // AbortError는 무시 (요청 취소)
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(
          err instanceof Error
            ? err
            : new Error('프롬프트를 불러오는데 실패했습니다.')
        );
        console.error('Failed to fetch prompts:', err);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadPrompts();

    // cleanup: 컴포넌트 언마운트 시 요청 취소
    return () => {
      abortController.abort();
    };
  }, [debouncedDomain, debouncedSort, page, fetchPrompts]);

  // 필터 변경 시 리셋은 외부에서 처리 (useHomeFeedView에서)

  return {
    prompts,
    totalCount,
    isLoading,
    hasMore,
    error,
    setPrompts,
    fetchPrompts,
  };
}

