/**
 * 사용자 관련 타입 정의
 */

import type { Provider } from './user.enums';
import type { UserTermsResponseDto, UserTermsRequestDto } from './user.terms';

/**
 * 사용자 응답 DTO
 * 백엔드 UserResponseDto와 일치
 */
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

/**
 * 사용자 정보 수정 요청 DTO
 */
export interface UserUpdateRequestDto {
  nickname?: string;
  age?: number;
  job?: string;
  thumbnail?: string;
  user_terms?: UserTermsRequestDto;
}

/**
 * 비밀번호 변경 요청 DTO
 */
export interface PasswordChangeRequestDto {
  current_password: string;
  new_password: string;
}

/**
 * 레거시 User 타입 (호환성 유지)
 * @deprecated 신규 개발 시 UserResponseDto를 사용하세요.
 * 기존 코드와의 호환성을 위해 유지되지만, 새로운 코드에서는 사용하지 않는 것을 권장합니다.
 */
export interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
  provider: string;
  status: boolean;
}

// Re-export for convenience
export type { Provider } from './user.enums';
export type { PublicFollowState, UserPublicProfileDto } from './user.profile';
export type { UserTermsResponseDto, UserTermsRequestDto } from './user.terms';