import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function OAuthFailurePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { oauthCallback } = useAuth();

  useEffect(() => {
    // OAuth 실패 시 oauth_signup 플래그 정리
    localStorage.removeItem('oauth_signup');

    const key = params.get('key');
    const state = params.get('state');

    if (!key || !state) {
      navigate('/login?error=oauth');
      return;
    }

    oauthCallback(key, state)
      .then(() => navigate('/auth/bootstrap'))
      .catch((err: any) => {
        // OAuth 콜백 실패 시에도 플래그 정리
        localStorage.removeItem('oauth_signup');
        
        // 에러 코드 확인
        const errorData = err?.response?.data;
        const errorCode = errorData?.error?.code || errorData?.code;
        
        // OAuth2 토큰 무효 에러인 경우 특별 처리
        if (errorCode === 'OAUTH2_TOKEN_INVALID') {
          navigate('/login?error=oauth_token_invalid');
        } else {
          navigate('/login?error=oauth');
        }
      });
  }, [navigate, params, oauthCallback]);

  return <div className="p-10 text-center">OAuth 로그인 처리 중...</div>;
}
