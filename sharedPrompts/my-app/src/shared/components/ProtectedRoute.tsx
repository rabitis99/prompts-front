import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LoadingState } from './LoadingState';
import { useEffect, useState } from 'react';
import { fetchMe } from '@/features/auth/api/user.api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 * @param requireAdmin - 관리자 권한이 필요한 경우 true
 */
export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAdminRole, setHasAdminRole] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        setIsChecking(false);
        return;
      }

      if (requireAdmin) {
        try {
          const user = await fetchMe();
          setHasAdminRole(user.role === 'ROLE_ADMIN');
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          setHasAdminRole(false);
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, requireAdmin]);

  if (isChecking) {
    return <LoadingState fullScreen message="인증 확인 중..." />;
  }

  if (!isAuthenticated) {
    // 로그인 후 원래 페이지로 돌아올 수 있도록 location 저장
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !hasAdminRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

