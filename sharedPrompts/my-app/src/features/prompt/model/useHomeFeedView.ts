import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { promptApi } from '@/features/prompt/api/prompt.api';
import { likeApi } from '@/features/like/api/like.api';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';
import { SortType, PROMPT_CATEGORY_DISPLAY_NAMES } from '@/features/prompt/types/prompt.types';
import type { SortOption } from './homeFeed.constants';
import { DOMAIN_OPTIONS } from './homeFeed.constants';

const PAGE_SIZE = 20;

export function useHomeFeedView() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL 파라미터에서 초기값 읽기
  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = (searchParams.get('sort') as SortOption) || 'latest';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(categoryParam);
  const [sortBy, setSortBy] = useState<SortOption>(sortParam);
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [prompts, setPrompts] = useState<PromptResponseDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // URL 파라미터 변경 시 상태 동기화 (브라우저 뒤로가기/앞으로가기 대응)
  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'all';
    const sortParam = (searchParams.get('sort') as SortOption) || 'latest';
    
    if (categoryParam !== selectedDomain) {
      setSelectedDomain(categoryParam);
    }
    
    if (sortParam !== sortBy) {
      setSortBy(sortParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 도메인 필터 변경 시 페이지 리셋
  useEffect(() => {
    setPage(0);
    setPrompts([]);
    setTotalCount(0);
  }, [selectedDomain, sortBy]);

  // API 호출
  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const selectedDomainOption = DOMAIN_OPTIONS.find((d) => d.id === selectedDomain);
        
        // 'all' 선택 시 카테고리 필터 제외
        const searchCondition: Parameters<typeof promptApi.getPrompts>[0] = {
          page,
          size: PAGE_SIZE,
          sort: sortBy === 'latest' ? SortType.LATEST : SortType.POPULAR,
        };
        
        // 특정 카테고리 선택 시에만 카테고리 필터 추가
        if (selectedDomain !== 'all' && selectedDomainOption?.category) {
          searchCondition.prompt_category = selectedDomainOption.category;
        }
        
        const response = await promptApi.getPrompts(searchCondition);
        
        const newPrompts = response.data.data.content;
        const totalElements = response.data.data.total_elements ?? 0;
        
        if (page === 0) {
          setPrompts(newPrompts);
          setTotalCount(totalElements);
        } else {
          setPrompts((prev) => [...prev, ...newPrompts]);
        }
        
        setHasMore(newPrompts.length === PAGE_SIZE);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('프롬프트를 불러오는데 실패했습니다.'));
        console.error('Failed to fetch prompts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, [selectedDomain, sortBy, page]);

  // 클라이언트 사이드 검색 필터링
  const filteredPrompts = useMemo(() => {
    if (!searchQuery) {
      return prompts;
    }

    const query = searchQuery.toLowerCase();
    return prompts.filter((p) => {
      const categoryDisplayName = PROMPT_CATEGORY_DISPLAY_NAMES[p.prompt_category]?.toLowerCase() || '';
      return (
        p.title.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)) ||
        categoryDisplayName.includes(query)
      );
    });
  }, [prompts, searchQuery]);

  const handleCopy = (id: number) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleLike = async (id: number) => {
    const isLiked = likedIds.includes(id);
    
    // 낙관적 업데이트
    setLikedIds((prev) => 
      isLiked ? prev.filter((i) => i !== id) : [...prev, id]
    );
    
    // 프롬프트 목록의 좋아요 수 업데이트
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, like_count: isLiked ? p.like_count - 1 : p.like_count + 1 }
          : p
      )
    );
    
    try {
      if (isLiked) {
        await likeApi.unlikePrompt(id);
      } else {
        await likeApi.likePrompt(id);
      }
    } catch (error) {
      // 에러 발생 시 롤백
      setLikedIds((prev) => 
        isLiked ? [...prev, id] : prev.filter((i) => i !== id)
      );
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, like_count: isLiked ? p.like_count + 1 : p.like_count - 1 }
            : p
        )
      );
      console.error('Failed to toggle like:', error);
    }
  };

  // 카테고리 변경 시 URL 업데이트
  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    setPage(0);
    setPrompts([]);
    setTotalCount(0);
    
    // URL 파라미터 업데이트
    const newSearchParams = new URLSearchParams(searchParams);
    if (domain === 'all') {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', domain);
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  // 정렬 변경 시 URL 업데이트
  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setPage(0);
    setPrompts([]);
    setTotalCount(0);
    
    // URL 파라미터 업데이트
    const newSearchParams = new URLSearchParams(searchParams);
    if (sort === 'latest') {
      newSearchParams.delete('sort');
    } else {
      newSearchParams.set('sort', sort);
    }
    setSearchParams(newSearchParams, { replace: true });
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
    handleCopy,
    toggleLike,
    handleResetFilters,
    handleLoadMore,
  };
}

