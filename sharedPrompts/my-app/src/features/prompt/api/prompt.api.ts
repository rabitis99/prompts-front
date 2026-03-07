import { api } from '@/shared/api/axios';
import type {
  PromptResponseDto,
  PromptRequestDto,
  PromptUpdateDto,
  PromptSearchCondition,
  GeneratePromptRequestDto,
  UnifiedGeneratePromptResponse,
  PromptSummaryResponse,
  PromptDetailResponse,
} from '@/features/prompt/types/prompt.types';
import type { CustomResponse, PageResponse } from '@/shared/types/api';

export const promptApi = {
  /** 프롬프트 생성 (통합 API: request_type별 SIMPLE | EXTRACTION | ADVANCED) → UnifiedGeneratePromptResponse */
  generatePrompt: (data: GeneratePromptRequestDto) =>
    api.post<CustomResponse<UnifiedGeneratePromptResponse>>('/prompts/generate', data),

  /** @deprecated generatePrompt 사용 권장. 레거시 create는 /prompts 로 전송 */
  createPrompt: (data: PromptRequestDto) =>
    api.post<CustomResponse<PromptResponseDto>>('/prompts', data),

  /** 목록: PageResponse<PromptSummaryResponse> */
  getPrompts: (condition?: PromptSearchCondition) =>
    api.get<CustomResponse<PageResponse<PromptSummaryResponse>>>('/prompts', {
      params: condition,
    }),

  /** 상세: PromptDetailResponse */
  getPromptDetail: (id: number) =>
    api.get<CustomResponse<PromptDetailResponse>>(`/prompts/${id}`),

  /** 수정 → PromptDetailResponse */
  updatePrompt: (id: number, data: PromptUpdateDto) =>
    api.patch<CustomResponse<PromptDetailResponse>>(`/prompts/${id}`, data),

  deletePrompt: (id: number) =>
    api.delete<void>(`/prompts/${id}`),

  getMyPrompts: (condition?: PromptSearchCondition) =>
    api.get<CustomResponse<PageResponse<PromptSummaryResponse>>>('/prompts/me', {
      params: condition,
    }),

  getUserPrompts: (userId: number, condition?: PromptSearchCondition) =>
    api.get<CustomResponse<PageResponse<PromptSummaryResponse>>>(
      `/prompts/users/${userId}`,
      { params: condition }
    ),
};

