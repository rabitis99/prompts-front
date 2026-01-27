import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LoadingState } from './LoadingState';
import { useEffect, useState } from 'react';
import { userApi } from '@/features/auth/api/user.api';

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
          // UserResponseDto를 사용하여 role 정보 확인
          // 일반 유저도 role을 받을 수 있지만, UI에는 표시하지 않음
          console.log('[ProtectedRoute] /users/me 호출 시작 (requireAdmin=true)');
          const response = await userApi.getMyInfo();
          console.log('[ProtectedRoute] /users/me 응답:', response);
          console.log('[ProtectedRoute] /users/me 응답 데이터:', response.data);
          console.log('[ProtectedRoute] /users/me 사용자 정보:', response.data.data);
          const user = response.data.data;
          console.log('[ProtectedRoute] 사용자 role:', user.role);
          // ROLE_ADMIN 또는 ADMIN 둘 다 허용
          const hasAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
          console.log('[ProtectedRoute] hasAdminRole:', hasAdmin);
          setHasAdminRole(hasAdmin);
        } catch (error) {
          console.error('[ProtectedRoute] Failed to fetch user info:', error);
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

