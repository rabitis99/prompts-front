import TermsModal from '@/shared/components/TermsModal';
import { useTermsModal } from '@/shared/hooks/useTermsModal';

export function LandingFooter() {
  const { termsModalType, openTermsModal, closeTermsModal } = useTermsModal();

  return (
    <>
      <footer className="py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <div>© 2025 PromptHub</div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => openTermsModal('terms')}
              className="hover:text-neutral-900 transition-colors"
            >
              이용약관
            </button>
            <button
              type="button"
              onClick={() => openTermsModal('privacy')}
              className="hover:text-neutral-900 transition-colors"
            >
              개인정보처리방침
            </button>
          </div>
        </div>
      </footer>

      {termsModalType && (
        <TermsModal
          isOpen={true}
          onClose={closeTermsModal}
          type={termsModalType}
        />
      )}
    </>
  );
}
