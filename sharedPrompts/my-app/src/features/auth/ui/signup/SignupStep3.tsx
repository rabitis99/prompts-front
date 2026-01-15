import { ArrowLeft, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import type { SignupFormData, SignupErrors } from '@/features/auth/types/signup.types';
import TermsModal from '@/shared/components/TermsModal';
import { useTermsModal } from '@/shared/hooks/useTermsModal';

interface SignupStep3Props {
  formData: SignupFormData;
  errors: SignupErrors;
  onUpdateFormData: (updates: Partial<SignupFormData>) => void;
  onClearError: (field: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function SignupStep3({
  formData,
  errors,
  onUpdateFormData,
  onClearError,
  onPrevious,
  onNext,
}: SignupStep3Props) {
  const { termsModalType, openTermsModal, closeTermsModal } = useTermsModal();

  return (
    <div className="space-y-6">
      <button
        onClick={onPrevious}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft className="w-4 h-4" /> 이전으로
      </button>

      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">약관 동의</h1>
        <p className="text-neutral-500">서비스 이용을 위해 동의가 필요해요</p>
      </div>

      <div className="space-y-4">
        {/* 전체 동의 */}
        <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors">
          <input
            type="checkbox"
            checked={formData.agreeTerms && formData.agreePrivacy && formData.agreeMarketing}
            onChange={(e) => {
              const checked = e.target.checked;
              onUpdateFormData({
                agreeTerms: checked,
                agreePrivacy: checked,
                agreeMarketing: checked,
              });
            }}
            className="w-5 h-5 rounded border-neutral-300 text-violet-600 focus:ring-violet-500 mt-0.5 cursor-pointer"
          />
          <span className="text-sm font-semibold text-neutral-900">전체 동의하기</span>
        </label>

        <div className="border-t border-neutral-200 pt-4 space-y-3">
          {/* 이용약관 */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => {
                onUpdateFormData({ agreeTerms: e.target.checked });
                onClearError('agreeTerms');
              }}
              className="w-5 h-5 rounded border-neutral-300 text-violet-600 focus:ring-violet-500 mt-0.5 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">
                <span className="text-red-500 font-medium">*</span>{' '}
                <button
                  type="button"
                  onClick={() => openTermsModal('terms')}
                  className="text-violet-600 hover:underline font-medium"
                >
                  이용약관
                </button>
                에 동의합니다
              </span>
            </div>
          </label>
          {errors.agreeTerms && (
            <p className="text-sm text-red-500 flex items-center gap-1 ml-8">
              <AlertCircle className="w-4 h-4" />
              {errors.agreeTerms}
            </p>
          )}

          {/* 개인정보처리방침 */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.agreePrivacy}
              onChange={(e) => {
                onUpdateFormData({ agreePrivacy: e.target.checked });
                onClearError('agreePrivacy');
              }}
              className="w-5 h-5 rounded border-neutral-300 text-violet-600 focus:ring-violet-500 mt-0.5 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">
                <span className="text-red-500 font-medium">*</span>{' '}
                <button
                  type="button"
                  onClick={() => openTermsModal('privacy')}
                  className="text-violet-600 hover:underline font-medium"
                >
                  개인정보처리방침
                </button>
                에 동의합니다
              </span>
            </div>
          </label>
          {errors.agreePrivacy && (
            <p className="text-sm text-red-500 flex items-center gap-1 ml-8">
              <AlertCircle className="w-4 h-4" />
              {errors.agreePrivacy}
            </p>
          )}

          {/* 마케팅 수신 */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.agreeMarketing}
              onChange={(e) => onUpdateFormData({ agreeMarketing: e.target.checked })}
              className="w-5 h-5 rounded border-neutral-300 text-violet-600 focus:ring-violet-500 mt-0.5 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm text-neutral-500 group-hover:text-neutral-700 transition-colors">
                마케팅 정보 수신에 동의합니다 (선택)
              </span>
              <p className="text-xs text-neutral-400 mt-1">
                이벤트, 프로모션 등의 소식을 받아보실 수 있습니다
              </p>
            </div>
          </label>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!formData.agreeTerms || !formData.agreePrivacy}
        className="w-full py-3.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음 <ArrowRight className="w-5 h-5" />
      </button>

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

