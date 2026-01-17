import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationApi } from '../api/notification.api';
import type { NotificationResponseDto } from '../types/notification.types';
import { NOTIFICATION_PAGE_SIZE, DEFAULT_PAGE } from '../constants/notification.constants';
import { getNotificationErrorMessage } from '../utils/error.utils';

export interface UseNotificationListOptions {
  /** 초기 로드 시 자동으로 알림 목록을 불러올지 여부 */
  autoLoad?: boolean;
}

export interface UseNotificationListReturn {
  /** 알림 목록 */
  notifications: NotificationResponseDto[];
  /** 로딩 중인지 여부 (초기 로드) */
  isLoading: boolean;
  /** 더 많은 알림을 로딩 중인지 여부 */
  isLoadingMore: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 더 불러올 알림이 있는지 여부 */
  hasMore: boolean;
  /** 알림 목록 새로고침 */
  reload: () => void;
  /** 더 많은 알림 불러오기 */
  loadMore: () => void;
  /** 특정 알림 업데이트 */
  updateNotification: (id: number, updates: Partial<NotificationResponseDto>) => void;
  /** 특정 알림 삭제 */
  removeNotification: (id: number) => void;
}

/**
 * 알림 목록 조회 및 페이징을 담당하는 훅
 */
export function useNotificationList(
  options: UseNotificationListOptions = {}
): UseNotificationListReturn {
  const { autoLoad = true } = options;

  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [hasMore, setHasMore] = useState(true);

  // 레이스 컨디션 방지를 위한 요청 ID 추적
  const requestIdRef = useRef(0);

  /**
   * 알림 목록 조회
   */
  const loadNotifications = useCallback(
    async (targetPage: number, reset = false) => {
      const currentRequestId = ++requestIdRef.current;

      if (targetPage === DEFAULT_PAGE) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const response = await notificationApi.getNotifications(
          targetPage,
          NOTIFICATION_PAGE_SIZE
        );

        // 최신 요청인지 확인
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const pageData = response.data.data;
        const newNotifications = pageData.content || [];

        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }

        // last 필드가 없으면 content 길이로 판단
        const isLast = pageData.last ?? newNotifications.length < NOTIFICATION_PAGE_SIZE;
        setHasMore(!isLast);
      } catch (err) {
        // 최신 요청인지 확인
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const errorMessage = getNotificationErrorMessage(err);
        setError(errorMessage);
      } finally {
        // 최신 요청인지 확인
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    []
  );

  /**
   * 더 많은 알림 불러오기
   */
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setPage((prev) => prev + 1);
  }, [isLoadingMore, hasMore]);

  /**
   * 알림 목록 새로고침
   */
  const reload = useCallback(() => {
    setPage(DEFAULT_PAGE);
    setError(null);
    loadNotifications(DEFAULT_PAGE, true);
  }, [loadNotifications]);

  /**
   * 특정 알림 업데이트
   */
  const updateNotification = useCallback(
    (id: number, updates: Partial<NotificationResponseDto>) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, ...updates } : notification
        )
      );
    },
    []
  );

  /**
   * 특정 알림 삭제
   */
  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  // 초기 로드
  useEffect(() => {
    if (autoLoad) {
      loadNotifications(DEFAULT_PAGE, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 페이지 변경 시 추가 로드
  useEffect(() => {
    if (page > DEFAULT_PAGE) {
      loadNotifications(page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return {
    notifications,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    reload,
    loadMore,
    updateNotification,
    removeNotification,
  };
}

