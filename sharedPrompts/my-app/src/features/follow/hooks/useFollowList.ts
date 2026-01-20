import { useState, useEffect, useCallback, useRef } from 'react';
import { followApi } from '../api/follow.api';
import type { FollowUserResponseDto, FollowStatus } from '../types/follow.types';
import { extractErrorMessage } from '../utils/error.utils';
import { FOLLOW_ERROR_MESSAGES } from '../constants/follow.constants';

interface UseFollowListOptions {
  type: 'followers' | 'following';
  status?: FollowStatus;
  pageSize?: number;
  autoLoad?: boolean;
}

export function useFollowList({
  type,
  status,
  pageSize = 20,
  autoLoad = false,
}: UseFollowListOptions) {
  const [users, setUsers] = useState<FollowUserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const requestIdRef = useRef(0);

  const loadUsers = useCallback(
    async (targetPage: number, reset = false) => {
      const currentRequestId = ++requestIdRef.current;
      
      if (targetPage === 0) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const apiCall =
          type === 'followers'
            ? followApi.getFollowers(status, targetPage, pageSize)
            : followApi.getFollowing(status, targetPage, pageSize);

        const response = await apiCall;
        
        // 레이스 컨디션 방지: 최신 요청인지 확인
        if (currentRequestId !== requestIdRef.current) return;
        
        const data = response.data.data;
        const newUsers = data.content || [];

        if (reset) {
          setUsers(newUsers);
        } else {
          setUsers((prev) => [...prev, ...newUsers]);
        }

        setHasMore(!data.last);
      } catch (err) {
        // 레이스 컨디션 방지: 최신 요청인지 확인
        if (currentRequestId !== requestIdRef.current) return;
        
        console.error(`Failed to load ${type}:`, err);
        const defaultMessage =
          type === 'followers'
            ? FOLLOW_ERROR_MESSAGES.LOAD_FOLLOWERS_FAILED
            : FOLLOW_ERROR_MESSAGES.LOAD_FOLLOWING_FAILED;
        const errorMsg = extractErrorMessage(err, defaultMessage);
        setError(errorMsg);
      } finally {
        // 레이스 컨디션 방지: 최신 요청인지 확인
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [type, status, pageSize]
  );

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadUsers(nextPage, false);
  }, [isLoading, hasMore, page, loadUsers]);

  const refresh = useCallback(() => {
    setPage(0);
    setUsers([]);
    setHasMore(true);
    setError(null);
    // 직접 호출하여 useEffect의 의존성 체인을 피함
    requestIdRef.current += 1;
    loadUsers(0, true);
  }, [loadUsers]);

  useEffect(() => {
    if (autoLoad) {
      loadUsers(0, true);
    }
  }, [autoLoad, loadUsers]);

  return {
    users,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

