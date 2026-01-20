// features/follow/types/follow.types.ts

import type { UserResponseDto } from '@/features/auth/types/user';

/**
 * 팔로우 상태
 * 백엔드 FollowStatus enum과 일치
 */
export type FollowStatus = 'PENDING' | 'FOLLOWING' | 'REJECTED' | 'CANCELLED' | 'BLOCKED';

/**
 * 팔로우 요청 방향
 * PENDING 상태일 때 요청이 어느 방향으로 갔는지 표시
 * 백엔드: "target_to_me" | "viewer_to_target"
 * 프론트엔드: "TO_ME" | "FROM_ME"
 */
export type PendingDirection = 'TO_ME' | 'FROM_ME';

/**
 * 백엔드 pending_direction 값을 프론트엔드 타입으로 변환
 */
export function normalizePendingDirection(value: string | null | undefined): PendingDirection | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === 'target_to_me' || normalized === 'to_me') {
    return 'TO_ME';
  }
  if (normalized === 'viewer_to_target' || normalized === 'from_me') {
    return 'FROM_ME';
  }
  return null;
}

/**
 * 팔로우 상태 응답 DTO
 * 백엔드 FollowResponseDto와 일치
 * 양방향 관계 정보 포함
 */
export interface FollowResponseDto {
  /** viewer → target 방향의 팔로우 상태 */
  status: FollowStatus;
  /** target → viewer 방향의 팔로우 상태 (역방향) */
  reverse_status?: FollowStatus | null;
  /** PENDING 상태일 때 요청 방향 (TO_ME: 상대가 나에게 요청, FROM_ME: 내가 상대에게 요청) */
  pending_direction?: PendingDirection | null;
  /** 내가 상대를 차단했는지 여부 */
  is_blocked_by_me?: boolean;
  /** 상대가 나를 차단했는지 여부 */
  is_blocked_by_target?: boolean;
  /** 팔로우 시작 시간 (ISO 8601) */
  followed_at?: string | null;
  /** 팔로우 요청 시간 (ISO 8601) */
  requested_at?: string | null;
  /** 생성 시간 (ISO 8601) */
  created_at?: string | null;
  /** 업데이트 시간 (ISO 8601) */
  updated_at?: string | null;
}

/**
 * 팔로워/팔로잉 목록 조회용 DTO
 * 백엔드 FollowUserResponseDto와 일치
 * UserResponseDto의 모든 필드 + 양방향 관계 정보 포함
 */
export interface FollowUserResponseDto extends UserResponseDto {
  /** viewer → target 방향의 팔로우 상태 (목록에서는 없을 수 있음) */
  follow_status?: FollowStatus;
  /** target → viewer 방향의 팔로우 상태 (역방향) */
  reverse_follow_status?: FollowStatus | null;
  /** PENDING 상태일 때 요청 방향 (백엔드: "target_to_me" | "viewer_to_target") */
  pending_direction?: string | PendingDirection | null;
  /** 내가 상대를 차단했는지 여부 */
  is_blocked_by_me?: boolean;
  /** 상대가 나를 차단했는지 여부 */
  is_blocked_by_target?: boolean;
  /** 팔로우 시작 시간 (ISO 8601) */
  followed_at?: string | null;
  /** 팔로우 요청 시간 (ISO 8601) */
  requested_at?: string | null;
}

/**
 * 팔로우 수 응답 DTO
 * 백엔드 FollowCountResponseDto와 일치
 */
export interface FollowCountResponseDto {
  followers_count: number;
  following_count: number;
}

