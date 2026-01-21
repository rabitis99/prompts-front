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
 */
export type PublicFollowState = 'FOLLOWING' | 'PENDING' | 'NONE';

/**
 * 다른 사용자의 공개 프로필 조회용 DTO
 */
export interface UserPublicProfileDto {
  userId: number;
  nickname: string;
  profileImageUrl?: string;
  bio?: string;
  promptCount: number;
  followerCount: number;
  followingCount: number;
  followStatus?: PublicFollowState;
}