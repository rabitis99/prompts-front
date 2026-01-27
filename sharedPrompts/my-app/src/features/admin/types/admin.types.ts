/**
 * 관리자 관련 타입 정의
 * 백엔드 DTO와 일치
 */

import type { PromptCategory } from '@/features/prompt/types/prompt.types';
import type { UserResponseDto } from '@/features/auth/types/user';
import type { FollowStatus } from '@/features/follow/types/follow.types';

/**
 * 사용자 역할 (백엔드 enum과 일치)
 */
export type UserRole = 'USER' | 'ADMIN';

/**
 * 사용자 차단 요청 DTO
 */
export interface UserBlockRequestDto {
  blocked: boolean;
  block_reason?: string;
}

/**
 * 사용자 권한 변경 요청 DTO
 */
export interface UserRoleChangeRequestDto {
  role: UserRole;
}

/**
 * 관리자용 사용자 응답 DTO
 */
export interface AdminUserResponseDto extends UserResponseDto {
  role: UserRole;
  is_blocked: boolean;
  block_reason?: string;
  blocked_at?: string;
  prompts_count: number;
  reports_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * 관리자용 팔로우 관계 응답 DTO
 * 백엔드 AdminController.getFollows에서 Page<UserResponseDto>를 반환하지만,
 * 프론트에서는 추가 메타 정보(팔로우 방향, 상태)를 함께 다루기 위해 별도 타입을 둔다.
 */
export interface AdminFollowUserDto extends UserResponseDto {
  /**
   * 팔로우 상태 (백엔드 FollowStatus enum과 일치)
   */
  follow_status: FollowStatus;

  /**
   * 조회 기준
   * - follower: 해당 유저가 follower로서 목록에 노출
   * - following: 해당 유저가 following으로서 목록에 노출
   */
  relation_type: 'follower' | 'following';
}

/**
 * 프롬프트 공개/비공개 전환 요청 DTO
 */
export interface PromptVisibilityRequestDto {
  is_public: boolean;
}

/**
 * 관리자용 프롬프트 응답 DTO
 */
export interface AdminPromptResponseDto {
  id: number;
  title: string;
  description: string;
  content: string;
  is_public: boolean;
  prompt_category: PromptCategory;
  tags: string[];
  user_response_dto: UserResponseDto;
  view_count: number;
  comment_count: number;
  like_count: number;
  reports_count?: number;
  created_at: string;
  updated_at: string;
}

/**
 * 감사 로그 액션 (백엔드 enum과 일치)
 */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'BLOCK' | 'UNBLOCK' | 'ROLE_CHANGE';

/**
 * 감사 로그 엔티티 타입 (백엔드 enum과 일치)
 */
export type AuditEntityType = 'USER' | 'PROMPT' | 'REPORT' | 'COMMENT';

/**
 * 감사 로그 응답 DTO
 */
export interface AuditLogResponseDto {
  id: number;
  actor_id: number;
  actor_nickname: string;
  entity_type: AuditEntityType;
  entity_id: number;
  action: AuditAction;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * 인증 이벤트 타입 (백엔드 enum과 일치)
 */
export type AuthEventType = 'LOGIN_SUCCESS' | 'LOGIN_FAIL' | 'LOGOUT' | 'TOKEN_REFRESH' | 'TOKEN_REFRESH_FAIL';

/**
 * 인증 실패 사유 (백엔드 enum과 일치)
 */
export type AuthFailReason =
  | 'INVALID_PASSWORD'
  | 'USER_NOT_FOUND'
  | 'USER_BLOCKED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'OAUTH2_STATE_MISMATCH'
  | 'OAUTH2_TOKEN_INVALID'
  | 'OAUTH2_INVALID_CODE'
  | 'OAUTH2_AUTHENTICATION_FAILED'
  | 'ETC';

/**
 * Provider (백엔드 enum과 일치)
 */
export type Provider = 'LOCAL' | 'GOOGLE' | 'NAVER' | 'KAKAO';

/**
 * 인증 보안 이벤트 로그 응답 DTO
 */
export interface AuthAuditLogResponseDto {
  id: number;
  event_type: AuthEventType;
  provider?: Provider;
  provider_id_hash?: string;
  user_id?: number;
  fail_reason?: AuthFailReason;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * Rate Limit 타입 (백엔드 enum과 일치)
 */
export type RateLimitType = 'API' | 'AUTH' | 'OAUTH2';

/**
 * Rate Limit 로그 응답 DTO
 */
export interface RateLimitLogResponseDto {
  id: number;
  rule_name: string;
  rate_limit_key: string;
  current_count: number;
  capacity: number;
  retry_after?: number;
  user_id?: number;
  client_ip?: string;
  uri?: string;
  http_method?: string;
  rate_limit_type: RateLimitType;
  created_at: string;
}

/**
 * Rate Limit 통계 응답 DTO
 */
export interface RateLimitLogStatisticsResponseDto {
  hourly_stats: Record<number, number>; // 0-23시별 통계
  rule_stats: Record<string, number>; // 규칙별 통계
  type_stats: Record<RateLimitType, number>; // 타입별 통계
  top_violating_ips: TopViolatorDto[]; // 최다 위반 IP 목록
  top_violating_users: TopViolatorDto[]; // 최다 위반 사용자 목록
  start_date: string;
  end_date: string;
}

/**
 * 위반자 정보 DTO
 */
export interface TopViolatorDto {
  identifier: string; // IP 주소 또는 사용자 ID
  violation_count: number;
}

/**
 * 유지보수 작업 상태 (백엔드 enum과 일치)
 */
export type MaintenanceJobStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

/**
 * 좋아요 수 재빌드 상태 응답 DTO
 */
export interface RebuildLikeCountsStatusResponseDto {
  status: MaintenanceJobStatus;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

