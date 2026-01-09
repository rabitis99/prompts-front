import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSignupView } from '@/features/auth/model/useSignupView';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { SignupProgress } from '@/features/auth/ui/signup/SignupProgress';
import { SignupStep1 } from '@/features/auth/ui/signup/SignupStep1';
import { SignupStep2 } from '@/features/auth/ui/signup/SignupStep2';
import { SignupStep3 } from '@/features/auth/ui/signup/SignupStep3';
import { SignupStep4 } from '@/features/auth/ui/signup/SignupStep4';
import { SignupStep5 } from '@/features/auth/ui/signup/SignupStep5';

export function SignupView() {
  const navigate = useNavigate();
  const { setTokens } = useAuthStore();
  const {
    step,
    setStep,
    signupMethod,
    setSignupMethod,
    formData,
    updateFormData,
    errors,
    clearError,
    showPassword,
    setShowPassword,
    isLoading,
    setIsLoading,
    validateStep1,
    validateStep2,
    validateStep3,
  } = useSignupView();

  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    } else if (step === 4 && formData.job) {
      setIsLoading(true);
      try {
        const signupData = {
          ...(signupMethod === 'email' && {
            email: formData.email,
            password: formData.password,
          }),
          ...(formData.nickname && { nickname: formData.nickname }),
          ...(formData.age && { age: parseInt(formData.age, 10) }),
          ...(formData.job && { job: formData.job }),
          ...(signupMethod === 'oauth' && { provider: 'KAKAO' as const }), // TODO: 실제 provider 값으로 변경 필요
          user_terms: {
            required: formData.agreeTerms,
            privacy: formData.agreePrivacy,
            marketing: formData.agreeMarketing,
          },
        };

        const response = await authApi.signup(signupData);
        setTokens(response.data.accessToken, response.data.refreshToken);
        setIsLoading(false);
        setStep(5);
      } catch (error) {
        setIsLoading(false);
        // TODO: 에러 처리
        console.error('회원가입 실패:', error);
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep((step - 1) as typeof step);
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-neutral-900">PromptHub</span>
        </div>

        <SignupProgress currentStep={step} />

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-neutral-200/50 border border-white p-8">
          {step === 1 && (
            <SignupStep1
              signupMethod={signupMethod}
              formData={formData}
              errors={errors}
              showPassword={showPassword}
              isLoading={isLoading}
              onSetSignupMethod={setSignupMethod}
              onUpdateFormData={updateFormData}
              onClearError={clearError}
              onSetShowPassword={setShowPassword}
              onNext={handleNext}
              onNavigateToLogin={handleNavigateToLogin}
            />
          )}
          {step === 2 && (
            <SignupStep2
              formData={formData}
              errors={errors}
              onUpdateFormData={updateFormData}
              onClearError={clearError}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          )}
          {step === 3 && (
            <SignupStep3
              formData={formData}
              errors={errors}
              onUpdateFormData={updateFormData}
              onClearError={clearError}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          )}
          {step === 4 && (
            <SignupStep4
              formData={formData}
              isLoading={isLoading}
              onUpdateFormData={updateFormData}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          )}
          {step === 5 && (
            <SignupStep5
              formData={formData}
              signupMethod={signupMethod}
              onNavigateToHome={handleNavigateToHome}
            />
          )}
        </div>
      </div>
    </div>
  );
}
