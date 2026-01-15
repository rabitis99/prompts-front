import { ArrowLeft, Briefcase, Check, Loader2, AlertCircle } from 'lucide-react';
import { SIGNUP_JOBS } from '@/features/auth/model/signup.constants';
import type { SignupFormData, SignupErrors } from '@/features/auth/types/signup.types';

interface SignupStep4Props {
  formData: SignupFormData;
  errors: SignupErrors;
  isLoading: boolean;
  onUpdateFormData: (updates: Partial<SignupFormData>) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function SignupStep4({
  formData,
  errors,
  isLoading,
  onUpdateFormData,
  onPrevious,
  onNext,
}: SignupStep4Props) {
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
          <Briefcase className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">직업을 알려주세요</h1>
        <p className="text-neutral-500">맞춤 프롬프트를 추천해드릴게요</p>
      </div>

      <div className="space-y-3">
        {SIGNUP_JOBS.map((jobItem) => (
          <button
            key={jobItem.id}
            onClick={() => onUpdateFormData({ job: jobItem.id })}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              formData.job === jobItem.id
                ? 'border-violet-500 bg-violet-50'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            <span className="text-2xl">{jobItem.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-neutral-900">{jobItem.label}</div>
              <div className="text-sm text-neutral-500">{jobItem.desc}</div>
            </div>
            {formData.job === jobItem.id && (
              <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 에러 메시지 */}
      {errors.general && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full py-3.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            가입 중...
          </>
        ) : (
          <>가입 완료</>
        )}
      </button>

      <button
        onClick={() => {
          onUpdateFormData({ job: '' });
          onNext();
        }}
        className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700"
      >
        나중에 선택할게요
      </button>
    </div>
  );
}

