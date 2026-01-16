import type React from 'react';
import type { Provider } from '@/features/auth/types/user';

export interface ProfileData {
  id: number;
  nickname: string;
  email: string;
  job?: string;
  age?: number;
  bio?: string;
  provider: Provider;
}

export interface PasswordData {
  current: string;
  new: string;
  confirm: string;
}

export interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  marketing: boolean;
  newsletter: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
}

export interface JobOption {
  id: string;
  label: string;
  icon: string;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

