import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 30000, // 30초 타임아웃
});

/**
 * Request Interceptor
 * - accessToken 자동 첨부
 * - 로그아웃 중일 때 logout 요청 외 모든 요청 차단
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken, isLoggingOut } = useAuthStore.getState();

  // 로그아웃 중일 때, logout 요청이 아니면 차단
  if (isLoggingOut && !config.url?.includes('/auth/logout')) {
    return Promise.reject(new Error('로그아웃 중입니다. 요청이 취소되었습니다.'));
  }

  if (accessToken) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  return config;
});

/**
 * Response Interceptor
 * - 401 → refresh → retry
 * - 모든 메서드(GET, POST, PATCH, DELETE 등) 동일 적용
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, setTokens, clear } = useAuthStore.getState();

        if (!refreshToken) {
          clear();
          return Promise.reject(error);
        }

        // refresh 요청
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
        const { access_token: newAccessToken, refresh_token: newRefreshToken } = res.data.data;

        // 토큰 갱신
        setTokens(newAccessToken, newRefreshToken);

        // 원래 요청 헤더에 새 accessToken 적용
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
        }

        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
