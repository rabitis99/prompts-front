import { useState } from 'react';
import type { SignupStep, SignupFormData, SignupErrors, SignupMethod } from '@/features/auth/types/signup.types';

const initialFormData: SignupFormData = {
  email: '',
  password: '',
  nickname: '',
  age: '',
  job: '',
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
};

export function useSignupView() {
  const [step, setStep] = useState<SignupStep>(1);
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('');
  const [formData, setFormData] = useState<SignupFormData>(initialFormData);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (updates: Partial<SignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateStep1 = (): boolean => {
    if (signupMethod === 'oauth') return true;

    const newErrors: SignupErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: SignupErrors = {};
    if (formData.nickname.trim() && formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다';
    }

    if (!formData.age) {
      newErrors.age = '나이를 입력해주세요';
    } else {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum < 14 || ageNum > 100) {
        newErrors.age = '14세 이상 100세 이하만 가입 가능합니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: SignupErrors = {};
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '이용약관에 동의해주세요';
    }
    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = '개인정보처리방침에 동의해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
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
  };
}

