import { useState, useCallback, useEffect } from 'react';
import { followApi } from '../api/follow.api';
import { useFollowStatus } from './useFollowStatus';
import { extractErrorMessage } from '../utils/error.utils';
import { FOLLOW_ERROR_MESSAGES } from '../constants/follow.constants';

interface UseFollowActionsOptions {
  userId: number | null;
  actionType?: 'follow' | 'follower' | null;
  onSuccess?: () => void;
}

export function useFollowActions({
  userId,
  actionType,
  onSuccess,
}: UseFollowActionsOptions) {
  const {
    followStatus,
    followData,
    isChecking,
    hasChecked,
    error: statusError,
    checkFollowStatus,
    setError: setStatusError,
  } = useFollowStatus({ userId });

  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // 통합 에러 상태 (상태 확인 에러 또는 액션 에러)
  const error = statusError || actionError;
  const setError = useCallback(
    (err: string | null) => {
      setActionError(err);
      setStatusError(err);
    },
    [setStatusError],
  );

  // userId 변경 시 에러 상태 초기화
  useEffect(() => {
    setActionError(null);
    setStatusError(null);
  }, [userId, setStatusError]);

  /**
   * 팔로우 액션을 실행하고 상태를 업데이트하는 공통 로직
   */
  const executeAction = useCallback(
    async <T,>(
      action: () => Promise<T>,
      errorMessage: string
    ): Promise<void> => {
      if (!userId) return;

      setIsLoading(true);
      setActionError(null);
      try {
        await action();
        await checkFollowStatus();
        onSuccess?.();
      } catch (err) {
        console.error('Failed to execute action:', err);
        const errorMsg = extractErrorMessage(err, errorMessage);
        setActionError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onSuccess, checkFollowStatus]
  );

  /**
   * 여러 팔로우 액션을 순차적으로 실행하는 헬퍼 함수
   */
  const executeMultipleActions = useCallback(
    async (
      actions: Array<() => Promise<unknown>>,
      errorMessage: string
    ): Promise<void> => {
      if (!userId) return;

      setIsLoading(true);
      setActionError(null);
      try {
        for (const action of actions) {
          await action();
        }
        await checkFollowStatus();
        onSuccess?.();
      } catch (err) {
        console.error('Failed to execute multiple actions:', err);
        const errorMsg = extractErrorMessage(err, errorMessage);
        setActionError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onSuccess, checkFollowStatus]
  );

  const requestFollow = useCallback(() => {
    if (!userId) return;
    return executeAction(
      () => followApi.requestFollow(userId),
      FOLLOW_ERROR_MESSAGES.REQUEST_FAILED
    );
  }, [userId, executeAction]);

  const acceptFollow = useCallback(() => {
    if (!userId) return;
    return executeAction(
      () => followApi.acceptFollow(userId),
      FOLLOW_ERROR_MESSAGES.ACCEPT_FAILED
    );
  }, [userId, executeAction]);

  const rejectFollow = useCallback(async () => {
    if (!userId) return;
    if (followStatus !== 'PENDING') {
      setActionError(FOLLOW_ERROR_MESSAGES.REJECT_INVALID_STATE);
      return;
    }
    return executeAction(
      () => followApi.rejectFollow(userId),
      FOLLOW_ERROR_MESSAGES.REJECT_FAILED
    );
  }, [userId, followStatus, executeAction]);

  const unfollow = useCallback(() => {
    if (!userId) return;
    return executeAction(
      () => followApi.unfollow(userId),
      FOLLOW_ERROR_MESSAGES.UNFOLLOW_FAILED
    );
  }, [userId, executeAction]);

  const block = useCallback(async () => {
    if (!userId) return;

    // 팔로워 탭인 경우: PENDING 상태의 요청을 먼저 처리한 후 차단
    if (actionType === 'follower') {
      const actions: Array<() => Promise<unknown>> = [];

      // 내가 상대에게 보낸 PENDING 요청이 있으면 취소
      if (followStatus === 'PENDING') {
        actions.push(() => followApi.unfollow(userId));
      }

      // 상대가 나에게 보낸 PENDING 요청이 있으면 거절
      if (followData?.reverse_status === 'PENDING') {
        actions.push(() => followApi.rejectFollow(userId));
      }

      // 차단 실행
      actions.push(() => followApi.blockFollow(userId));

      return executeMultipleActions(actions, FOLLOW_ERROR_MESSAGES.BLOCK_FOLLOWER_FAILED);
    }

    return executeAction(
      () => followApi.blockFollow(userId),
      FOLLOW_ERROR_MESSAGES.BLOCK_FAILED
    );
  }, [userId, actionType, followStatus, followData, executeAction, executeMultipleActions]);

  const unblock = useCallback(() => {
    if (!userId) return;
    return executeAction(
      () => followApi.unblockFollow(userId),
      FOLLOW_ERROR_MESSAGES.UNBLOCK_FAILED
    );
  }, [userId, executeAction]);

  const removeFollower = useCallback(() => {
    if (!userId) return;
    return executeAction(
      () => followApi.removeFollower(userId),
      FOLLOW_ERROR_MESSAGES.REMOVE_FOLLOWER_FAILED
    );
  }, [userId, executeAction]);

  return {
    followStatus,
    followData, // 전체 응답 데이터 반환
    isLoading,
    isChecking,
    hasChecked,
    error,
    checkFollowStatus,
    requestFollow,
    acceptFollow,
    rejectFollow,
    unfollow,
    block,
    unblock,
    removeFollower,
    setError,
  };
}

