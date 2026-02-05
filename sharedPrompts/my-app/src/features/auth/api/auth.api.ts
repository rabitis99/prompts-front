import { api } from '@/shared/api/axios';
import type { TokenResponse, LoginRequest } from '@/features/auth/model/auth.types';
import type { SignupRequest } from '@/features/auth/types/signup.types';

export const authApi = {
  // 회원가입
  signup: (data: SignupRequest) =>
    api.post<TokenResponse>('/auth/signup', data),

  // 로컬 로그인
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data),

  // OAuth2 confirm (캐시 및 Rate Limit 스킵 - OAuth2 인증은 매번 새로운 요청이어야 함)
  // 변경: /auth/callback GET → /auth/confirm POST
  oauthConfirm: (tempKey: string, state: string, deviceToken?: string) =>
    api.post<TokenResponse>('/auth/confirm', {
      temp_key: tempKey,
      state: state,
      device_token: deviceToken,
    }, {
      _skipCache: true, // OAuth2 confirm은 캐시하지 않음
      _skipRateLimit: true, // OAuth2 confirm은 Rate Limit 체크 스킵
    }),

  // 토큰 갱신
  refresh: (refreshToken: string) =>
    api.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    }),

  // 로그아웃
  logout: (refreshToken: string) =>
    api.post('/auth/logout', {
      refresh_token: refreshToken,
    }),
};
