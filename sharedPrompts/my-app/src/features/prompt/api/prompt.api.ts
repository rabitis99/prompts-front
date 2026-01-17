import { api } from '@/shared/api/axios';
import type {
  PromptResponseDto,
  PromptRequestDto,
  PromptUpdateDto,
  PromptSearchCondition,
} from '@/features/prompt/types/prompt.types';
import type { CustomResponse, PageResponse } from '@/shared/types/api';

export const promptApi = {
  // 프롬프트 생성
  createPrompt: (data: PromptRequestDto) =>
    api.post<CustomResponse<PromptResponseDto>>('/prompts', data),

  // 프롬프트 목록 조회
  getPrompts: (condition?: PromptSearchCondition) =>
    api.get<CustomResponse<PageResponse<PromptResponseDto>>>('/prompts', {
      params: condition,
    }),

  // 프롬프트 상세 조회
  getPromptDetail: (id: number) =>
    api.get<CustomResponse<PromptResponseDto>>(`/prompts/${id}`),

  // 프롬프트 수정
  updatePrompt: (id: number, data: PromptUpdateDto) =>
    api.patch<CustomResponse<PromptResponseDto>>(`/prompts/${id}`, data),

  // 프롬프트 삭제
  deletePrompt: (id: number) =>
    api.delete<void>(`/prompts/${id}`),

  // 내 프롬프트 목록 조회
  getMyPrompts: (condition?: PromptSearchCondition) =>
    api.get<CustomResponse<PageResponse<PromptResponseDto>>>('/prompts/me', {
      params: condition,
    }),
};

