import { ArrowLeft, ArrowRight, User, Calendar, AlertCircle } from 'lucide-react';
import type { SignupFormData, SignupErrors } from '@/features/auth/types/signup.types';

interface SignupStep2Props {
  formData: SignupFormData;
  errors: SignupErrors;
  onUpdateFormData: (updates: Partial<SignupFormData>) => void;
  onClearError: (field: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function SignupStep2({
  formData,
  errors,
  onUpdateFormData,
  onClearError,
  onPrevious,
  onNext,
}: SignupStep2Props) {
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
          <User className="w-8 h-8 text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">프로필 정보</h1>
        <p className="text-neutral-500">닉네임과 나이를 알려주세요</p>
        <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 가입 시 임의로 생성된 닉네임이 부여됩니다. 나중에 변경할 수 있어요!
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Nickname */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">닉네임 (선택)</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => {
                onUpdateFormData({ nickname: e.target.value });
                onClearError('nickname');
              }}
              placeholder="원하는 닉네임 입력 (비워두면 자동 생성)"
              className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                errors.nickname ? 'border-red-300 bg-red-50' : 'border-neutral-200'
              } focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all bg-white`}
            />
          </div>
          {errors.nickname && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.nickname}
            </p>
          )}
          <p className="text-xs text-neutral-400">입력하지 않으면 서버에서 자동으로 생성됩니다</p>
        </div>

        {/* Age */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">나이</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="number"
              value={formData.age}
              onChange={(e) => {
                onUpdateFormData({ age: e.target.value });
                onClearError('age');
              }}
              placeholder="예: 25"
              min="14"
              max="100"
              className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                errors.age ? 'border-red-300 bg-red-50' : 'border-neutral-200'
              } focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all bg-white`}
            />
          </div>
          {errors.age && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.age}
            </p>
          )}
          <p className="text-xs text-neutral-400">14세 이상만 가입 가능합니다</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
      >
        다음 <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

