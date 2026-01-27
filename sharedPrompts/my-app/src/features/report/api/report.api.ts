import { api } from '@/shared/api/axios';
import type { CustomResponse, PageResponse } from '@/shared/types/api';
import type {
  ReportCreateRequestDto,
  ReportProcessRequestDto,
  ReportResponseDto,
  ReportDetailResponseDto,
  ReportStatus,
  ReportType,
} from '../types/report.types';

export const reportApi = {
  // 신고 생성
  createReport: (data: ReportCreateRequestDto) =>
    api.post<CustomResponse<ReportResponseDto>>('/reports', data),

  // 신고 상세 조회
  getReportDetail: (reportId: number) =>
    api.get<CustomResponse<ReportDetailResponseDto>>(`/reports/${reportId}`),

  // 신고 목록 조회 (전체)
  getReports: (page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<ReportResponseDto>>>('/reports', {
      params: { page, size },
    }),

  // 상태별 신고 목록 조회
  getReportsByStatus: (status: ReportStatus, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<ReportResponseDto>>>(`/reports/status/${status}`, {
      params: { page, size },
    }),

  // 타입별 신고 목록 조회
  getReportsByType: (type: ReportType, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<ReportResponseDto>>>(`/reports/type/${type}`, {
      params: { page, size },
    }),

  // 상태와 타입별 신고 목록 조회
  getReportsByStatusAndType: (
    status: ReportStatus,
    type: ReportType,
    page?: number,
    size?: number
  ) =>
    api.get<CustomResponse<PageResponse<ReportResponseDto>>>(`/reports/status/${status}/type/${type}`, {
      params: { page, size },
    }),

  // 내가 신고한 목록 조회
  getMyReports: (page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<ReportResponseDto>>>('/reports/me', {
      params: { page, size },
    }),

  // 관리자 신고 처리
  processReport: (reportId: number, data: ReportProcessRequestDto) =>
    api.patch<CustomResponse<ReportDetailResponseDto>>(`/reports/${reportId}/process`, data),
};

