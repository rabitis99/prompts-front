/**
 * Sentry 에러 모니터링 설정
 * 
 * 사용 방법:
 * 1. Sentry 계정 생성 및 프로젝트 생성
 * 2. 환경 변수에 VITE_SENTRY_DSN 추가
 * 3. 이 파일에서 Sentry 초기화
 */

import * as Sentry from '@sentry/react';

/**
 * Sentry 초기화
 * 환경 변수 VITE_SENTRY_DSN이 설정되어 있을 때만 활성화
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured. Error monitoring is disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    
    // 에러 필터링
    beforeSend(event, hint) {
      // 개발 환경에서는 모든 에러 전송
      if (import.meta.env.MODE === 'development') {
        return event;
      }
      
      // 특정 에러는 무시 (예: 네트워크 에러 중 일부)
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // 특정 에러 메시지 무시
          if (error.message.includes('ResizeObserver loop')) {
            return null;
          }
        }
      }
      
      return event;
    },
  });
}

/**
 * 사용자 컨텍스트 설정
 */
export function setSentryUser(user: { id: number | string; email?: string; username?: string }) {
  Sentry.setUser({
    id: String(user.id),
    email: user.email,
    username: user.username,
  });
}

/**
 * 사용자 컨텍스트 제거 (로그아웃 시)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * 커스텀 에러 로깅
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * 커스텀 메시지 로깅
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

