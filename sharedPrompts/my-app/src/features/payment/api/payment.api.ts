import { api } from '@/shared/api/axios';
import type {
  PaymentRequestDto,
  PaymentCancelRequestDto,
  PaymentRefundRequestDto,
  PaymentConfirmRequest,
  PaymentListResponse,
  PaymentResponse,
  PaymentStatusResponse,
  PaymentConfirmResponseType,
  TierResponse,
  TierInfoResponse,
  TierHistoryResponse,
  UserTier,
} from '../types/payment.types';

/**
 * Payment API
 * 백엔드: PaymentController
 */
export const paymentApi = {
  /**
   * 결제 요청
   * 백엔드: POST /payments
   */
  requestPayment: (data: PaymentRequestDto) =>
    api.post<PaymentResponse>('/payments', data),

  /**
   * 결제 상태 조회
   * 백엔드: GET /payments/{paymentId}/status
   */
  checkPaymentStatus: (paymentId: number) =>
    api.get<PaymentStatusResponse>(`/payments/${paymentId}/status`),

  /**
   * 결제 취소
   * 백엔드: POST /payments/cancel
   */
  cancelPayment: (data: PaymentCancelRequestDto) =>
    api.post<PaymentResponse>('/payments/cancel', data),

  /**
   * 결제 환불 (부분/전체)
   * 백엔드: POST /payments/refund
   */
  refundPayment: (data: PaymentRefundRequestDto) =>
    api.post<PaymentResponse>('/payments/refund', data),

  /**
   * 결제 승인 (토스페이먼츠 등 결제사별 승인 처리)
   * 백엔드: POST /payments/confirm
   */
  confirmPayment: (data: PaymentConfirmRequest) =>
    api.post<PaymentConfirmResponseType>('/payments/confirm', data),

  /**
   * 내 티어 조회
   * 백엔드: GET /payments/me/tier
   */
  getMyTier: () =>
    api.get<TierResponse>('/payments/me/tier'),

  /**
   * 내 티어 정보 조회 (티어, 일일 제한, 오늘 사용한 횟수, 남은 횟수)
   * 백엔드: GET /payments/me/tier-info
   */
  getMyTierInfo: () =>
    api.get<TierInfoResponse>('/payments/me/tier-info'),

  /**
   * 사용자의 결제 내역 조회
   * 백엔드: GET /payments/history
   */
  getPaymentHistory: (page?: number, size?: number) =>
    api.get<PaymentListResponse>('/payments/history', {
      params: { page, size },
    }),

  /**
   * 내 티어 변경 이력 조회
   * 백엔드: GET /payments/me/tier-history
   */
  getMyTierHistory: (page?: number, size?: number) =>
    api.get<TierHistoryResponse>('/payments/me/tier-history', {
      params: { page, size },
    }),
};

