import { api } from '@/shared/api/axios';
import type { TokenResponse } from '@/features/auth/model/auth.types';
import type { SignupRequest } from '@/features/auth/types/signup.types';

export const authApi = {
  // 로컬 로그인
  login: (email: string, password: string) =>
    api.post<TokenResponse>('/auth/login', { email, password }),

  // 회원가입
  signup: (data: SignupRequest) =>
    api.post<TokenResponse>('/auth/signup', data),

  // OAuth2 callback
  oauthCallback: (key: string, state: string) =>
    api.get<TokenResponse>('/auth/callback', {
      params: { key, state },
    }),

  // 토큰 갱신
  refresh: () => api.post<TokenResponse>('/auth/refresh'),

  // 로그아웃
  logout: () => api.post('/auth/logout'),
};
