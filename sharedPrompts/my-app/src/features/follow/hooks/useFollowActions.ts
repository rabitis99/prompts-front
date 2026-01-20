import { useState, useCallback } from 'react';
import { followApi } from '../api/follow.api';
import type { FollowStatus } from '../types/follow.types';

interface UseFollowActionsOptions {
  userId: number | null;
  actionType: 'follow' | 'follower' | null;
  onSuccess?: () => void;
}

export function useFollowActions({
  userId,
  actionType,
  onSuccess,
}: UseFollowActionsOptions) {
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkFollowStatus = useCallback(async () => {
    if (!userId) return;

    setIsChecking(true);
    setError(null);
    try {
      const response = await followApi.getFollowStatus(userId);
      const statusValue = response?.data?.data?.status;
      
      // 서버는 항상 명확한 상태를 내려줌 (404 없음)
      const validStatuses: FollowStatus[] = ['PENDING', 'FOLLOWING', 'REJECTED', 'CANCELLED', 'BLOCKED'];
      const normalizedStatus = typeof statusValue === 'string' 
        ? statusValue.toUpperCase().trim() as FollowStatus
        : null;
      
      const status: FollowStatus | null = validStatuses.includes(normalizedStatus as FollowStatus)
        ? normalizedStatus
        : null;
      
      setFollowStatus(status);
    } catch (err: any) {
      // 서버는 항상 상태를 내려주므로, 에러 발생 시에만 처리
      setError('팔로우 상태를 확인하는데 실패했습니다.');
      setFollowStatus(null);
    } finally {
      setIsChecking(false);
    }
  }, [userId, actionType]);

  const executeAction = useCallback(
    async (
      action: () => Promise<any>,
      successStatus: FollowStatus | null,
      errorMessage: string
    ) => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);
      try {
        await action();
        if (successStatus !== null) {
          setFollowStatus(successStatus);
        }
        setTimeout(() => {
          checkFollowStatus();
        }, 100);
        onSuccess?.();
      } catch (err: any) {
        console.error('Failed to execute action:', err);
        const errorMsg = err.response?.data?.error?.message || errorMessage;
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onSuccess, checkFollowStatus]
  );

  const requestFollow = useCallback(
    () => {
      return executeAction(() => followApi.requestFollow(userId!), 'PENDING', '팔로우 요청에 실패했습니다.');
    },
    [userId, executeAction]
  );

  const acceptFollow = useCallback(
    () => {
      return executeAction(() => followApi.acceptFollow(userId!), 'FOLLOWING', '팔로우 수락에 실패했습니다.');
    },
    [userId, executeAction]
  );

  const rejectFollow = useCallback(async () => {
    if (followStatus !== 'PENDING') {
      setError('대기 상태가 아닌 관계는 거부할 수 없습니다.');
      return;
    }
    return executeAction(() => followApi.rejectFollow(userId!), 'REJECTED', '팔로우 거절에 실패했습니다.');
  }, [userId, followStatus, executeAction]);

  const unfollow = useCallback(
    () => {
      return executeAction(() => followApi.unfollow(userId!), 'CANCELLED', '언팔로우에 실패했습니다.');
    },
    [userId, executeAction]
  );

  const block = useCallback(
    () => {
      return executeAction(() => followApi.blockFollow(userId!), 'BLOCKED', '차단에 실패했습니다.');
    },
    [userId, executeAction]
  );

  const unblock = useCallback(
    () => {
      // 차단 해제 후 상태는 CANCELLED
      return executeAction(() => followApi.unblockFollow(userId!), 'CANCELLED', '차단 해제에 실패했습니다.');
    },
    [userId, executeAction]
  );

  return {
    followStatus,
    isLoading,
    isChecking,
    error,
    checkFollowStatus,
    requestFollow,
    acceptFollow,
    rejectFollow,
    unfollow,
    block,
    unblock,
    setError,
  };
}

