// features/follow/api/follow.api.ts

import { api } from '@/shared/api/axios';
import type { CustomResponse, PageResponse } from '@/shared/types/api';
import type {
  FollowStatus,
  FollowResponseDto,
  FollowUserResponseDto,
  FollowCountResponseDto,
} from '../types/follow.types';

export const followApi = {
  /**
   * 팔로우 요청
   * POST /users/{followingId}/follow
   */
  requestFollow: (followingId: number) =>
    api.post<CustomResponse<void>>(`/users/${followingId}/follow`),

  /**
   * 팔로우 수락
   * POST /users/{followerId}/follow/accept
   */
  acceptFollow: (followerId: number) =>
    api.post<CustomResponse<void>>(`/users/${followerId}/follow/accept`),

  /**
   * 팔로우 거절
   * POST /users/{followerId}/follow/reject
   */
  rejectFollow: (followerId: number) =>
    api.post<CustomResponse<void>>(`/users/${followerId}/follow/reject`),

  /**
   * 팔로우 차단
   * POST /users/{blockUserId}/follow/block
   */
  blockFollow: (blockUserId: number) =>
    api.post<CustomResponse<void>>(`/users/${blockUserId}/follow/block`),

  /**
   * 팔로우 차단 해제
   * DELETE /users/{followingId}/follow/block
   */
  unblockFollow: (followingId: number) =>
    api.delete<CustomResponse<void>>(`/users/${followingId}/follow/block`),

  /**
   * 언팔로우
   * DELETE /users/{followingId}/follow
   */
  unfollow: (followingId: number) =>
    api.delete<CustomResponse<void>>(`/users/${followingId}/follow`),

  /**
   * 팔로우 상태 조회
   * GET /users/{followingId}/follow
   */
  getFollowStatus: (followingId: number) =>
    api.get<CustomResponse<FollowResponseDto>>(`/users/${followingId}/follow`),

  /**
   * 내 팔로워 목록 조회
   * GET /users/me/followers
   * 양방향 관계 정보 포함 (N+1 방지)
   */
  getFollowers: (status?: FollowStatus, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<FollowUserResponseDto>>>('/users/me/followers', {
      params: { status, page, size },
    }),

  /**
   * 내 팔로잉 목록 조회
   * GET /users/me/following
   * 양방향 관계 정보 포함 (N+1 방지)
   */
  getFollowing: (status?: FollowStatus, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<FollowUserResponseDto>>>('/users/me/following', {
      params: { status, page, size },
    }),

  /**
   * 팔로우 수 조회
   * GET /users/me/follow/count
   */
  getFollowCount: (status?: FollowStatus) =>
    api.get<CustomResponse<FollowCountResponseDto>>('/users/me/follow/count', {
      params: { status },
    }),

  /**
   * 팔로워 삭제 (Remove)
   * 상대가 나를 팔로우하고 있는 관계를 강제로 종료시키는 행위
   * DELETE /users/me/followers/{followerId}
   */
  removeFollower: (followerId: number) =>
    api.delete<CustomResponse<void>>(`/users/me/followers/${followerId}`),
};

