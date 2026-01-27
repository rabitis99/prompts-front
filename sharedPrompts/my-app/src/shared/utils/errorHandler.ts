/**
 * 일관된 에러 처리 유틸리티
 * 모든 컴포넌트에서 동일한 방식으로 에러를 처리합니다.
 */

import { getUserFriendlyErrorMessage, ERROR_POLICY } from '@/shared/config/policy';

export interface AppError extends Error {
  statusCode?: number;
  isRetryable?: boolean;
  originalError?: unknown;
}

/**
 * 에러를 AppError로 변환
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof Error) {
    const appError = error as AppError;
    
    // Axios 에러인 경우
    if ('response' in error && (error as any).response) {
      const axiosError = error as any;
      appError.statusCode = axiosError.response?.status;
      appError.isRetryable = ERROR_POLICY.retryableErrors.includes(axiosError.response?.status);
    }
    
    return appError;
  }
  
  // 알 수 없는 에러 타입
  return {
    name: 'UnknownError',
    message: '알 수 없는 오류가 발생했습니다.',
    originalError: error,
  } as AppError;
}

/**
 * 사용자에게 표시할 에러 메시지 가져오기
 */
export function getUserMessage(error: unknown): string {
  const appError = normalizeError(error);
  
  if (appError.statusCode) {
    return getUserFriendlyErrorMessage(appError.statusCode);
  }
  
  return appError.message || '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러가 재시도 가능한지 확인
 */
export function isRetryableError(error: unknown): boolean {
  const appError = normalizeError(error);
  return appError.isRetryable ?? false;
}

/**
 * React Hook으로 에러 처리
 */
import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);

  const handleError = useCallback((err: unknown) => {
    const appError = normalizeError(err);
    setError(appError);
    setIsRetryable(appError.isRetryable ?? false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setIsRetryable(false);
  }, []);

  return {
    error,
    errorMessage: error ? getUserMessage(error) : null,
    isRetryable,
    handleError,
    clearError,
  };
}

