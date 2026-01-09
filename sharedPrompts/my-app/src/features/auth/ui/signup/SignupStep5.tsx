import { CheckCircle2 } from 'lucide-react';
import { SIGNUP_JOBS } from '@/features/auth/model/signup.constants';
import type { SignupFormData, SignupMethod } from '@/features/auth/types/signup.types';

interface SignupStep5Props {
  formData: SignupFormData;
  signupMethod: SignupMethod;
  onNavigateToHome: () => void;
}

export function SignupStep5({
  formData,
  signupMethod,
  onNavigateToHome,
}: SignupStep5Props) {
  return (
    <div className="space-y-6 text-center py-8">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
        <CheckCircle2 className="w-12 h-12 text-white" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">환영합니다! 🎉</h1>
        <p className="text-neutral-500">
          <span className="font-medium text-neutral-700">{formData.nickname || '사용자'}</span>님의
          가입이 완료되었습니다
        </p>
      </div>

      <div className="bg-neutral-50 rounded-xl p-5 text-left space-y-3">
        {formData.nickname && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">닉네임</span>
            <span className="font-medium text-neutral-900">{formData.nickname}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">나이</span>
          <span className="font-medium text-neutral-900">
            {formData.age ? `${formData.age}세` : '-'}
          </span>
        </div>
        {signupMethod === 'email' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">이메일</span>
            <span className="font-medium text-neutral-900 truncate ml-2">
              {formData.email || '-'}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">직업</span>
          <span className="font-medium text-neutral-900">
            {SIGNUP_JOBS.find((j) => j.id === formData.job)?.label || '-'}
          </span>
        </div>
        <div className="pt-2 border-t border-neutral-200">
          <div className="text-xs text-neutral-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>이용약관 동의</span>
              <span className="text-green-600 font-medium">✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>개인정보처리방침 동의</span>
              <span className="text-green-600 font-medium">✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>마케팅 수신 동의</span>
              <span
                className={formData.agreeMarketing ? 'text-green-600 font-medium' : 'text-neutral-400'}
              >
                {formData.agreeMarketing ? '✓' : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={onNavigateToHome}
          className="w-full py-3.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all"
        >
          프롬프트 둘러보기
        </button>
        <button className="w-full py-3.5 bg-violet-100 text-violet-700 rounded-xl font-medium hover:bg-violet-200 transition-all">
          첫 프롬프트 작성하기
        </button>
      </div>
    </div>
  );
}

