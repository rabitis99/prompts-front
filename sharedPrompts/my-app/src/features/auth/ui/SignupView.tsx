import { Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useSignupView } from '@/features/auth/model/useSignupView';
import { authApi } from '@/features/auth/api/auth.api';
import { userApi } from '@/features/auth/api/user.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { JobId, SignupRequest } from '@/features/auth/types/signup.types';
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
  // 의도적으로 빈 의존성 배열 사용: OAuth 리다이렉트 시 최초 1회만 실행되어야 함
  // 같은 페이지 내에서 URL 파라미터가 변경되는 경우는 고려하지 않음
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

  // 스텝 2일 때 user/me API 호출 (무조건 호출)
  const hasFetchedUserInfo = useRef(false);
  const { accessToken } = useAuthStore();
  
  useEffect(() => {
    // 스텝이 2가 아닐 때 플래그 리셋
    if (step !== 2) {
      hasFetchedUserInfo.current = false;
      return;
    }
    
    // 스텝 2이고 아직 호출하지 않았으면 API 호출
    // 토큰이 있을 때만 API 호출 (OAuth 콜백 후 토큰이 저장되기 전에 호출되는 것을 방지)
    if (step === 2 && !hasFetchedUserInfo.current && accessToken) {
      hasFetchedUserInfo.current = true;
      setIsLoading(true);
      
      userApi.getMyInfo()
        .then((response) => {
          const userData = response.data.data;
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
        })
        .catch((error) => {
          console.error('사용자 정보 조회 실패:', error);
          setIsLoading(false);
          // 에러가 발생해도 회원가입은 계속 진행 가능
        });
    }
    // accessToken이 의존성에 포함되어 있으므로, 토큰이 설정되면 effect가 자동으로 다시 실행됨
  }, [step, updateFormData, setIsLoading, accessToken]);

  const handleNext = async () => {
    // 스텝 1: 이메일 회원가입인 경우 signup API 호출
    if (step === 1 && validateStep1()) {
      // OAuth 회원가입의 경우 OAuth 콜백에서 이미 처리되므로 스텝 2로 이동만
      if (signupMethod === 'oauth') {
        setStep(2);
        return;
      }
      
      // 이메일 회원가입인 경우 signup API 호출
      if (signupMethod === 'email') {
        setIsLoading(true);
        try {
          // 백엔드는 email과 password만 받음 (에러 메시지에 따르면 2 known properties: "password", "email")
          const signupData: Pick<SignupRequest, 'email' | 'password'> = {
            email: formData.email,
            password: formData.password,
          };

          const response = await authApi.signup(signupData);
          const tokenData = extractTokenData(response.data);
          setTokens(tokenData.access_token, tokenData.refresh_token);
          setIsLoading(false);
          setStep(2);
        } catch (error) {
          setIsLoading(false);
          console.error('회원가입 실패:', error);
          setErrors({ general: '회원가입에 실패했습니다. 다시 시도해주세요.' });
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
