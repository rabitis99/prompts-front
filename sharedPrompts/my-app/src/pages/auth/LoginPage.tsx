import { Sparkles } from "lucide-react";
import { useAuthView } from "@/features/auth/model/useAuthView";
import { LoginView } from "@/features/auth/ui/LoginView";
import { ForgotPasswordView } from "@/features/auth/ui/ForgotPasswordView";
import { VerifyEmailView } from "@/features/auth/ui/VerifyEmailView";
import TermsModal from "@/shared/components/TermsModal";
import { useTermsModal } from "@/shared/hooks/useTermsModal";

export default function AuthPage() {
  const { currentView, setView } = useAuthView();
  const { termsModalType, openTermsModal, closeTermsModal } = useTermsModal();

  const views = {
    login: <LoginView onChangeView={setView} />,
    forgot: <ForgotPasswordView onChangeView={setView} />,
    verify: <VerifyEmailView onChangeView={setView} />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-neutral-900">
            PromptHub
          </span>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-neutral-200/50 border border-white p-8">
          {views[currentView]}
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6 relative">
          <button
            type="button"
            onClick={() => openTermsModal('terms')}
            className="hover:text-neutral-600 transition-colors"
          >
            이용약관
          </button>
          {" · "}
          <button
            type="button"
            onClick={() => openTermsModal('privacy')}
            className="hover:text-neutral-600 transition-colors"
          >
            개인정보처리방침
          </button>
        </p>
      </div>

      {termsModalType && (
        <TermsModal
          isOpen={true}
          onClose={closeTermsModal}
          type={termsModalType}
        />
      )}
    </div>
  );
}
