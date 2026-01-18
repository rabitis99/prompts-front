import { api } from '@/shared/api/axios';
import type {
  MyStatisticsResponseDto,
  StatisticsResponseDto,
  UserStatisticsResponseDto,
  PromptStatisticsResponseDto,
  AiCallStatisticsResponseDto,
} from '../types/statistics.types';
import type { CustomResponse } from '@/shared/types/api';

/**
 * 통계 API
 * 백엔드: StatisticsController
 */
export const statisticsApi = {
  /**
   * 내 통계 조회
   * 백엔드: GET /statistics/me
   */
  getMyStatistics: () =>
    api.get<CustomResponse<MyStatisticsResponseDto>>('/statistics/me'),

  /**
   * 전체 통계 조회 (관리자 전용)
   * 백엔드: GET /statistics
   */
  getAllStatistics: () =>
    api.get<CustomResponse<StatisticsResponseDto>>('/statistics'),

  /**
   * 사용자 통계 조회 (관리자 전용)
   * 백엔드: GET /statistics/users
   */
  getUserStatistics: () =>
    api.get<CustomResponse<UserStatisticsResponseDto>>('/statistics/users'),

  /**
   * 프롬프트 통계 조회 (관리자 전용)
   * 백엔드: GET /statistics/prompts
   */
  getPromptStatistics: () =>
    api.get<CustomResponse<PromptStatisticsResponseDto>>('/statistics/prompts'),

  /**
   * AI 호출 통계 조회 (관리자 전용)
   * 백엔드: GET /statistics/ai-calls
   */
  getAiCallStatistics: () =>
    api.get<CustomResponse<AiCallStatisticsResponseDto>>('/statistics/ai-calls'),
};

