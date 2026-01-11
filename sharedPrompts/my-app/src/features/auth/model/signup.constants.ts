import type { JobOption } from '@/features/auth/types/signup.types';

export const SIGNUP_JOBS: JobOption[] = [
  { id: 'developer', label: '개발자', icon: '💻', desc: '프론트엔드, 백엔드, 풀스택 등' },
  { id: 'designer', label: '디자이너', icon: '🎨', desc: 'UI/UX, 그래픽, 브랜드 등' },
  { id: 'planner', label: '기획자', icon: '📋', desc: '서비스 기획, PM, PO 등' },
  { id: 'student', label: '학생', icon: '📚', desc: '대학생, 취준생, 부트캠프 등' },
  { id: 'other', label: '기타', icon: '✨', desc: '마케터, 작가, 번역가 등' },
];

export const PASSWORD_STRENGTH_LABELS = ['매우 약함', '약함', '보통', '강함', '매우 강함'];

export const PASSWORD_STRENGTH_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-emerald-500',
];

