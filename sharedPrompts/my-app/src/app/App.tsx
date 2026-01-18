import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/shared/layout/AppLayout";
import PromptsHub from "@/pages/PromptsHub";
import HomeFeedPage from "@/pages/HomeFeedPage";
import Login from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import OAuthSuccessPage from "@/pages/auth/OAuthSuccessPage";
import BootstrapPage from "@/pages/auth/AuthBootstrapPage";
import SettingsPage from "@/pages/SettingsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import PromptDetailPage from "@/pages/PromptDetailPage";
import CreatePromptPage from "@/pages/CreatePromptPage";
import AdminPage from "@/pages/AdminPage";
import { fetchMe } from "@/features/auth/api/user.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

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
        const user = await fetchMe();
        if (user.role === "ROLE_ADMIN") {
          navigate("/admin", { replace: true });
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
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
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/feed" element={<HomeFeedPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/success" element={<OAuthSuccessPage />} />
          <Route path="/auth/bootstrap" element={<BootstrapPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/prompts/create" element={<CreatePromptPage />} />
          <Route path="/prompts/:id" element={<PromptDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
