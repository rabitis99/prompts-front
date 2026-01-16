import { Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useSignupView } from '@/features/auth/model/useSignupView';
import { authApi } from '@/features/auth/api/auth.api';
import { userApi } from '@/features/auth/api/user.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { JobId, SignupRequest } from '@/features/auth/types/signup.types';
import type { LoginRequest } from '@/features/auth/model/auth.types';
import { extractTokenData } from '@/features/auth/hooks/useAuth';
import { SignupProgress } from '@/features/auth/ui/signup/SignupProgress';
import { SignupStep1 } from '@/features/auth/ui/signup/SignupStep1';
import { SignupStep2 } from '@/features/auth/ui/signup/SignupStep2';
import { SignupStep3 } from '@/features/auth/ui/signup/SignupStep3';
import { SignupStep4 } from '@/features/auth/ui/signup/SignupStep4';
import { SignupStep5 } from '@/features/auth/ui/signup/SignupStep5';

export function SignupView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens } = useAuthStore();
  const {
    step,
    setStep,
    signupMethod,
    setSignupMethod,
    formData,
    updateFormData,
    errors,
    setErrors,
    clearError,
    showPassword,
    setShowPassword,
    isLoading,
    setIsLoading,
    validateStep1,
    validateStep2,
    validateStep3,
  } = useSignupView();

  // URL 파라미터에서 step과 oauth 확인하여 초기화
  useEffect(() => {
    const stepParam = searchParams.get('step');
    const oauthParam = searchParams.get('oauth');
    
    if (stepParam) {
      const stepNum = parseInt(stepParam, 10);
      if (stepNum >= 1 && stepNum <= 5) {
        setStep(stepNum as typeof step);
      }
    }
    
    if (oauthParam === 'true') {
      setSignupMethod('oauth');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // OAuth 회원가입 시 스텝 2 진입 시 user/me 호출
  useEffect(() => {
    if (step === 2 && signupMethod === 'oauth') {
      const fetchUserInfo = async () => {
        setIsLoading(true);
        try {
          const userResponse = await userApi.getMyInfo();
          const userData = userResponse.data.data;
          
          // JobId 타입 검증
          const validJobIds: JobId[] = ['developer', 'designer', 'planner', 'student', 'other'];
          const job: JobId | '' = userData.job && validJobIds.includes(userData.job as JobId)
            ? (userData.job as JobId)
            : '';
          
          // API 응답 데이터를 formData에 업데이트
          updateFormData({
            nickname: userData.nickname || '',
            age: userData.age ? userData.age.toString() : '',
            job,
          });
          
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
          console.error('사용자 정보 조회 실패:', error);
          setErrors({ general: '사용자 정보를 불러오는데 실패했습니다. 다시 시도해주세요.' });
        }
      };

      fetchUserInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, signupMethod]);

  const handleNext = async () => {
    // 스텝 1: 이메일 회원가입인 경우 login API 호출
    if (step === 1 && validateStep1()) {
      // OAuth 회원가입의 경우 OAuth 콜백에서 이미 처리되므로 스텝 2로 이동만
      if (signupMethod === 'oauth') {
        setStep(2);
        return;
      }
      
      // provider === 'local' (이메일, 비밀번호 회원가입)인 경우
      if (signupMethod === 'email') {
        setIsLoading(true);
        try {
          // 1. auth/signup 호출 (email, password만 필요)
          const signupData: SignupRequest = {
            email: formData.email,
            password: formData.password,
          };

          await authApi.signup(signupData);

          // 2. auth/login 호출
          const loginData: LoginRequest = {
            email: formData.email,
            password: formData.password,
          };

          const response = await authApi.login(loginData);
          const tokenData = extractTokenData(response.data);
          
          // 3. 토큰 저장
          if (!tokenData.access_token || !tokenData.refresh_token) {
            throw new Error('토큰을 받지 못했습니다.');
          }
          
          setTokens(tokenData.access_token, tokenData.refresh_token);
          
          // 4. user/me 호출
          const userResponse = await userApi.getMyInfo();
          const userData = userResponse.data.data;
          
          // JobId 타입 검증
          const validJobIds: JobId[] = ['developer', 'designer', 'planner', 'student', 'other'];
          const job: JobId | '' = userData.job && validJobIds.includes(userData.job as JobId)
            ? (userData.job as JobId)
            : '';
          
          // API 응답 데이터를 formData에 업데이트
          updateFormData({
            nickname: userData.nickname || '',
            age: userData.age ? userData.age.toString() : '',
            job,
          });
          
          setIsLoading(false);
          setStep(2);
        } catch (error: any) {
          setIsLoading(false);
          console.error('회원가입/로그인 실패:', error);
          
          // 에러 상태 코드에 따라 다른 메시지 표시
          let errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';
          
          if (error?.response?.status === 409) {
            errorMessage = '이미 사용 중인 이메일입니다.';
          } else if (error?.response?.status === 401) {
            errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
          } else if (error?.response?.status === 400) {
            const errorData = error?.response?.data;
            if (errorData?.error?.message) {
              errorMessage = errorData.error.message;
            } else {
              errorMessage = '입력 정보를 확인해주세요.';
            }
          } else if (error?.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
          }
          
          setErrors({ general: errorMessage });
        }
        return;
      }
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    } else if (step === 4) {
      // 스텝 4: 직업 선택 후 user/me PATCH API 호출
      setIsLoading(true);
      try {
        const updateData: {
          job?: string;
        } = {};
        
        if (formData.job) {
          updateData.job = formData.job;
        }

        await userApi.updateMyInfo(updateData);
        setIsLoading(false);
        setStep(5);
      } catch (error) {
        setIsLoading(false);
        console.error('직업 업데이트 실패:', error);
        setErrors({ general: '직업 정보 업데이트에 실패했습니다. 다시 시도해주세요.' });
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
    navigate('/feed');
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
              errors={errors}
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
