import { useCallback } from 'react';
import { useNotificationList } from './useNotificationList';
import { useUnreadCount } from './useUnreadCount';
import { useNotificationMark } from './useNotificationMark';
import type { NotificationResponseDto } from '../types/notification.types';

export interface UseNotificationsOptions {
  /** SSE 구독 활성화 여부 */
  enableSse?: boolean;
  /** 읽지 않은 개수 주기적 갱신 간격 (밀리초) */
  unreadCountRefreshInterval?: number;
}

export interface UseNotificationsReturn {
  /** 알림 목록 */
  notifications: NotificationResponseDto[];
  /** 읽지 않은 알림 개수 */
  unreadCount: number;
  /** 로딩 중인지 여부 (초기 로드) */
  isLoading: boolean;
  /** 더 많은 알림을 로딩 중인지 여부 */
  isLoadingMore: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 더 불러올 알림이 있는지 여부 */
  hasMore: boolean;
  /** 특정 알림 읽음 처리 */
  markAsRead: (id: number) => Promise<void>;
  /** 모든 알림 읽음 처리 */
  markAllAsRead: () => Promise<void>;
  /** 더 많은 알림 불러오기 */
  loadMore: () => void;
  /** 알림 목록 새로고침 */
  reload: () => void;
}

/**
 * 알림 기능을 통합 제공하는 메인 훅
 * 
 * 내부적으로 다음 훅들을 조합하여 사용:
 * - useNotificationList: 알림 목록 조회 및 페이징
 * - useUnreadCount: 읽지 않은 알림 개수 조회
 * - useNotificationMark: 알림 읽음 처리
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { unreadCountRefreshInterval } = options;

  // 알림 목록 조회 및 페이징
  const notificationList = useNotificationList({ autoLoad: true });

  // 읽지 않은 알림 개수 조회
  const unreadCount = useUnreadCount({
    autoLoad: true,
    refreshInterval: unreadCountRefreshInterval,
  });

  // 알림 읽음 처리 API 호출만 담당 (낙관적 업데이트는 useNotifications에서 처리)
  const notificationMark = useNotificationMark();

  /**
   * 특정 알림 읽음 처리 (목록과 읽지 않은 개수 동기화)
   */
  const markAsRead = useCallback(
    async (id: number) => {
      // 낙관적 업데이트: 알림 목록에서 읽음 처리
      const notification = notificationList.notifications.find((n) => n.id === id);
      const wasUnread = notification && !notification.is_read;
      
      if (wasUnread) {
        // 낙관적 업데이트: 즉시 UI 업데이트
        notificationList.updateNotification(id, { is_read: true });
        unreadCount.decrement();
      }

      try {
        await notificationMark.markAsRead(id);
      } catch (err) {
        // 에러 발생 시 롤백
        if (wasUnread) {
          notificationList.updateNotification(id, { is_read: false });
          unreadCount.increment();
        }
        throw err;
      }
    },
    [notificationList, notificationMark, unreadCount]
  );

  /**
   * 모든 알림 읽음 처리 (목록과 읽지 않은 개수 동기화)
   */
  const markAllAsRead = useCallback(async () => {
    // 낙관적 업데이트: 즉시 UI 업데이트
    const unreadNotifications = notificationList.notifications.filter((n) => !n.is_read);
    const unreadCountBefore = unreadCount.unreadCount;

    unreadNotifications.forEach((notification) => {
      notificationList.updateNotification(notification.id, { is_read: true });
    });
    unreadCount.reset();

    try {
      await notificationMark.markAllAsRead(unreadCountBefore);
    } catch (err) {
      // 에러 발생 시 롤백
      unreadNotifications.forEach((notification) => {
        notificationList.updateNotification(notification.id, { is_read: false });
      });
      unreadCount.setValue(unreadCountBefore);
      throw err;
    }
  }, [notificationList, notificationMark, unreadCount]);

  /**
   * 알림 목록 새로고침 (읽지 않은 개수도 함께 새로고침)
   */
  const reload = useCallback(() => {
    notificationList.reload();
    unreadCount.refresh();
  }, [notificationList, unreadCount]);

  // 에러 우선순위: 목록 에러 > 읽지 않은 개수 에러 > 읽음 처리 에러
  const error =
    notificationList.error || notificationMark.error || unreadCount.error || null;

  return {
    notifications: notificationList.notifications,
    unreadCount: unreadCount.unreadCount,
    isLoading: notificationList.isLoading,
    isLoadingMore: notificationList.isLoadingMore,
    error,
    hasMore: notificationList.hasMore,
    markAsRead,
    markAllAsRead,
    loadMore: notificationList.loadMore,
    reload,
  };
}
