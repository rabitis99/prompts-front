import { api } from '@/shared/api/axios';
import type {
  NotificationResponseDto,
  NotificationSummaryDto,
} from '../types/notification.types';
import type { CustomResponse, PageResponse } from '@/shared/types/api';

/**
 * 알림 API
 * 백엔드: NotificationController
 */
export const notificationApi = {
  /**
   * 알림 목록 조회 (페이징)
   * 백엔드: GET /notifications
   */
  getNotifications: (page: number = 0, size: number = 20) =>
    api.get<CustomResponse<PageResponse<NotificationResponseDto>>>(
      '/notifications',
      {
        params: { page, size },
      }
    ),

  /**
   * 읽지 않은 알림 개수 조회
   * 백엔드: GET /notifications/unread-count
   */
  getUnreadCount: () =>
    api.get<CustomResponse<NotificationSummaryDto>>(
      '/notifications/unread-count'
    ),

  /**
   * 특정 알림 읽음 처리
   * 백엔드: PATCH /notifications/{id}/read
   */
  markAsRead: (id: number) =>
    api.patch<void>(`/notifications/${id}/read`),

  /**
   * 모든 알림 읽음 처리
   * 백엔드: PATCH /notifications/read-all
   */
  markAllAsRead: () =>
    api.patch<void>('/notifications/read-all'),

  /**
   * 실시간 알림 구독 (SSE)
   * 백엔드: GET /notifications/subscribe
   * 
   * Note: SSE는 EventSource를 사용해야 하므로 별도 유틸리티 함수로 구현 필요
   * @see notificationSseService
   */
};

