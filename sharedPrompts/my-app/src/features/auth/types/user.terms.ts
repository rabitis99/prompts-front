/**
 * 사용자 약관 관련 타입 정의
 */

/**
 * 사용자 약관 응답 DTO
 */
export interface UserTermsResponseDto {
  required: boolean;
  privacy: boolean;
  marketing: boolean;
}

/**
 * 사용자 약관 요청 DTO
 */
export interface UserTermsRequestDto {
  required: boolean;
  privacy: boolean;
  marketing: boolean;
}

