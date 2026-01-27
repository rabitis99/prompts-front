import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/shared/layout/AppLayout";
import { OfflineIndicator, LoadingState, ProtectedRoute } from "@/shared/components";
import { userApi } from "@/features/auth/api/user.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

// 코드 스플리팅: 페이지 컴포넌트를 lazy loading
const PromptsHub = lazy(() => import("@/pages/PromptsHub"));
const HomeFeedPage = lazy(() => import("@/pages/HomeFeedPage"));
const Login = lazy(() => import("@/pages/auth/LoginPage"));
const SignupPage = lazy(() => import("@/pages/auth/SignupPage"));
const OAuthSuccessPage = lazy(() => import("@/pages/auth/OAuthSuccessPage"));
const BootstrapPage = lazy(() => import("@/pages/auth/AuthBootstrapPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const PromptDetailPage = lazy(() => import("@/pages/PromptDetailPage"));
const CreatePromptPage = lazy(() => import("@/pages/CreatePromptPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const UserProfilePage = lazy(() => import("@/pages/UserProfilePage"));

function RootRedirect() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isAuthenticated) {
        setIsChecking(false);
        return;
      }

      try {
        // UserResponseDto를 사용하여 role 정보 확인
        // 일반 유저도 role을 받을 수 있지만, UI에는 표시하지 않음
        console.log('[App RootRedirect] /users/me 호출 시작');
        const response = await userApi.getMyInfo();
        console.log('[App RootRedirect] /users/me 응답:', response);
        console.log('[App RootRedirect] /users/me 응답 데이터:', response.data);
        console.log('[App RootRedirect] /users/me 사용자 정보:', response.data.data);
        const user = response.data.data;
        console.log('[App RootRedirect] 사용자 role:', user.role);
        // ROLE_ADMIN 또는 ADMIN 둘 다 허용
        const isAdmin = user.role === "ADMIN" || user.role === "ROLE_ADMIN";
        console.log('[App RootRedirect] isAdmin:', isAdmin);
        if (isAdmin) {
          console.log('[App RootRedirect] Admin 권한 확인됨, /admin으로 리다이렉트');
          navigate("/admin", { replace: true });
        }
      } catch (error) {
        console.error("[App RootRedirect] Failed to fetch user info:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminRole();
  }, [isAuthenticated, navigate]);

  if (isChecking) {
    return <div className="p-10 text-center">로딩 중...</div>;
  }

  return <PromptsHub />;
}

export default function App() {
  return (
    <BrowserRouter>
      <OfflineIndicator />
      <Suspense fallback={<LoadingState fullScreen />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/feed" element={<HomeFeedPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/success" element={<OAuthSuccessPage />} />
            <Route path="/auth/bootstrap" element={<BootstrapPage />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prompts/create"
            element={
              <ProtectedRoute>
                <CreatePromptPage />
              </ProtectedRoute>
            }
          />
          <Route path="/prompts/:id" element={<PromptDetailPage />} />
          <Route path="/users/:userId" element={<UserProfilePage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
