import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { LoginRequest } from '@/features/auth/model/auth.types';

export const useAuth = () => {
  const setTokens = useAuthStore((s) => s.setTokens);
  const clear = useAuthStore((s) => s.clear);
  const setLoggingOut = useAuthStore((s) => s.setLoggingOut);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    // 백엔드 응답 구조 확인: CustomResponse로 래핑되어 있을 수 있음
    const tokenData = (response.data as any).data || response.data;
    setTokens(tokenData.access_token, tokenData.refresh_token);
  };

  const oauthCallback = async (key: string, state: string) => {
    const response = await authApi.oauthCallback(key, state);
    // 백엔드 응답 구조 확인: CustomResponse로 래핑되어 있을 수 있음
    // response.data가 직접 TokenResponse인 경우와 CustomResponse<TokenResponse>인 경우 모두 처리
    const tokenData = (response.data as any).data || response.data;
    console.log('OAuth callback response:', response.data);
    console.log('Extracted tokens:', { access_token: tokenData.access_token, refresh_token: tokenData.refresh_token });
    setTokens(tokenData.access_token, tokenData.refresh_token);
  };

  const logout = async () => {
    try {
      setLoggingOut(true);
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      // 네트워크 오류나 서버 장애 시에도 로컬 토큰을 정리
      console.error('Logout API failed, clearing local tokens:', error);
    } finally {
      // API 호출 성공/실패와 관계없이 항상 로컬 토큰 정리
      clear();
    }
  };

  return { login, oauthCallback, logout };
};
