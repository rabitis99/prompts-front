import { Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { ReportStatus } from '../types/report.types';

/**
 * 신고 상태에 따른 아이콘 반환
 */
export function getReportStatusIcon(status: ReportStatus) {
  switch (status) {
    case 'PENDING':
      return Clock;
    case 'PROCESSING':
      return Loader2;
    case 'RESOLVED':
      return CheckCircle2;
    case 'REJECTED':
      return XCircle;
    default:
      return AlertCircle;
  }
}

/**
 * 신고 상태에 따른 아이콘 색상 반환
 */
export function getReportStatusIconColor(status: ReportStatus): string {
  switch (status) {
    case 'PENDING':
      return 'text-amber-600';
    case 'PROCESSING':
      return 'text-blue-600';
    case 'RESOLVED':
      return 'text-green-600';
    case 'REJECTED':
      return 'text-red-600';
    default:
      return 'text-slate-400';
  }
}

/**
 * 신고 상태에 따른 배경/텍스트 색상 클래스 반환
 */
export function getReportStatusColorClasses(status: ReportStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PROCESSING':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'RESOLVED':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

/**
 * 날짜 포맷팅 (한국어 형식)
 */
export function formatReportDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

