import { useState } from "react";
import { Layers } from "lucide-react";
import { useAuthView } from "@/features/auth/model/useAuthView";
import { LoginView } from "@/features/auth/ui/LoginView";
import { ForgotPasswordView } from "@/features/auth/ui/ForgotPasswordView";
import { VerifyEmailView } from "@/features/auth/ui/VerifyEmailView";
import TermsModal from "@/shared/components/TermsModal";

export default function AuthPage() {
  const { currentView, setView } = useAuthView();
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy' | null>(null);

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
          <button
            onClick={() => setTermsModalType('terms')}
            className="hover:text-neutral-600 transition-colors"
          >
            이용약관
          </button>
          {" · "}
          <button
            onClick={() => setTermsModalType('privacy')}
            className="hover:text-neutral-600 transition-colors"
          >
            개인정보처리방침
          </button>
        </p>
      </div>

      {termsModalType && (
        <TermsModal
          isOpen={!!termsModalType}
          onClose={() => setTermsModalType(null)}
          type={termsModalType}
        />
      )}
    </div>
  );
}
