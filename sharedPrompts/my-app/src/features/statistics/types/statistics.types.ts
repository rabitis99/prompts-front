/**
 * 개인 통계 응답 DTO
 */
export interface MyStatisticsResponseDto {
  /**
   * 내가 작성한 프롬프트 수
   */
  my_prompts_count: number;

  /**
   * 내 프롬프트에 받은 총 좋아요 수
   */
  total_likes_received: number;
}

/**
 * 전체 통계 응답 DTO (관리자 전용)
 */
export interface StatisticsResponseDto {
  user_statistics: UserStatisticsResponseDto;
  prompt_statistics: PromptStatisticsResponseDto;
  ai_call_statistics: AiCallStatisticsResponseDto;
}

/**
 * 사용자 통계 응답 DTO (관리자 전용)
 */
export interface UserStatisticsResponseDto {
  total_users: number;
  active_users: number;
  blocked_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
}

/**
 * 프롬프트 통계 응답 DTO (관리자 전용)
 */
export interface PromptStatisticsResponseDto {
  total_prompts: number;
  public_prompts: number;
  private_prompts: number;
  new_prompts_today: number;
  new_prompts_this_week: number;
  new_prompts_this_month: number;
  total_likes: number;
  total_views: number;
  total_comments: number;
}

/**
 * AI 호출 통계 응답 DTO (관리자 전용)
 */
export interface AiCallStatisticsResponseDto {
  total_calls: number;
  calls_today: number;
  calls_this_week: number;
  calls_this_month: number;
  average_response_time?: number;
}

