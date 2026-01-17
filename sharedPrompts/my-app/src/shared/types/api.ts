// shared/types/api.ts

/**
 * Legacy API 응답 형식 (호환성 유지용)
 * @deprecated 신규 개발 시 CustomResponse를 사용하세요.
 * 기존 코드와의 호환성을 위해 유지되지만, 새로운 API 응답은 CustomResponse를 사용합니다.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * 백엔드 표준 API 응답 형식
 * 모든 새로운 API 엔드포인트는 이 형식을 사용합니다.
 * CustomResponse는 에러 정보를 구조화된 형태로 제공합니다.
 */
export interface CustomResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    fieldName?: string;
  };
}

// Page Response (백엔드 PageResponse와 일치)
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages?: number;
  last?: boolean;
}