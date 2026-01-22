/**
 * 사용자 공개 프로필 관련 타입 정의
 * 백엔드 PublicFollowState enum 및 UserPublicProfileDto와 일치
 */

/**
 * 공개 프로필용 Follow 상태
 * 백엔드 PublicFollowState enum과 일치
 * - FOLLOWING: 팔로우 중
 * - PENDING: 팔로우 요청 대기 중
 * - NONE: 관계 없음 (REJECTED, CANCELLED, BLOCKED 등은 NONE으로 통합)
 */
export type PublicFollowState = 'FOLLOWING' | 'PENDING' | 'NONE';

/**
 * 다른 사용자의 공개 프로필 조회용 DTO
 * 백엔드 UserPublicProfileDto와 JSON 필드 기준으로 정렬
 */
export interface UserPublicProfileDto {
  id: number;
  nickname: string;
  thumbnail?: string;
  followers_count: number;
  following_count: number;
  follow_state?: PublicFollowState;
}

