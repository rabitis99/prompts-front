// Notification 관련 타입 정의

/**
 * 백엔드 NotificationType enum과 매칭
 * 백엔드: org.example.sharedprompts.domain.notification.enums.NotificationType
 */
export type NotificationType = 'COMMENT' | 'LIKE';

/**
 * 백엔드 NotificationResponseDto와 매칭
 * 백엔드: org.example.sharedprompts.dto.notification.response.NotificationResponseDto
 */
export interface NotificationResponseDto {
  id: number;
  type: NotificationType;
  related_entity_id: number;
  actor_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

/**
 * 백엔드 NotificationSummaryDto와 매칭
 * 백엔드: org.example.sharedprompts.dto.notification.response.NotificationSummaryDto
 */
export interface NotificationSummaryDto {
  unread_count: number;
}

