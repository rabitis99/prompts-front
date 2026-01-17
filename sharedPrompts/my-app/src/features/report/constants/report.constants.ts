import type { ReportReason, ReportStatus, ReportType } from '../types/report.types';

// 신고 사유 표시명 (백엔드 enum의 name 필드와 일치)
export const REPORT_REASON_DISPLAY_NAMES: Record<ReportReason, string> = {
  SPAM: '스팸',
  INAPPROPRIATE_CONTENT: '부적절한 내용',
  COPYRIGHT_VIOLATION: '저작권 침해',
  HARASSMENT: '괴롭힘',
  FALSE_INFORMATION: '거짓 정보',
  ETC: '기타',
};

// 신고 사유 설명 (백엔드 enum의 description 필드와 일치)
export const REPORT_REASON_DESCRIPTIONS: Record<ReportReason, string> = {
  SPAM: '스팸 또는 광고성 콘텐츠',
  INAPPROPRIATE_CONTENT: '욕설, 비방, 혐오 표현 등 부적절한 내용',
  COPYRIGHT_VIOLATION: '저작권을 침해하는 콘텐츠',
  HARASSMENT: '타인을 괴롭히거나 협박하는 내용',
  FALSE_INFORMATION: '거짓 정보나 오해의 소지가 있는 내용',
  ETC: '기타 사유',
};

// 신고 상태 표시명 (백엔드 enum의 displayName 필드와 일치)
export const REPORT_STATUS_DISPLAY_NAMES: Record<ReportStatus, string> = {
  PENDING: '대기중',
  PROCESSING: '처리중',
  RESOLVED: '처리완료',
  REJECTED: '반려',
};

// 신고 타입 표시명
export const REPORT_TYPE_DISPLAY_NAMES: Record<ReportType, string> = {
  PROMPT: '프롬프트',
  COMMENT: '댓글',
};

// 신고 관련 상수
export const REPORT_CONSTANTS = {
  MAX_DESCRIPTION_LENGTH: 1000,
  PAGE_SIZE: 10,
} as const;

