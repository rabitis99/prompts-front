import { User, Shield, Bell, Palette, Flag, Bookmark, Users, CreditCard } from 'lucide-react';
import type { TabConfig, JobOption } from '../types/settings.types';

export const JOBS: JobOption[] = [
  { id: 'developer', label: '개발자', icon: '💻' },
  { id: 'designer', label: '디자이너', icon: '🎨' },
  { id: 'planner', label: '기획자', icon: '📋' },
  { id: 'student', label: '학생', icon: '📚' },
  { id: 'other', label: '기타', icon: '✨' },
];

export const TABS: TabConfig[] = [
  { id: 'profile', label: '프로필', icon: User },
  { id: 'security', label: '보안', icon: Shield },
  { id: 'notifications', label: '알림', icon: Bell },
  { id: 'appearance', label: '화면', icon: Palette },
  { id: 'favorites', label: '즐겨찾기', icon: Bookmark },
  { id: 'follows', label: '팔로우', icon: Users },
  { id: 'reports', label: '내신고보기', icon: Flag },
  { id: 'payment', label: 'Payment', icon: CreditCard },
];

export const NOTIFICATION_OPTIONS = [
  { key: 'likes', label: '좋아요 알림', desc: '내 프롬프트에 좋아요가 달리면 알림' },
  { key: 'comments', label: '댓글 알림', desc: '내 프롬프트에 댓글이 달리면 알림' },
  { key: 'follows', label: '팔로우 알림', desc: '새로운 팔로워가 생기면 알림' },
  { key: 'newsletter', label: '뉴스레터', desc: '주간 인기 프롬프트 모음' },
  { key: 'marketing', label: '마케팅 정보', desc: '이벤트, 프로모션 안내' },
] as const;

export const THEME_OPTIONS = [
  { id: 'light', label: '라이트', icon: '☀️' },
  { id: 'dark', label: '다크', icon: '🌙' },
  { id: 'system', label: '시스템', icon: '💻' },
] as const;

export const LANGUAGE_OPTIONS = [
  { id: 'ko', label: '한국어', flag: '🇰🇷' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
] as const;

