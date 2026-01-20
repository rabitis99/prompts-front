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

