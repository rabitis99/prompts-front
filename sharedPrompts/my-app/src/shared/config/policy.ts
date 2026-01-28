/**
 * 정책 관리 중앙화
 * Rate Limit, 인증 만료, 재로그인 정책 등을 한 곳에서 관리합니다.
 */

/**
 * Rate Limit 정책
 */
export const RATE_LIMIT_POLICY = {
  // 기본 Rate Limit 설정
  maxRequests: 100,
  windowMs: 60000, // 1분
  
  // 엔드포인트별 Rate Limit 설정
  endpoints: {
    '/prompts': {
      maxRequests: 200,
      windowMs: 60000,
    },
    '/auth/login': {
      maxRequests: 5,
      windowMs: 60000,
    },
    '/auth/refresh': {
      maxRequests: 10,
      windowMs: 60000,
    },
  },
} as const;

/**
 * 인증 정책
 */
export const AUTH_POLICY = {
  // Access Token 만료 시간 (초)
  accessTokenExpiry: 3600, // 1시간
  
  // Refresh Token 만료 시간 (초)
  refreshTokenExpiry: 604800, // 7일
  
  // 자동 로그아웃 시간 (밀리초)
  autoLogoutTime: 30 * 60 * 1000, // 30분
  
  // 토큰 갱신 시도 횟수
  maxRefreshAttempts: 3,
} as const;

/**
 * 재시도 정책
 */
export const RETRY_POLICY = {
  // 기본 재시도 횟수
  maxRetries: 3,
  
  // 재시도 간격 (밀리초)
  retryDelay: 1000,
  
  // 재시도 가능한 HTTP 상태 코드
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  
  // 재시도 불가능한 HTTP 상태 코드
  nonRetryableStatusCodes: [400, 401, 403, 404],
} as const;

/**
 * 캐시 정책
 */
export const CACHE_POLICY = {
  // 기본 캐시 TTL (밀리초)
  defaultTTL: 30000, // 30초
  
  // 엔드포인트별 캐시 TTL
  endpoints: {
    '/prompts': 60000, // 1분
    '/prompts/:id': 300000, // 5분
    '/users/:id': 120000, // 2분
    '/likes': 10000, // 10초
  },
  
  // 캐시 무효화 패턴
  invalidationPatterns: {
    'POST /prompts': ['GET /prompts'],
    'PATCH /prompts/:id': ['GET /prompts/:id', 'GET /prompts'],
    'DELETE /prompts/:id': ['GET /prompts/:id', 'GET /prompts'],
    'POST /prompts/:id/likes': ['GET /prompts/:id', 'GET /prompts'],
    'POST /prompts/:id/comments': ['GET /prompts/:id'],
  },
} as const;

/**
 * 에러 처리 정책
 */
export const ERROR_POLICY = {
  // 사용자에게 표시할 에러 메시지 매핑
  userFriendlyMessages: {
    400: '잘못된 요청입니다. 입력값을 확인해주세요.',
    401: '인증이 필요합니다. 다시 로그인해주세요.',
    403: '접근 권한이 없습니다.',
    404: '요청한 리소스를 찾을 수 없습니다.',
    429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    500: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    502: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
    503: '서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
    504: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
  },
  
  // 재시도 가능한 에러
  retryableErrors: [408, 429, 500, 502, 503, 504],
  
  // 로깅할 에러 레벨
  logLevels: {
    error: [500, 502, 503, 504],
    warn: [429, 400],
    info: [401, 403, 404],
  },
} as const;

/**
 * 정책 조회 함수
 */
export function getRateLimitPolicy(endpoint?: string) {
  if (endpoint && RATE_LIMIT_POLICY.endpoints[endpoint as keyof typeof RATE_LIMIT_POLICY.endpoints]) {
    return RATE_LIMIT_POLICY.endpoints[endpoint as keyof typeof RATE_LIMIT_POLICY.endpoints];
  }
  return {
    maxRequests: RATE_LIMIT_POLICY.maxRequests,
    windowMs: RATE_LIMIT_POLICY.windowMs,
  };
}

export function getCacheTTL(endpoint: string): number {
  // 엔드포인트 패턴 매칭
  for (const [pattern, ttl] of Object.entries(CACHE_POLICY.endpoints)) {
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
    if (regex.test(endpoint)) {
      return ttl;
    }
  }
  return CACHE_POLICY.defaultTTL;
}

export function getUserFriendlyErrorMessage(statusCode: number): string {
  return ERROR_POLICY.userFriendlyMessages[statusCode as keyof typeof ERROR_POLICY.userFriendlyMessages] 
    || '알 수 없는 오류가 발생했습니다.';
}

