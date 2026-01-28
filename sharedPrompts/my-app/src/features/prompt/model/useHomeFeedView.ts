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

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SortOption } from './homeFeed.constants';
import { PAGE_SIZE } from './homeFeed.constants';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { usePromptLikes } from '../hooks/usePromptLikes';
import { usePromptList } from '../hooks/usePromptList';
import { useSearchParamsSync } from '../hooks/useSearchParamsSync';
import { filterPrompts } from '../utils/promptFilter';

export function useHomeFeedView() {
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // URL 파라미터에서 초기값 읽기
  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = (searchParams.get('sort') as SortOption) || 'latest';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(categoryParam);
  const [sortBy, setSortBy] = useState<SortOption>(sortParam);
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  // 좋아요 상태 관리
  const {
    likedIds,
    setLikedIds,
    checkPromptsLikes,
    toggleLike: baseToggleLike,
    isTogglingLike,
  } = usePromptLikes({ isAuthenticated });

  // 프롬프트 목록 조회
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
  });

  // URL 파라미터 동기화
  const { updateDomainInUrl, updateSortInUrl } = useSearchParamsSync({
    selectedDomain,
    sortBy,
    onDomainChange: setSelectedDomain,
    onSortChange: setSortBy,
  });

  // 도메인 필터 변경 시 페이지 리셋
  useEffect(() => {
    setPage(0);
    setPrompts([]);
    setLikedIds([]);
  }, [selectedDomain, sortBy, setPrompts, setLikedIds]);

  // 프롬프트 목록 로드 후 좋아요 상태 확인
  const prevPromptsLengthRef = useRef(0);
  useEffect(() => {
    if (prompts.length === 0) return;

    const abortController = new AbortController();

    // 새로 로드된 프롬프트만 확인 (이전 길이와 비교)
    const newPrompts = prompts.slice(prevPromptsLengthRef.current);
    prevPromptsLengthRef.current = prompts.length;

    if (newPrompts.length > 0) {
      checkPromptsLikes(newPrompts, page > 0, abortController.signal);
    }

    return () => {
      abortController.abort();
    };
  }, [prompts.length, page, checkPromptsLikes]);

  // 클라이언트 사이드 검색 필터링
  const filteredPrompts = useMemo(
    () => filterPrompts(prompts, searchQuery),
    [prompts, searchQuery]
  );

  const handleCopy = (id: number) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 좋아요 토글 (like_count 업데이트 포함)
  const toggleLike = async (id: number) => {
    try {
      const response = await baseToggleLike(id);
      
      if (response !== null && typeof response === 'object' && 'like_count' in response) {
        const like_count = response.like_count as number;
        // 프롬프트 목록의 like_count를 서버 값으로 동기화
        setPrompts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, like_count } : p))
        );
      }
    } catch (error) {
      // 에러는 baseToggleLike에서 이미 처리됨
      console.error('Failed to toggle like:', error);
    }
  };

  // 페이지네이션 리셋 헬퍼
  const resetPagination = useCallback(() => {
    setPage(0);
    setPrompts([]);
    setLikedIds([]);
  }, [setPrompts, setLikedIds]);

  // 카테고리 변경 시 URL 업데이트
  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    resetPagination();
    updateDomainInUrl(domain);
  };

  // 정렬 변경 시 URL 업데이트
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
