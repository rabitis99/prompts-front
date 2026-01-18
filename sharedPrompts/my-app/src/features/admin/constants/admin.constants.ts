import { BarChart3, Users, FileText, AlertTriangle, History, TrendingUp } from 'lucide-react';

export const ADMIN_TABS = [
  { id: 'dashboard', label: '대시보드', icon: TrendingUp },
  { id: 'users', label: '사용자 관리', icon: Users },
  { id: 'prompts', label: '프롬프트 관리', icon: FileText },
  { id: 'reports', label: '신고 처리', icon: AlertTriangle },
  { id: 'audit-logs', label: '감사 로그', icon: History },
] as const;

export type AdminTabId = (typeof ADMIN_TABS)[number]['id'];

