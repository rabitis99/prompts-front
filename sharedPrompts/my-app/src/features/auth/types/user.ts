// features/auth/types/user.ts

export type Provider = 'LOCAL' | 'GOOGLE' | 'KAKAO' | 'NAVER';

export interface UserTermsResponseDto {
  required: boolean;
  privacy: boolean;
  marketing: boolean;
}

export interface UserTermsRequestDto {
  required: boolean;
  privacy: boolean;
  marketing: boolean;
}

export interface UserResponseDto {
  id: number;
  email: string;
  provider: Provider;
  nickname: string;
  age?: number;
  job?: string;
  thumbnail?: string;
  is_signup_completed?: boolean;
  user_terms?: UserTermsResponseDto;
}

export interface UserUpdateRequestDto {
  nickname?: string;
  age?: number;
  job?: string;
  thumbnail?: string;
  user_terms?: UserTermsRequestDto;
}

export interface PasswordChangeRequestDto {
  current_password: string;
  new_password: string;
}

// 기존 User 타입 (호환성 유지)
export interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
  provider: string;
  status: boolean;
}

/**
 * 공개 프로필용 Follow 상태
 * 백엔드 PublicFollowState enum과 일치
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