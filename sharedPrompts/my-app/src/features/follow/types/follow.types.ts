// features/follow/types/follow.types.ts

import type { UserResponseDto } from '@/features/auth/types/user';
import type { CustomResponse, PageResponse } from '@/shared/types/api';

/**
 * 팔로우 상태
 * 백엔드 FollowStatus enum과 일치
 * 
 * ⚠️ 중요: 모든 상태는 cursor → target 관계 기준
 * ⚠️ MUTUAL 상태 없음
 * 
 * 상태 정의:
 * - PENDING: 내가 상대에게 팔로우 요청 보냄
 * - FOLLOWING: 내가 상대를 팔로우 중
 * - REJECTED: 내 요청이 거절됨
 * - CANCELLED: 내가 요청/팔로우를 취소함
 * - BLOCKED: 내가 상대를 차단함
 * 
 * 상태 전환:
 * - PENDING → CANCELLED(요청 취소)
 * - FOLLOWING → CANCELLED(언팔로우), BLOCKED(차단)
 * - REJECTED → PENDING(재요청)
 * - CANCELLED → PENDING(재요청)
 * - BLOCKED → CANCELLED(차단 해제)
 */
export type FollowStatus = 'PENDING' | 'FOLLOWING' | 'REJECTED' | 'CANCELLED' | 'BLOCKED';

/**
 * 팔로우 상태 응답 DTO
 * 백엔드 FollowResponseDto와 일치
 */
export interface FollowResponseDto {
  status: string; // FollowStatus enum을 문자열로 반환
}

/**
 * 팔로우 수 응답 DTO
 * 백엔드 FollowCountResponseDto와 일치
 */
export interface FollowCountResponseDto {
  followers_count: number;
  following_count: number;
}

/**
 * 팔로우 상태 응답
 */
export type FollowStatusResponse = CustomResponse<FollowResponseDto>;

/**
 * 팔로우 수 응답
 */
export type FollowCountResponse = CustomResponse<FollowCountResponseDto>;

/**
 * 팔로워/팔로잉 목록 응답
 */
export type FollowListResponse = CustomResponse<PageResponse<UserResponseDto>>;

