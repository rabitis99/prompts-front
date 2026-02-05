import { api } from '@/shared/api/axios';
import type {
  AdminUserResponseDto,
  AdminPromptResponseDto,
  UserBlockRequestDto,
  UserRoleChangeRequestDto,
  PromptVisibilityRequestDto,
  AdminFollowUserDto,
} from '../types/admin.types';
import type { PageResponse, CustomResponse } from '@/shared/types/api';
import type {
  ReportResponseDto,
  ReportDetailResponseDto,
  ReportProcessRequestDto,
} from '@/features/report/types/report.types';
import type { ReportStatus } from '@/features/report/types/report.types';
import type { FollowStatus } from '@/features/follow/types/follow.types';

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

  // ======================
  //      팔로우 관리
  // ======================

  /**
   * 팔로우 관계 조회 (관리자용)
   * 백엔드: GET /admin/follows
   *
   * - followerId, followingId는 선택적
   * - status는 필수
   */
  getFollows: (params: {
    status: FollowStatus;
    followerId?: number;
    followingId?: number;
    page?: number;
    size?: number;
  }) =>
    api.get<CustomResponse<PageResponse<AdminFollowUserDto>>>('/admin/follows', {
      params,
    }),

  // ======================
  //      인증 보안 이벤트 로그
  // ======================

  /**
   * 인증 보안 이벤트 로그 조회
   * 백엔드: GET /admin/auth-audit-logs
   */
  getAuthAuditLogs: (params?: {
    provider?: string;
    userId?: number;
    eventType?: string;
    failReason?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) =>
    api.get<CustomResponse<PageResponse<import('../types/admin.types').AuthAuditLogResponseDto>>>('/admin/auth-audit-logs', {
      params,
    }),

  // ======================
  //      Rate Limit 로그
  // ======================

  /**
   * Rate Limit 로그 조회
   * 백엔드: GET /admin/rate-limit-logs
   */
  getRateLimitLogs: (params?: {
    ruleName?: string;
    userId?: number;
    rateLimitType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) =>
    api.get<CustomResponse<PageResponse<import('../types/admin.types').RateLimitLogResponseDto>>>('/admin/rate-limit-logs', {
      params,
    }),

  /**
   * Rate Limit 통계 조회
   * 백엔드: GET /admin/rate-limit-logs/statistics
   */
  getRateLimitLogStatistics: (params?: {
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<CustomResponse<import('../types/admin.types').RateLimitLogStatisticsResponseDto>>('/admin/rate-limit-logs/statistics', {
      params,
    }),

  // ======================
  //      유지보수 작업
  // ======================

  /**
   * 좋아요 수 재빌드 시작
   * 백엔드: POST /admin/maintenance/likes/rebuild
   */
  rebuildLikeCounts: () =>
    api.post<CustomResponse<void>>('/admin/maintenance/likes/rebuild'),

  /**
   * 좋아요 수 재빌드 상태 조회
   * 백엔드: GET /admin/maintenance/likes/rebuild/status
   */
  getRebuildLikeCountsStatus: () =>
    api.get<CustomResponse<import('../types/admin.types').RebuildLikeCountsStatusResponseDto>>('/admin/maintenance/likes/rebuild/status'),

  // ======================
  //      Payment 관리
  // ======================

  /**
   * 결제 상태 조회 (관리자용)
   * 백엔드: GET /admin/payments/{paymentId}/status
   */
  getPaymentStatus: (paymentId: number) =>
    api.get<CustomResponse<import('@/features/payment/types/payment.types').PaymentStatusResponseDto>>(`/admin/payments/${paymentId}/status`),

  /**
   * 사용자 결제 내역 조회 (관리자용)
   * 백엔드: GET /admin/payments/users/{userId}/history
   */
  getUserPaymentHistory: (userId: number, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<import('@/features/payment/types/payment.types').PaymentResponseDto>>>(`/admin/payments/users/${userId}/history`, {
      params: { page, size },
    }),

  /**
   * 전체 결제 내역 조회 (관리자용)
   * 백엔드: GET /admin/payments/history
   */
  getAllPaymentHistory: (page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<import('@/features/payment/types/payment.types').PaymentResponseDto>>>('/admin/payments/history', {
      params: { page, size },
    }),

  /**
   * 결제 취소 (관리자용)
   * 백엔드: POST /admin/payments/{paymentId}/cancel
   */
  cancelPayment: (paymentId: number, reason?: string) =>
    api.post<CustomResponse<import('@/features/payment/types/payment.types').PaymentResponseDto>>(`/admin/payments/${paymentId}/cancel`, {
      reason: reason || '관리자 요청',
    }),

  /**
   * 결제 환불 (관리자용)
   * 백엔드: POST /admin/payments/{paymentId}/refund
   */
  refundPayment: (paymentId: number, amount?: number, reason?: string) =>
    api.post<CustomResponse<import('@/features/payment/types/payment.types').PaymentResponseDto>>(`/admin/payments/${paymentId}/refund`, {
      amount,
      reason: reason || '관리자 요청',
    }),

  /**
   * 사용자 티어 조회 (관리자용)
   * 백엔드: GET /admin/payments/users/{userId}/tier
   */
  getUserTier: (userId: number) =>
    api.get<CustomResponse<import('@/features/payment/types/payment.types').UserTier>>(`/admin/payments/users/${userId}/tier`),

  /**
   * 사용자 티어 정보 조회 (관리자용)
   * 백엔드: GET /admin/payments/users/{userId}/tier-info
   */
  getUserTierInfo: (userId: number) =>
    api.get<CustomResponse<import('@/features/payment/types/payment.types').TierInfoResponseDto>>(`/admin/payments/users/${userId}/tier-info`),

  /**
   * 사용자 티어 변경 이력 조회 (관리자용)
   * 백엔드: GET /admin/payments/users/{userId}/tier-history
   */
  getUserTierHistory: (userId: number, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<import('@/features/payment/types/payment.types').UserTierHistoryResponseDto>>>(`/admin/payments/users/${userId}/tier-history`, {
      params: { page, size },
    }),

  /**
   * 사용자 티어 변경 (관리자용)
   * 백엔드: POST /admin/payments/users/{userId}/tier
   */
  changeUserTier: (userId: number, data: import('@/features/payment/types/payment.types').TierChangeRequestDto) =>
    api.post<CustomResponse<void>>(`/admin/payments/users/${userId}/tier`, data),

  // ======================
  //      Point 관리
  // ======================

  /**
   * 사용자 포인트 잔액 조회 (관리자용)
   * 백엔드: GET /admin/points/users/{userId}/balance
   */
  getUserPointBalance: (userId: number) =>
    api.get<CustomResponse<import('@/features/payment/types/payment.types').PointBalanceResponseDto>>(`/admin/points/users/${userId}/balance`),

  /**
   * 사용자 포인트 내역 조회 (관리자용)
   * 백엔드: GET /admin/points/users/{userId}/history
   */
  getUserPointHistory: (userId: number, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<import('@/features/payment/types/payment.types').PointResponseDto>>>(`/admin/points/users/${userId}/history`, {
      params: { page, size },
    }),

  /**
   * 사용자 포인트 차감 (관리자용)
   * 백엔드: POST /admin/points/users/{userId}/use
   */
  useUserPoints: (userId: number, data: import('@/features/payment/types/payment.types').PointUseRequestDto) =>
    api.post<CustomResponse<import('@/features/payment/types/payment.types').PointBalanceResponseDto>>(`/admin/points/users/${userId}/use`, data),

  /**
   * 결제별 포인트 조회 (관리자용)
   * 백엔드: GET /admin/points/payments/{paymentId}
   */
  getPointsByPayment: (paymentId: number, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<import('@/features/payment/types/payment.types').PointResponseDto>>>(`/admin/points/payments/${paymentId}`, {
      params: { page, size },
    }),

  // ======================
  //      Cashback 관리
  // ======================

  /**
   * 사용자 캐시백 내역 조회 (관리자용)
   * 백엔드: GET /admin/cashbacks/users/{userId}/history
   */
  getUserCashbackHistory: (userId: number, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<import('@/features/payment/types/payment.types').CashbackResponseDto>>>(`/admin/cashbacks/users/${userId}/history`, {
      params: { page, size },
    }),

  /**
   * 사용자 미지급 캐시백 총액 조회 (관리자용)
   * 백엔드: GET /admin/cashbacks/users/{userId}/unpaid-total
   */
  getUserUnpaidCashbackTotal: (userId: number) =>
    api.get<CustomResponse<number>>(`/admin/cashbacks/users/${userId}/unpaid-total`),

  /**
   * 사용자 미지급 캐시백 목록 조회 (관리자용)
   * 백엔드: GET /admin/cashbacks/users/{userId}/unpaid
   */
  getUserUnpaidCashbacks: (userId: number, page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<import('@/features/payment/types/payment.types').CashbackResponseDto>>>(`/admin/cashbacks/users/${userId}/unpaid`, {
      params: { page, size },
    }),

  /**
   * 전체 미지급 캐시백 총액 조회 (관리자용)
   * 백엔드: GET /admin/cashbacks/unpaid-total
   */
  getAllUnpaidCashbackTotal: () =>
    api.get<CustomResponse<number>>('/admin/cashbacks/unpaid-total'),

  /**
   * 전체 미지급 캐시백 목록 조회 (관리자용)
   * 백엔드: GET /admin/cashbacks/unpaid
   */
  getAllUnpaidCashbacks: (page?: number, size?: number) =>
    api.get<CustomResponse<PageResponse<import('@/features/payment/types/payment.types').CashbackResponseDto>>>('/admin/cashbacks/unpaid', {
      params: { page, size },
    }),

  /**
   * 캐시백 지급 (관리자용)
   * 백엔드: POST /admin/cashbacks/{cashbackId}/pay
   */
  payCashback: (cashbackId: number) =>
    api.post<CustomResponse<string>>(`/admin/cashbacks/${cashbackId}/pay`),
};

