import { api } from '@/shared/api/axios';
import type {
  CashbackListResponse,
  CashbackTotalResponse,
} from '../types/payment.types';
import type { CustomResponse } from '@/shared/types/api';

/**
 * Cashback API
 * 백엔드: CashbackController
 */
export const cashbackApi = {
  /**
   * 사용자의 캐시백 내역 조회
   * 백엔드: GET /cashbacks/history
   */
  getCashbackHistory: (page?: number, size?: number) =>
    api.get<CashbackListResponse>('/cashbacks/history', {
      params: { page, size },
    }),

  /**
   * 미지급 캐시백 총액 조회
   * 백엔드: GET /cashbacks/unpaid-total
   */
  getUnpaidCashbackTotal: () =>
    api.get<CashbackTotalResponse>('/cashbacks/unpaid-total'),

  /**
   * 미지급 캐시백 목록 조회
   * 백엔드: GET /cashbacks/unpaid
   */
  getUnpaidCashbacks: (page?: number, size?: number) =>
    api.get<CashbackListResponse>('/cashbacks/unpaid', {
      params: { page, size },
    }),

  /**
   * 캐시백 지급 요청
   * 백엔드: POST /cashbacks/{cashbackId}/pay
   */
  payCashback: (cashbackId: number) =>
    api.post<CustomResponse<string>>(`/cashbacks/${cashbackId}/pay`),
};

