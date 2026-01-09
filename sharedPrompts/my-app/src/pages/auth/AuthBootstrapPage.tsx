import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {fetchMe } from '@/features/auth/api/user.api';

export default function AuthBootstrapPage() {
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe()
      .then((user) => {
        if (user.status === false) {
          navigate('/onboarding');
        } else {
          navigate('/');
        }
      })
      .catch(() => {
        navigate('/login');
      });
  }, []);

  return <div className="p-10 text-center">사용자 정보 확인 중...</div>;
}
