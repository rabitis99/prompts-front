import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../api/notification.api';
import type { NotificationSummaryDto } from '../types/notification.types';
import { getNotificationErrorMessage } from '../utils/error.utils';

export interface UseUnreadCountOptions {
  /** 초기 로드 시 자동으로 읽지 않은 개수를 불러올지 여부 */
  autoLoad?: boolean;
  /** 주기적으로 읽지 않은 개수를 갱신할지 여부 (밀리초) */
  refreshInterval?: number;
}

export interface UseUnreadCountReturn {
  /** 읽지 않은 알림 개수 */
  unreadCount: number;
  /** 로딩 중인지 여부 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 읽지 않은 개수 새로고침 */
  refresh: () => Promise<void>;
  /** 읽지 않은 개수 증가 (낙관적 업데이트) */
  increment: () => void;
  /** 읽지 않은 개수 감소 (낙관적 업데이트) */
  decrement: () => void;
  /** 읽지 않은 개수 리셋 (낙관적 업데이트) */
  reset: () => void;
  /** 읽지 않은 개수 직접 설정 (낙관적 업데이트) */
  setValue: (value: number) => void;
}

/**
 * 읽지 않은 알림 개수 조회를 담당하는 훅
 */
export function useUnreadCount(
  options: UseUnreadCountOptions = {}
): UseUnreadCountReturn {
  const { autoLoad = true, refreshInterval } = options;

  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  /**
   * 읽지 않은 개수 조회
   */
  const fetchUnreadCount = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationApi.getUnreadCount();
      const summary: NotificationSummaryDto = response.data.data;
      setUnreadCount(summary.unread_count);
    } catch (err) {
      const errorMessage = getNotificationErrorMessage(err);
      setError(errorMessage);
      // 읽지 않은 개수 조회 실패는 치명적이지 않으므로 경고만 출력
      console.warn('Failed to load unread count:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 읽지 않은 개수 새로고침
   */
  const refresh = useCallback(async () => {
    await fetchUnreadCount();
  }, [fetchUnreadCount]);

  /**
   * 읽지 않은 개수 증가 (낙관적 업데이트)
   */
  const increment = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  /**
   * 읽지 않은 개수 감소 (낙관적 업데이트)
   */
  const decrement = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * 읽지 않은 개수 리셋 (낙관적 업데이트)
   */
  const reset = useCallback(() => {
    setUnreadCount(0);
  }, []);

  /**
   * 읽지 않은 개수 직접 설정 (낙관적 업데이트)
   */
  const setValue = useCallback((value: number) => {
    setUnreadCount(Math.max(0, value));
  }, []);

  // 초기 로드
  useEffect(() => {
    if (autoLoad) {
      fetchUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 주기적 갱신
  useEffect(() => {
    if (!refreshInterval) return;

    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, fetchUnreadCount]);

  return {
    unreadCount,
    isLoading,
    error,
    refresh,
    increment,
    decrement,
    reset,
    setValue,
  };
}

