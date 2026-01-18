// features/follow/types/follow.types.ts

import type { UserResponseDto } from '@/features/auth/types/user';
import type { CustomResponse, PageResponse } from '@/shared/types/api';

/**
 * 팔로우 상태
 * 백엔드 FollowStatus enum과 일치
 */
export type FollowStatus = 'PENDING' | 'FOLLOWING' | 'BLOCKED';

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

