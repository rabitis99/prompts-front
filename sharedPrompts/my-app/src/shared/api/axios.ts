import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { rateLimitTracker, waitForRateLimit } from '@/shared/utils/rateLimit';
import { apiCache } from '@/shared/utils/cache';
import { logApiError } from '@/shared/utils/errorLogger';
import { invalidateRelatedCache } from '@/shared/utils/cacheInvalidation';
import { getCacheTTL, getUserFriendlyErrorMessage, getRateLimitPolicy } from '@/shared/config/policy';

// Rate limit retry 플래그를 위한 타입 확장
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _rateLimitRetry?: boolean;
    _skipCache?: boolean; // 캐시 스킵 플래그
    _skipRateLimit?: boolean; // Rate Limit 체크 스킵 플래그
    _pendingRequestKey?: string; // 중복 요청 방지용 키
  }
}

import { ENV } from '@/shared/config/env';

const API_BASE_URL = ENV.API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 30000, // 30초 타임아웃
});

/**
 * Request Interceptor
 * - accessToken 자동 첨부
 * - 로그아웃 중일 때 logout 요청 외 모든 요청 차단
 * - Rate Limit 체크 및 캐시 확인
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { accessToken, isLoggingOut } = useAuthStore.getState();

    // 로그아웃 중일 때, logout 요청이 아니면 차단
    if (isLoggingOut && !config.url?.includes('/auth/logout')) {
      return Promise.reject(new Error('로그아웃 중입니다. 요청이 취소되었습니다.'));
    }

    // 회원가입/로그인 엔드포인트는 토큰을 보내지 않음 (다른 계정으로 로그인 시도 시 기존 토큰 제거)
    const requestUrl = config.url || '';
    const baseURL = config.baseURL || API_BASE_URL || '';
    const fullUrl = baseURL && requestUrl 
      ? `${baseURL.replace(/\/$/, '')}${requestUrl.startsWith('/') ? '' : '/'}${requestUrl}`
      : requestUrl;
    
    const isAuthEndpoint = 
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/login') ||
      fullUrl.includes('/auth/signup') ||
      fullUrl.includes('/auth/login');

    // 회원가입/로그인 엔드포인트가 아닐 때만 토큰 추가
    if (accessToken && !isAuthEndpoint) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    // GET 요청에 대해 캐시 확인 (스킵 플래그가 없을 때만)
    if (config.method?.toLowerCase() === 'get' && !config._skipCache) {
      const cached = apiCache.get(
        config.method,
        config.url || '',
        config.params
      );
      if (cached) {
        // 캐시된 응답 반환 (axios 응답 형식으로 래핑)
        return Promise.reject({
          __cached: true,
          data: cached,
          config,
        } as any);
      }
    }

    // 중복 요청 방지: 동일한 요청이 진행 중이면 기존 요청 재사용
    if (!config._skipRateLimit && config.method?.toUpperCase() === 'GET') {
      const requestKey = rateLimitTracker.createRequestKey(
        config.method,
        config.url || '',
        config.params
      );
      
      const existingRequest = rateLimitTracker.pendingRequests.get(requestKey);
      if (existingRequest) {
        // 동일한 요청이 진행 중이면 기존 Promise 재사용
        return Promise.reject({
          __duplicate: true,
          promise: existingRequest,
          config,
        } as any);
      }
      
      // 요청을 pendingRequests에 등록 (실제 요청은 response interceptor에서 처리)
      // 여기서는 플래그만 설정하여 response interceptor에서 처리하도록 함
      config._pendingRequestKey = requestKey;
    }

    // Rate Limit 체크 (스킵 플래그가 없을 때만)
    if (!config._skipRateLimit) {
      await waitForRateLimit();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * - 401 → refresh → retry
 * - 429 → rate limit exceeded 처리
 * - 캐시 저장 및 Rate Limit 추적
 * - 모든 메서드(GET, POST, PATCH, DELETE 등) 동일 적용
 */
api.interceptors.response.use(
  (response) => {
    const config = response.config as InternalAxiosRequestConfig;

    // Rate Limit 추적
    if (!config._skipRateLimit) {
      rateLimitTracker.recordRequest(
        config.method?.toUpperCase() || 'GET',
        config.url || ''
      );
      
      // GET 요청의 경우 pendingRequests에 추가 (중복 방지용)
      if (config.method?.toUpperCase() === 'GET' && config._pendingRequestKey) {
        // 요청이 성공적으로 완료되면 pendingRequests에서 제거
        // (실제 제거는 rateLimitTracker.getOrCreateRequest의 finally에서 처리되지만,
        // 인터셉터에서 직접 호출하지 않으므로 여기서는 플래그만 확인)
        // 실제 pendingRequests 등록/제거는 getOrCreateRequest를 사용하는 곳에서 처리됨
      }
    }

    // POST/PATCH/DELETE 요청 후 관련 캐시 무효화
    if (config.method && ['POST', 'PATCH', 'DELETE', 'PUT'].includes(config.method.toUpperCase())) {
      invalidateRelatedCache(config.method, config.url || '');
    }

    // GET 요청 응답 캐싱 (스킵 플래그가 없을 때만)
    if (config.method?.toLowerCase() === 'get' && !config._skipCache) {
      // 정책에서 캐시 TTL 가져오기
      const ttl = getCacheTTL(config.url || '');

      apiCache.set(
        config.method,
        config.url || '',
        response.data,
        config.params,
        ttl
      );
    }

    return response;
  },
  async (error: any) => {
    // 중복 요청 처리: 기존 요청의 결과를 재사용
    if (error?.__duplicate) {
      try {
        const response = await error.promise;
        return Promise.resolve({
          ...response,
          config: error.config,
        });
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // 캐시된 응답 처리
    if (error?.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

    const axiosError = error as AxiosError;
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Rate limit exceeded (429) 처리
    if (axiosError.response?.status === 429) {
      const retryAfter = axiosError.response.headers['retry-after'];
      let retryAfterSeconds = 60; // 기본값
      
      if (retryAfter) {
        // 숫자 형식인 경우
        const parsed = parseInt(retryAfter, 10);
        if (!isNaN(parsed)) {
          retryAfterSeconds = parsed;
        } else {
          // HTTP-date 형식인 경우 파싱 시도
          try {
            const date = new Date(retryAfter);
            if (!isNaN(date.getTime())) {
              retryAfterSeconds = Math.max(0, Math.floor((date.getTime() - Date.now()) / 1000));
            }
          } catch {
            // 파싱 실패 시 기본값 사용
          }
        }
      }
      
      console.warn(
        `Rate limit exceeded. Retry after ${retryAfterSeconds} seconds.`,
        axiosError.response.data
      );

      // Rate Limit 추적기 초기화 (429 발생 시 윈도우 리셋)
      rateLimitTracker.reset();

      // 사용자에게 알림 (선택적 - toast 시스템이 있다면 사용)
      // toast.error(`요청이 너무 많습니다. ${retryAfterSeconds}초 후에 다시 시도해주세요.`);

      // retry-after 시간만큼 대기 후 재시도 (최대 1회)
      const MAX_RETRY_WAIT_SECONDS = 10;
      if (!originalRequest._rateLimitRetry && retryAfterSeconds > 0 && retryAfterSeconds <= MAX_RETRY_WAIT_SECONDS) {
        originalRequest._rateLimitRetry = true;
        
        await new Promise((resolve) => setTimeout(resolve, retryAfterSeconds * 1000));
        
        return api(originalRequest);
      }

      // 재시도 실패 시 에러 반환
      return Promise.reject(
        new Error(`Rate limit exceeded. Please try again after ${retryAfterSeconds} seconds.`)
      );
    }

    // OAuth2 callback 에러는 토큰 갱신 시도하지 않음
    // URL 또는 params에 key/state가 있으면 OAuth callback으로 간주
    const isOAuthCallback = 
      originalRequest.url?.includes('/auth/callback') ||
      originalRequest.params?.key !== undefined ||
      originalRequest.params?.state !== undefined;
    
    // Signup/Login 엔드포인트는 토큰 갱신 시도하지 않음 (초기 인증 단계이므로)
    // 이 엔드포인트에서 401은 "인증 실패"를 의미하며, 토큰 만료가 아님
    // URL 체크: baseURL이 있을 경우 config.url은 상대 경로만 포함하므로 둘 다 확인
    const requestUrl = originalRequest.url || '';
    const baseURL = originalRequest.baseURL || API_BASE_URL || '';
    const fullUrl = baseURL && requestUrl 
      ? `${baseURL.replace(/\/$/, '')}${requestUrl.startsWith('/') ? '' : '/'}${requestUrl}`
      : requestUrl || axiosError.config?.url || '';
    
    // 다양한 URL 형식 체크
    const isAuthEndpoint = 
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/login') ||
      fullUrl.includes('/auth/signup') ||
      fullUrl.includes('/auth/login') ||
      axiosError.config?.url?.includes('/auth/signup') ||
      axiosError.config?.url?.includes('/auth/login');
    
    const errorData = axiosError.response?.data as any;
    const errorCode = errorData?.error?.code || errorData?.code;
    
    // OAuth2 callback은 어떤 에러든 토큰 갱신 시도하지 않음 (초기 인증 단계이므로)
    if (isOAuthCallback) {
      if (axiosError.response?.status === 401) {
        console.error('OAuth2 callback 401 에러 발생:', {
          url: originalRequest.url,
          params: originalRequest.params,
          errorCode,
          errorMessage: errorData?.error?.message || errorData?.message,
          possibleReasons: [
            'OAuth 인증 과정이 너무 오래 걸려서 토큰이 만료됨',
            '같은 토큰을 두 번 사용하려고 시도함 (새로고침/뒤로가기)',
            '백엔드 세션/캐시가 만료됨',
            'OAuth provider에서 받은 인증 코드가 이미 사용됨'
          ]
        });
      }
      return Promise.reject(axiosError);
    }
    
    // Signup/Login 엔드포인트에서 401 에러는 토큰 갱신 없이 바로 반환
    // 사용자에게 더 구체적인 에러 메시지를 제공하기 위해 원본 에러 반환
    if (isAuthEndpoint && axiosError.response?.status === 401) {
      // 백엔드 응답 구조에 따라 에러 메시지 추출 시도
      // 다양한 응답 구조 지원: { error: { message } }, { message }, { data: { message } } 등
      let errorMessage = 
        errorData?.error?.message || 
        errorData?.message || 
        errorData?.data?.message ||
        errorData?.error?.detail ||
        errorData?.detail;
      
      // 에러 메시지가 없으면 상황에 맞는 기본 메시지 사용
      if (!errorMessage) {
        if (requestUrl.includes('/auth/signup') || fullUrl.includes('/auth/signup')) {
          errorMessage = '회원가입에 실패했습니다. 입력 정보를 확인해주세요.';
        } else {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        }
      }
      
      // 개발 환경에서 디버깅 정보 로깅
      if (import.meta.env.DEV) {
        console.log('[Auth Endpoint 401 Error]', {
          requestUrl,
          fullUrl,
          isAuthEndpoint,
          errorData,
          extractedMessage: errorMessage,
        });
      }
      
      const error = new Error(errorMessage) as any;
      error.response = axiosError.response;
      error.config = originalRequest;
      // 디버깅을 위해 원본 에러 데이터도 포함
      error.originalErrorData = errorData;
      return Promise.reject(error);
    }

    // 에러 상태 코드별 사용자 친화적 메시지 처리
    if (axiosError.response?.status) {
      const statusCode = axiosError.response.status;
      const userFriendlyMessage = getUserFriendlyErrorMessage(statusCode);
      
      logApiError(new Error(userFriendlyMessage), {
        method: originalRequest.method,
        url: originalRequest.url,
        status: statusCode,
      });
      
      // 5xx 서버 에러는 재시도 가능한 에러로 표시
      if (statusCode >= 500) {
        const error = new Error(userFriendlyMessage) as any;
        error.isRetryable = true;
        error.statusCode = statusCode;
        return Promise.reject(error);
      }
      
      return Promise.reject(new Error(userFriendlyMessage));
    }

    // 네트워크 에러 처리 (타임아웃, 연결 실패 등)
    if (!axiosError.response && axiosError.request) {
      const userFriendlyMessage = '네트워크 연결을 확인해주세요. 인터넷 연결 상태를 확인하고 다시 시도해주세요.';
      logApiError(new Error(userFriendlyMessage), {
        method: originalRequest.method,
        url: originalRequest.url,
      });
      const error = new Error(userFriendlyMessage) as any;
      error.isRetryable = true;
      return Promise.reject(error);
    }

    // 401 Unauthorized 처리 (동시 refresh 요청 방지)
    // OAuth callback은 이미 위에서 처리되었으므로 제외
    if (axiosError.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 동시 refresh 요청 방지를 위한 전역 Promise
      // 여러 요청이 동시에 401을 받아도 refresh는 한 번만 실행
      if (!(window as any).__refreshTokenPromise) {
        (window as any).__refreshTokenPromise = (async () => {
          try {
            const { refreshToken, setTokens, clear } = useAuthStore.getState();

            if (!refreshToken) {
              clear();
              throw new Error('No refresh token available');
            }

            // refresh 요청
            const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
            const { access_token: newAccessToken, refresh_token: newRefreshToken } = res.data.data;

            // 토큰 갱신
            setTokens(newAccessToken, newRefreshToken);

            return newAccessToken;
          } catch (refreshError) {
            useAuthStore.getState().clear();
            window.location.href = '/login';
            throw refreshError;
          } finally {
            // refresh 완료 후 Promise 초기화
            delete (window as any).__refreshTokenPromise;
          }
        })();
      }

      try {
        // 진행 중인 refresh Promise를 기다림
        const newAccessToken = await (window as any).__refreshTokenPromise;

        // 원래 요청 헤더에 새 accessToken 적용
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
        }

        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(axiosError);
  }
);
