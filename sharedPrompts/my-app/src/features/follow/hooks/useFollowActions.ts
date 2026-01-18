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
      console.log('Follow status API response:', response);
      
      // 응답 구조 확인
      const status = response?.data?.data?.status as FollowStatus;
      console.log('Extracted followStatus:', status);
      
      if (status) {
        setFollowStatus(status);
      } else {
        // 상태가 없으면 null로 설정 (팔로우 관계 없음)
        setFollowStatus(null);
      }
    } catch (err: any) {
      console.error('Failed to check follow status:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        data: err.response?.data,
      });
      setError('팔로우 상태를 확인하는데 실패했습니다.');
      // 에러 발생 시 null로 설정 (팔로우 관계 없음)
      setFollowStatus(null);
    } finally {
      setIsChecking(false);
    }
  }, [userId]);

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
        // 액션 성공 후 상태를 서버에서 다시 확인하여 정확한 상태 반영
        if (successStatus !== null) {
          setFollowStatus(successStatus);
        }
        // 상태 확인을 다시 수행하여 최신 상태 반영
        setTimeout(() => {
          checkFollowStatus();
        }, 100);
        onSuccess?.();
      } catch (err: any) {
        console.error(`Failed to execute action:`, err);
        setError(err.response?.data?.error?.message || errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onSuccess, checkFollowStatus]
  );

  const requestFollow = useCallback(
    () => executeAction(() => followApi.requestFollow(userId!), 'PENDING', '팔로우 요청에 실패했습니다.'),
    [userId, executeAction]
  );

  const acceptFollow = useCallback(
    () => executeAction(() => followApi.acceptFollow(userId!), 'FOLLOWING', '팔로우 수락에 실패했습니다.'),
    [userId, executeAction]
  );

  const rejectFollow = useCallback(async () => {
    // 거절은 PENDING 상태일 때만 가능
    if (followStatus !== 'PENDING') {
      setError('대기 상태가 아닌 관계는 거부할 수 없습니다.');
      return;
    }
    return executeAction(() => followApi.rejectFollow(userId!), null as any, '팔로우 거절에 실패했습니다.');
  }, [userId, followStatus, executeAction]);

  const unfollow = useCallback(
    () => executeAction(() => followApi.unfollow(userId!), null as any, '언팔로우에 실패했습니다.'),
    [userId, executeAction]
  );

  const block = useCallback(
    () => executeAction(() => followApi.blockFollow(userId!), 'BLOCKED', '차단에 실패했습니다.'),
    [userId, executeAction]
  );

  const unblock = useCallback(
    () => executeAction(() => followApi.unblockFollow(userId!), null as any, '차단 해제에 실패했습니다.'),
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

