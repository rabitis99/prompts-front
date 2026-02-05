import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { LoginRequest } from '@/features/auth/model/auth.types';
import type { TokenResponse } from '@/features/auth/model/auth.types';
import { getFCMToken } from '@/shared/config/firebase';

/**
 * 백엔드 응답에서 토큰 데이터를 추출하는 헬퍼 함수
 * CustomResponse로 래핑되어 있을 수 있으므로 두 가지 경우를 모두 처리
 */
export const extractTokenData = (responseData: any): TokenResponse => {
  return (responseData as any).data || responseData;
};

export const useAuth = () => {
  const setTokens = useAuthStore((s) => s.setTokens);
  const clear = useAuthStore((s) => s.clear);
  const setLoggingOut = useAuthStore((s) => s.setLoggingOut);

  const login = async (data: LoginRequest) => {
    // FCM 토큰 가져오기 (실패해도 로그인 진행)
    const deviceToken = await getFCMToken();

    const response = await authApi.login({
      ...data,
      device_token: deviceToken || undefined,
    });
    const tokenData = extractTokenData(response.data);
    setTokens(tokenData.access_token, tokenData.refresh_token);
  };

  const oauthCallback = async (tempKey: string, state: string, deviceToken?: string) => {
    // deviceToken이 전달되지 않았으면 FCM 토큰 가져오기
    const finalDeviceToken = deviceToken || (await getFCMToken()) || undefined;

    const response = await authApi.oauthConfirm(tempKey, state, finalDeviceToken);
    const tokenData = extractTokenData(response.data);
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
