/**
 * 에러 로깅 유틸리티
 * Sentry로 에러를 전송합니다.
 */

import { captureError } from './sentry';

interface ErrorContext {
  userAgent?: string;
  url?: string;
  timestamp?: string;
  userId?: string;
  [key: string]: unknown;
}

/**
 * 에러를 외부 모니터링 서비스로 전송
 */
export function logErrorToService(
  error: Error,
  errorInfo?: {
    componentStack?: string;
    errorBoundary?: string;
  },
  context?: ErrorContext
) {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    errorBoundary: errorInfo?.errorBoundary,
    context: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      ...context,
    },
  };

  // 개발 환경에서는 console에 로깅
  if (import.meta.env.MODE === 'development') {
    console.error('Error Report:', errorReport);
  }

  // Sentry로 전송 (DSN이 설정되어 있을 때만)
  captureError(error, {
    ...errorReport.context,
    componentStack: errorInfo?.componentStack,
    errorBoundary: errorInfo?.errorBoundary,
  });
}

/**
 * API 에러를 로깅
 */
export function logApiError(
  error: Error,
  requestInfo?: {
    method?: string;
    url?: string;
    status?: number;
  }
) {
  logErrorToService(error, undefined, {
    type: 'api_error',
    method: requestInfo?.method,
    url: requestInfo?.url,
    status: requestInfo?.status,
  });
}

