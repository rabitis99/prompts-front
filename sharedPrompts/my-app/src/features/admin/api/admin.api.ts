import { api } from '@/shared/api/axios';
import type {
  AdminUserResponseDto,
  AdminPromptResponseDto,
  UserBlockRequestDto,
  UserRoleChangeRequestDto,
  PromptVisibilityRequestDto,
} from '../types/admin.types';
import type { PageResponse, CustomResponse } from '@/shared/types/api';
import type {
  ReportResponseDto,
  ReportDetailResponseDto,
  ReportProcessRequestDto,
} from '@/features/report/types/report.types';
import type { ReportStatus } from '@/features/report/types/report.types';

/**
 * 관리자 API
 * 백엔드: AdminController
 */
export const adminApi = {
  // ======================
  //      사용자 관리
  // ======================

  /**
   * 사용자 목록 조회
   * 백엔드: GET /admin/users
   */
  getUsers: (keyword?: string, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<AdminUserResponseDto>>>('/admin/users', {
      params: { keyword, page, size },
    }),

  /**
   * 사용자 상세 조회
   * 백엔드: GET /admin/users/{id}
   */
  getUser: (id: number) =>
    api.get<CustomResponse<AdminUserResponseDto>>(`/admin/users/${id}`),

  /**
   * 사용자 차단/해제
   * 백엔드: PATCH /admin/users/{id}/block
   */
  blockUser: (id: number, data: UserBlockRequestDto) =>
    api.patch<CustomResponse<AdminUserResponseDto>>(`/admin/users/${id}/block`, data),

  /**
   * 사용자 권한 변경
   * 백엔드: PATCH /admin/users/{id}/role
   */
  changeUserRole: (id: number, data: UserRoleChangeRequestDto) =>
    api.patch<CustomResponse<AdminUserResponseDto>>(`/admin/users/${id}/role`, data),

  // ======================
  //      프롬프트 관리
  // ======================

  /**
   * 프롬프트 목록 조회
   * 백엔드: GET /admin/prompts
   */
  getPrompts: (keyword?: string, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<AdminPromptResponseDto>>>('/admin/prompts', {
      params: { keyword, page, size },
    }),

  /**
   * 프롬프트 상세 조회
   * 백엔드: GET /admin/prompts/{id}
   */
  getPrompt: (id: number) =>
    api.get<CustomResponse<AdminPromptResponseDto>>(`/admin/prompts/${id}`),

  /**
   * 프롬프트 삭제
   * 백엔드: DELETE /admin/prompts/{id}
   */
  deletePrompt: (id: number) => api.delete(`/admin/prompts/${id}`),

  /**
   * 프롬프트 공개/비공개 전환
   * 백엔드: PATCH /admin/prompts/{id}/visibility
   */
  togglePromptVisibility: (id: number, data: PromptVisibilityRequestDto) =>
    api.patch<CustomResponse<AdminPromptResponseDto>>(`/admin/prompts/${id}/visibility`, data),

  // ======================
  //      신고 처리
  // ======================

  /**
   * 신고 목록 조회
   * 백엔드: GET /admin/reports
   */
  getReports: (status?: ReportStatus, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<ReportResponseDto>>>('/admin/reports', {
      params: { status, page, size },
    }),

  /**
   * 신고 상세 조회
   * 백엔드: GET /admin/reports/{id}
   */
  getReportDetail: (id: number) =>
    api.get<CustomResponse<ReportDetailResponseDto>>(`/admin/reports/${id}`),

  /**
   * 신고 처리
   * 백엔드: PATCH /admin/reports/{id}/process
   */
  processReport: (id: number, data: ReportProcessRequestDto) =>
    api.patch<CustomResponse<ReportDetailResponseDto>>(`/admin/reports/${id}/process`, data),

  // ======================
  //      감사 로그 조회
  // ======================

  /**
   * 감사 로그 조회
   * 백엔드: GET /admin/audit-logs
   */
  getAuditLogs: (params?: {
    actorId?: number;
    entityType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) =>
    api.get<CustomResponse<PageResponse<import('../types/admin.types').AuditLogResponseDto>>>('/admin/audit-logs', {
      params,
    }),
};

