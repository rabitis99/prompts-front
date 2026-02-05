/**
 * Payment 관련 타입 정의
 */

import type { PageResponse, CustomResponse } from '@/shared/types/api';

// ======================
//      Payment
// ======================

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  KAKAO_PAY = 'KAKAO_PAY',
  TOSS = 'TOSS',
  PAYPAL = 'PAYPAL',
}

export enum PaymentUserType {
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS',
}

export enum UserTier {
  FREE = 'FREE',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}

export interface PaymentRequestDto {
  amount: number;
  currency: string; // 필수 (ISO 4217 통화 코드)
  payment_method: PaymentMethod; // 필수
  user_type: PaymentUserType; // 필수
  tier: UserTier; // 필수
  use_point_amount?: number; // 사용할 포인트 금액 (선택사항)
  metadata?: string; // 추가 메타데이터 (JSON 형태)
}

export interface PaymentCancelRequestDto {
  payment_id: string;
  reason?: string;
}

export interface PaymentRefundRequestDto {
  payment_id: string;
  amount?: number;
  reason?: string;
}

// 주의: PaymentConfirmRequest는 백엔드 API 스펙에 맞춰 snake_case를 사용합니다.
export interface PaymentConfirmRequest {
  order_id: string; // 내부 주문 ID (숫자 문자열)
  amount: number;
  payment_key: string;
  pg_token?: string; // 카카오페이 결제 승인 토큰 (카카오페이 결제 시 필수)
  toss_order_id?: string; // Toss Payments 위젯에서 사용한 orderId (선택적)
}

export interface PaymentResponseDto {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  user_type: PaymentUserType;
  tier?: UserTier;
  external_payment_id?: string;
  failure_reason?: string;
  retry_count: number;
  approved_at?: string;
  canceled_at?: string;
  refunded_amount?: number;
  refundable_amount?: number;
  used_point_amount?: number;
  metadata?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatusResponseDto {
  id: number;
  status: PaymentStatus;
  external_payment_id?: string;
  failure_reason?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// 주의: PaymentConfirmResponse는 Toss Payments API 응답 형식에 맞춰 camelCase를 사용합니다.
export interface PaymentConfirmResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  approvedAt?: string; // ISO 8601 형식 (OffsetDateTime)
  method?: string;
}

// ======================
//      Tier
// ======================

export interface TierInfoResponseDto {
  user_id: number;
  tier: UserTier;
  tier_description: string;
  daily_limit: number;
  today_used_count: number;
  remaining_count: number;
}

export interface UserTierHistoryResponseDto {
  id: number;
  user_id: number;
  previous_tier: UserTier;
  new_tier: UserTier;
  changed_by?: number;
  reason?: string;
  created_at: string;
}

export interface TierChangeRequestDto {
  tier: UserTier;
  reason?: string;
}

// ======================
//      Point
// ======================

// PointType은 백엔드에서 string으로 반환되므로 enum 대신 string 사용
// 주의: 백엔드에서 'USE'와 'USED'를 모두 반환할 수 있으나, 프론트엔드에서는 'USE'를 'USED'로 정규화하여 사용합니다.
// normalizePointType() 유틸리티 함수를 사용하여 정규화하세요.
export type PointType = 'EARNED' | 'USED' | 'REFUNDED' | 'USE';

export interface PointUseRequestDto {
  amount: number;
  description: string; // 필수
}

export interface PointBalanceResponseDto {
  user_id: number;
  current_balance: number;
  available_balance: number; // 만료되지 않은 포인트만
  expiring_soon: number; // 곧 만료될 포인트 (30일 이내)
}

export interface PointResponseDto {
  id: number;
  user_id: number;
  payment_id?: number;
  amount: number;
  type: PointType; // 'EARNED', 'USED', 'REFUNDED', 'USE' 등 (백엔드가 string을 반환하지만 타입 가드 사용 권장)
  // 주의: 'USE'는 UI에서 'USED'로 정규화됩니다. normalizePointType() 유틸리티 함수를 사용하세요.
  description?: string;
  balance: number;
  expired: boolean;
  expired_at?: string;
  created_at: string;
  updated_at: string;
}

// ======================
//      Cashback
// ======================

export interface CashbackResponseDto {
  id: number;
  user_id: number;
  payment_id?: number;
  amount: number;
  rate: number;
  payment_amount: number;
  description?: string;
  paid: boolean; // status 대신 paid 사용
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// ======================
//      API Response Types
// ======================

export type PaymentListResponse = CustomResponse<PageResponse<PaymentResponseDto>>;
export type PaymentResponse = CustomResponse<PaymentResponseDto>;
export type PaymentStatusResponse = CustomResponse<PaymentStatusResponseDto>;
export type PaymentConfirmResponseType = CustomResponse<PaymentConfirmResponse>;
export type TierResponse = CustomResponse<UserTier>;
export type TierInfoResponse = CustomResponse<TierInfoResponseDto>;
export type TierHistoryResponse = CustomResponse<PageResponse<UserTierHistoryResponseDto>>;
export type PointBalanceResponse = CustomResponse<PointBalanceResponseDto>;
export type PointListResponse = CustomResponse<PageResponse<PointResponseDto>>;
export type CashbackListResponse = CustomResponse<PageResponse<CashbackResponseDto>>;
export type CashbackTotalResponse = CustomResponse<number>;

