/**
 * 알림 관련 에러 처리 유틸리티
 */

import { AxiosError } from 'axios';

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
}

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 */
export function getNotificationErrorMessage(error: unknown): string {
  if (!error) {
    return '알림을 불러오는데 실패했습니다.';
  }

  const err = error as AxiosError<ApiErrorResponse>;

  // 타임아웃 에러
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
  }

  // 인증 에러
  if (err.response?.status === 401) {
    return '인증이 만료되었습니다. 다시 로그인해주세요.';
  }

  // 서버 에러 메시지
  if (err.response?.data?.error?.message) {
    return err.response.data.error.message;
  }

  // 일반 에러 메시지 (개발 환경에서만 로깅)
  if (err.message && import.meta.env.DEV) {
    console.error('Notification error:', err.message);
  }

  return '알림을 불러오는데 실패했습니다.';
}

