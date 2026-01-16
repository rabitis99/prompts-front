import { BrowserRouter, Routes, Route } from "react-router-dom";
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
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<PromptsHub />} />
          <Route path="/feed" element={<HomeFeedPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/success" element={<OAuthSuccessPage />} />
          <Route path="/auth/bootstrap" element={<BootstrapPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/prompts/create" element={<CreatePromptPage />} />
          <Route path="/prompts/:id" element={<PromptDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
