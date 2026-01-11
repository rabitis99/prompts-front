import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { oauthLogin } from '@/features/auth/api/oauth';
import { PASSWORD_STRENGTH_LABELS, PASSWORD_STRENGTH_COLORS } from '@/features/auth/model/signup.constants';
import { passwordStrength } from '@/features/auth/model/signup.utils';
import type { SignupFormData, SignupErrors, SignupMethod } from '@/features/auth/types/signup.types';

interface SignupStep1Props {
  signupMethod: SignupMethod;
  formData: SignupFormData;
  errors: SignupErrors;
  showPassword: boolean;
  isLoading: boolean;
  onSetSignupMethod: (method: SignupMethod) => void;
  onUpdateFormData: (updates: Partial<SignupFormData>) => void;
  onClearError: (field: string) => void;
  onSetShowPassword: (show: boolean) => void;
  onNext: () => void;
  onNavigateToLogin: () => void;
}

export function SignupStep1({
  signupMethod,
  formData,
  errors,
  showPassword,
  isLoading,
  onSetSignupMethod,
  onUpdateFormData,
  onClearError,
  onSetShowPassword,
  onNext,
  onNavigateToLogin,
}: SignupStep1Props) {
  const strength = passwordStrength(formData.password);

  const handleOAuth = (provider: 'google' | 'kakao' | 'naver') => {
    onSetSignupMethod('oauth');
    oauthLogin(provider);
  };

  const handleEmailSignup = () => {
    onSetSignupMethod('email');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">계정 만들기</h1>
        <p className="text-neutral-500">프롬프트 공유의 첫 걸음을 시작하세요</p>
      </div>

      {/* OAuth */}
      <div className="space-y-3">
        <button
          onClick={() => handleOAuth('google')}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 시작하기
        </button>

        <button
          onClick={() => handleOAuth('kakao')}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#FEE500] rounded-xl font-medium text-[#191919] hover:bg-[#FDD800] transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.87 5.33 4.67 6.77l-.95 3.53c-.05.18.15.34.32.24l4.12-2.72c.59.08 1.2.13 1.84.13 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
          </svg>
          카카오로 시작하기
        </button>

        <button
          onClick={() => handleOAuth('naver')}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#03C75A] rounded-xl font-medium text-white hover:bg-[#02B350] transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
          </svg>
          네이버로 시작하기
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-neutral-400">또는</span>
        </div>
      </div>

      {/* Email Signup Form */}
      {signupMethod === 'email' ? (
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">이메일</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  onUpdateFormData({ email: e.target.value });
                  onClearError('email');
                }}
                placeholder="hello@example.com"
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                } focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all bg-white`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => {
                  onUpdateFormData({ password: e.target.value });
                  onClearError('password');
                }}
                placeholder="8자 이상 입력"
                className={`w-full pl-12 pr-12 py-3.5 rounded-xl border ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                } focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all bg-white`}
              />
              <button
                type="button"
                onClick={() => onSetShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}

            {/* Password Strength */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i < strength ? PASSWORD_STRENGTH_COLORS[strength] : 'bg-neutral-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-neutral-500">
                  비밀번호 강도: {PASSWORD_STRENGTH_LABELS[strength]}
                </p>
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={onNext}
            className="w-full py-3.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 mt-2"
          >
            다음 <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleEmailSignup}
          className="w-full py-3.5 bg-white border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all"
        >
          이메일로 가입하기
        </button>
      )}

      <p className="text-center text-sm text-neutral-500">
        이미 계정이 있으신가요?{' '}
        <button
          onClick={onNavigateToLogin}
          className="text-violet-600 font-medium hover:text-violet-700 hover:underline"
        >
          로그인
        </button>
      </p>
    </div>
  );
}

