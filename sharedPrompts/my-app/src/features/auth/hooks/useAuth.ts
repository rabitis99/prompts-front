import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export const useAuth = () => {
  const setTokens = useAuthStore((s) => s.setTokens);
  const clear = useAuthStore((s) => s.clear);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    setTokens(data.accessToken, data.refreshToken);
  };

  const oauthCallback = async (key: string, state: string) => {
    const { data } = await authApi.oauthCallback(key, state);
    setTokens(data.accessToken, data.refreshToken);
  };

  const logout = async () => {
    await authApi.logout();
    clear();
  };

  return { login, oauthCallback, logout };
};
