import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export const useAuth = () => {
  const setTokens = useAuthStore((s) => s.setTokens);
  const clear = useAuthStore((s) => s.clear);
  const setLoggingOut = useAuthStore((s) => s.setLoggingOut);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    setTokens(data.access_token, data.refresh_token);
  };

  const oauthCallback = async (key: string, state: string) => {
    const { data } = await authApi.oauthCallback(key, state);
    setTokens(data.access_token, data.refresh_token);
  };

  const logout = async () => {
    try {
      setLoggingOut(true);
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } finally {
      clear();
    }
  };

  return { login, oauthCallback, logout };
};
