export type SignupMethod = 'email' | 'oauth' | '';

export type SignupStep = 1 | 2 | 3 | 4 | 5;

export type JobId = 'developer' | 'designer' | 'planner' | 'student' | 'other';

export interface JobOption {
  id: JobId;
  label: string;
  icon: string;
  desc: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  nickname: string;
  age: string;
  job: JobId | '';
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

export interface SignupErrors {
  email?: string;
  password?: string;
  nickname?: string;
  age?: string;
  agreeTerms?: string;
  agreePrivacy?: string;
  [key: string]: string | undefined;
}

export interface SignupRequest {
  email?: string;
  password?: string;
  nickname?: string;
  age?: number;
  job?: JobId;
  provider?: 'LOCAL' | 'GOOGLE' | 'KAKAO';
  user_terms?: {
    required: boolean;
    privacy: boolean;
    marketing: boolean;
  };
}