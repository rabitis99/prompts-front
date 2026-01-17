// shared/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Custom Response (백엔드 응답 형식)
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