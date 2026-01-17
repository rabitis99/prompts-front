import { useState, useCallback } from 'react';
import { notificationApi } from '../api/notification.api';
import type { NotificationResponseDto } from '../types/notification.types';
import { getNotificationErrorMessage } from '../utils/error.utils';

export interface UseNotificationMarkOptions {
  // 옵션이 필요하면 여기에 추가
}

export interface UseNotificationMarkReturn {
  /** 특정 알림 읽음 처리 중인지 여부 */
  isMarking: boolean;
  /** 모든 알림 읽음 처리 중인지 여부 */
  isMarkingAll: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 특정 알림 읽음 처리 */
  markAsRead: (id: number) => Promise<void>;
  /** 모든 알림 읽음 처리 */
  markAllAsRead: (unreadCount: number) => Promise<void>;
}

/**
 * 알림 읽음 처리를 담당하는 훅
 */
/**
 * 알림 읽음 처리를 담당하는 훅
 * 
 * 순수하게 API 호출만 담당하며, 상태 관리는 사용하는 컴포넌트나 상위 훅에서 처리합니다.
 */
export function useNotificationMark(
  _options: UseNotificationMarkOptions = {}
): UseNotificationMarkReturn {
  const [isMarking, setIsMarking] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 특정 알림 읽음 처리
   */
  const markAsRead = useCallback(async (id: number) => {
    setIsMarking(true);
    setError(null);

    try {
      await notificationApi.markAsRead(id);
    } catch (err) {
      const errorMessage = getNotificationErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to mark notification as read:', errorMessage);
      throw err;
    } finally {
      setIsMarking(false);
    }
  }, []);

  /**
   * 모든 알림 읽음 처리
   * 
   * @param unreadCount 읽지 않은 알림 개수 (참고용, 실제 사용하지 않음)
   */
  const markAllAsRead = useCallback(async (_unreadCount: number) => {
    setIsMarkingAll(true);
    setError(null);

    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      const errorMessage = getNotificationErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to mark all notifications as read:', errorMessage);
      throw err;
    } finally {
      setIsMarkingAll(false);
    }
  }, []);

  return {
    isMarking,
    isMarkingAll,
    error,
    markAsRead,
    markAllAsRead,
  };
}

