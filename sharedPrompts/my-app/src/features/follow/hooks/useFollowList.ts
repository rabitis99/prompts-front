import { useState, useEffect, useCallback } from 'react';
import { followApi } from '../api/follow.api';
import type { UserResponseDto } from '@/features/auth/types/user';
import type { FollowStatus } from '../types/follow.types';

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
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadUsers = useCallback(
    async (targetPage: number, reset = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const apiCall =
          type === 'followers'
            ? followApi.getFollowers(status, targetPage, pageSize)
            : followApi.getFollowing(status, targetPage, pageSize);

        const response = await apiCall;
        const data = response.data.data;
        const newUsers = data.content || [];

        if (reset) {
          setUsers(newUsers);
        } else {
          setUsers((prev) => [...prev, ...newUsers]);
        }

        setHasMore(!data.last);
      } catch (err) {
        console.error(`Failed to load ${type}:`, err);
        setError(`${type === 'followers' ? '팔로워' : '팔로잉'} 목록을 불러오는데 실패했습니다.`);
      } finally {
        setIsLoading(false);
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

