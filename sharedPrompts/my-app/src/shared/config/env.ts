/**
 * 필수 환경 변수 정의
 */
const requiredEnvVars = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_OAUTH2_REDIRECT_FRONT_URL: import.meta.env.VITE_OAUTH2_REDIRECT_FRONT_URL,
} as const;

/**
 * 선택적 환경 변수
 */
const optionalEnvVars = {
  VITE_OAUTH2_FAILURE_REDIRECT_URL: import.meta.env.VITE_OAUTH2_FAILURE_REDIRECT_URL,
} as const;

/**
 * 환경 변수 검증
 * 런타임에 필수 환경 변수가 없으면 에러를 발생시킵니다.
 */
function validateEnvVars() {
  const missing: string[] = [];

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (value === undefined || value === null || String(value).trim() === '') {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// 앱 시작 시 환경 변수 검증
validateEnvVars();

/**
 * 검증된 환경 변수 export
 */
export const ENV = {
  OAUTH_SUCCESS_URL: requiredEnvVars.VITE_OAUTH2_REDIRECT_FRONT_URL,
  OAUTH_FAILURE_URL: optionalEnvVars.VITE_OAUTH2_FAILURE_REDIRECT_URL || '/login?error=oauth',
  API_BASE_URL: requiredEnvVars.VITE_API_BASE_URL,
} as const;
