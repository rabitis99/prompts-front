/**
 * API 에러에서 메시지를 추출하는 유틸리티 함수
 */
export function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
    return axiosError.response?.data?.error?.message || defaultMessage;
  }
  return defaultMessage;
}

