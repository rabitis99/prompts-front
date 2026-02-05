import { api } from '@/shared/api/axios';
import type {
  PointUseRequestDto,
  PointBalanceResponse,
  PointListResponse,
} from '../types/payment.types';

/**
 * Point API
 * 백엔드: PointController
 */
export const pointApi = {
  /**
   * 포인트 잔액 조회
   * 백엔드: GET /points/balance
   */
  getBalance: () =>
    api.get<PointBalanceResponse>('/points/balance'),

  /**
   * 포인트 내역 조회
   * 백엔드: GET /points/history
   */
  getPointHistory: (page?: number, size?: number) =>
    api.get<PointListResponse>('/points/history', {
      params: { page, size },
    }),

  /**
   * 포인트 사용
   * 백엔드: POST /points/use
   */
  usePoints: (data: PointUseRequestDto) =>
    api.post<PointBalanceResponse>('/points/use', data),

  /**
   * 결제와 연관된 포인트 조회
   * 백엔드: GET /points/payment/{paymentId}
   */
  getPointsByPayment: (paymentId: number, page?: number, size?: number) =>
    api.get<PointListResponse>(`/points/payment/${paymentId}`, {
      params: { page, size },
    }),
};

