import { Layers } from "lucide-react";
import { useAuthView } from "@/features/auth/model/useAuthView";
import { LoginView } from "@/features/auth/ui/LoginView";
import { ForgotPasswordView } from "@/features/auth/ui/ForgotPasswordView";
import { VerifyEmailView } from "@/features/auth/ui/VerifyEmailView";

export default function AuthPage() {
  const { currentView, setView } = useAuthView();

  const views = {
    login: <LoginView onChangeView={setView} />,
    forgot: <ForgotPasswordView onChangeView={setView} />,
    verify: <VerifyEmailView onChangeView={setView} />,
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="text-2xl font-bold text-neutral-900">
            PromptHub
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
          {views[currentView]}
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          <a href="#" className="hover:text-neutral-600">이용약관</a>
          {" · "}
          <a href="#" className="hover:text-neutral-600">개인정보처리방침</a>
        </p>
      </div>
    </div>
  );
}
