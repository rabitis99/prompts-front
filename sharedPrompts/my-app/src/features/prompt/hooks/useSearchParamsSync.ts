/**
 * URL SearchParams와 상태 동기화 Hook
 * 
 * 기능:
 * - URL 파라미터 변경 시 상태 동기화 (브라우저 뒤로가기/앞으로가기 대응)
 * - 상태 변경 시 URL 파라미터 업데이트
 */

import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SortOption } from '../model/homeFeed.constants';

interface UseSearchParamsSyncOptions {
  selectedDomain: string;
  sortBy: SortOption;
  onDomainChange: (domain: string) => void;
  onSortChange: (sort: SortOption) => void;
}

/**
 * URL SearchParams와 상태를 동기화하는 Hook
 */
export function useSearchParamsSync(
  options: UseSearchParamsSyncOptions
): {
  updateDomainInUrl: (domain: string) => void;
  updateSortInUrl: (sort: SortOption) => void;
} {
  const { selectedDomain, sortBy, onDomainChange, onSortChange } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 파라미터 변경 시 상태 동기화 (브라우저 뒤로가기/앞으로가기 대응)
  useEffect(() => {
    const VALID_SORT_OPTIONS: SortOption[] = ['latest', 'popular'];
    
    function isValidSortOption(value: string | null): value is SortOption {
      return value !== null && VALID_SORT_OPTIONS.includes(value as SortOption);
    }
    
    const categoryParam = searchParams.get('category') || 'all';
    const sortRaw = searchParams.get('sort');
    const sortParam: SortOption = isValidSortOption(sortRaw) ? sortRaw : 'latest';

    if (categoryParam !== selectedDomain) {
      onDomainChange(categoryParam);
    }

    if (sortParam !== sortBy) {
      onSortChange(sortParam);
    }
  }, [searchParams, selectedDomain, sortBy, onDomainChange, onSortChange]);

  // URL에 도메인 업데이트
  const updateDomainInUrl = useCallback(
    (domain: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (domain === 'all') {
        newSearchParams.delete('category');
      } else {
        newSearchParams.set('category', domain);
      }
      setSearchParams(newSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // URL에 정렬 업데이트
  const updateSortInUrl = useCallback(
    (sort: SortOption) => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (sort === 'latest') {
        newSearchParams.delete('sort');
      } else {
        newSearchParams.set('sort', sort);
      }
      setSearchParams(newSearchParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  return {
    updateDomainInUrl,
    updateSortInUrl,
  };
}

