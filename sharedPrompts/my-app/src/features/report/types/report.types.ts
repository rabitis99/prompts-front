// Report 관련 타입 정의

import type { CustomResponse, PageResponse } from '@/shared/types/api';

/**
 * 신고 타입
 */
export type ReportType = 'PROMPT' | 'COMMENT';

/**
 * 신고 상태 (백엔드 enum과 일치)
 */
export type ReportStatus = 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED';

/**
 * 신고 사유 (백엔드 enum과 일치)
 */
export type ReportReason =
  | 'SPAM'
  | 'INAPPROPRIATE_CONTENT'
  | 'COPYRIGHT_VIOLATION'
  | 'HARASSMENT'
  | 'FALSE_INFORMATION'
  | 'ETC';

// 상수는 constants/report.constants.ts로 이동됨

/**
 * 신고 생성 요청 DTO
 */
export interface ReportCreateRequestDto {
  report_type: ReportType;
  target_id: number;
  reason: ReportReason;
  description?: string;
}

/**
 * 신고 처리 요청 DTO (관리자용)
 */
export interface ReportProcessRequestDto {
  status: ReportStatus;
  process_comment?: string;
}

/**
 * 신고 응답 DTO
 */
export interface ReportResponseDto {
  id: number;
  report_type: ReportType;
  target_id: number;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reporter_id: number;
  reporter_nickname: string;
  created_at: string;
  updated_at: string;
}

/**
 * 신고 상세 응답 DTO
 */
export interface ReportDetailResponseDto extends ReportResponseDto {
  processor_id?: number;
  processor_nickname?: string;
  process_comment?: string;
}

// API 응답 타입
export type ReportResponse = CustomResponse<ReportResponseDto>;
export type ReportDetailResponse = CustomResponse<ReportDetailResponseDto>;
export type ReportListResponse = CustomResponse<PageResponse<ReportResponseDto>>;

