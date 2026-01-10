import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function OAuthSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { oauthCallback } = useAuth();

  useEffect(() => {
    const key = params.get('key');
    const state = params.get('state');

    if (!key || !state) {
      navigate('/login?error=oauth');
      return;
    }

    oauthCallback(key, state)
      .then(() => navigate('/auth/bootstrap'))
      .catch(() => navigate('/login?error=oauth'));
  }, []);

  return <div className="p-10 text-center">OAuth 로그인 처리 중...</div>;
}
