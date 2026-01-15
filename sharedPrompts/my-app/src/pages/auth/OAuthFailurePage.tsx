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
      .catch(() => {
        // OAuth 콜백 실패 시에도 플래그 정리
        localStorage.removeItem('oauth_signup');
        navigate('/login?error=oauth');
      });
  }, [navigate, params, oauthCallback]);

  return <div className="p-10 text-center">OAuth 로그인 처리 중...</div>;
}
