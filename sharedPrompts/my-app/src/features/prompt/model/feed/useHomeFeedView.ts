/**
 * 홈 피드 뷰 상태 관리 Hook
 *
 * 기능:
 * - 프롬프트 목록 조회 및 페이지네이션
 * - 좋아요 상태 관리
 * - 검색 및 필터링
 * - URL 파라미터 동기화
 *
 * Rate Limit 방지 전략:
 * - 캐싱, 배치 요청, 중복 요청 방지, Debounce 모두 적용
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SortOption } from './homeFeed.constants';
import { PAGE_SIZE } from './homeFeed.constants';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { usePromptLikes } from '../../hooks/usePromptLikes';
import { usePromptList } from '../../hooks/usePromptList';
import { useSearchParamsSync } from '../../hooks/useSearchParamsSync';
import { useDebounce } from '@/shared/hooks/useDebounce';

export function useHomeFeedView() {
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = (searchParams.get('sort') as SortOption) || 'latest';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(categoryParam);
  const [sortBy, setSortBy] = useState<SortOption>(sortParam);
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const {
    likedIds,
    setLikedIds,
    checkPromptsLikes,
    toggleLike: baseToggleLike,
    isTogglingLike,
  } = usePromptLikes({ isAuthenticated });

  const {
    prompts,
    totalCount,
    isLoading,
    hasMore,
    error,
    setPrompts,
  } = usePromptList({
    selectedDomain,
    sortBy,
    page,
    keyword: debouncedSearchQuery || undefined,
  });

  const { updateDomainInUrl, updateSortInUrl } = useSearchParamsSync({
    selectedDomain,
    sortBy,
    onDomainChange: setSelectedDomain,
    onSortChange: setSortBy,
  });

  useEffect(() => {
    setPage(0);
    setPrompts([]);
    setLikedIds([]);
  }, [selectedDomain, sortBy, setPrompts, setLikedIds]);

  useEffect(() => {
    setPage(0);
    setPrompts([]);
    setLikedIds([]);
  }, [debouncedSearchQuery, setPrompts, setLikedIds]);

  const prevPromptsLengthRef = useRef(0);
  useEffect(() => {
    if (prompts.length === 0) return;

    const abortController = new AbortController();

    const newPrompts = prompts.slice(prevPromptsLengthRef.current);
    prevPromptsLengthRef.current = prompts.length;

    if (newPrompts.length > 0) {
      checkPromptsLikes(newPrompts, page > 0, abortController.signal);
    }

    return () => {
      abortController.abort();
    };
  }, [prompts.length, page, checkPromptsLikes]);

  const filteredPrompts = prompts;

  const handleCopy = (id: number) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleLike = async (id: number) => {
    try {
      const response = await baseToggleLike(id);

      if (response !== null && typeof response === 'object' && 'like_count' in response) {
        const like_count = response.like_count as number;
        setPrompts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, like_count } : p))
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const resetPagination = useCallback(() => {
    setPage(0);
    setPrompts([]);
    setLikedIds([]);
  }, [setPrompts, setLikedIds]);

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    resetPagination();
    updateDomainInUrl(domain);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    resetPagination();
    updateSortInUrl(sort);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    handleDomainChange('all');
    setPage(0);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedDomain,
    setSelectedDomain: handleDomainChange,
    sortBy,
    setSortBy: handleSortChange,
    showFilters,
    setShowFilters,
    copiedId,
    likedIds,
    filteredPrompts,
    totalCount,
    isLoading,
    hasMore,
    error,
    isTogglingLike,
    handleCopy,
    toggleLike,
    handleResetFilters,
    handleLoadMore,
  };
}
