import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/shared/layout/AppLayout";
import PromptsHub from "@/pages/PromptsHub";
import Login from "@/pages/auth/LoginPage";
import OAuthSuccessPage from "@/pages/auth/OAuthSuccessPage";
import BootstrapPage from "@/pages/auth/AuthBootstrapPage"
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<PromptsHub />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/success" element={<OAuthSuccessPage />} />
          <Route path="/auth/bootstrap" element={<BootstrapPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
