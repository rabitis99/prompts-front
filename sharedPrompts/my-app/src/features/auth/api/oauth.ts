const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const oauthLogin = (provider: 'kakao' | 'google' | 'naver') => {
  window.location.href = `${BASE_URL}/oauth2/authorization/${provider}`;
};
