import { api } from '@/shared/api/axios';
import type {
  RecommendPromptRequest,
  RecommendPromptResponse,
  ConfirmedGeneratePromptRequest,
  UnifiedGeneratePromptResponse,
} from '../types/prompt-builder.types';

export const recommendPrompts = async (data: RecommendPromptRequest): Promise<RecommendPromptResponse> => {
  const response = await api.post<RecommendPromptResponse>('/prompts/recommend', data);
  return response.data;
};

export const generateConfirmedPrompt = async (data: ConfirmedGeneratePromptRequest): Promise<UnifiedGeneratePromptResponse> => {
  const response = await api.post<UnifiedGeneratePromptResponse>('/prompts/generate/confirmed', data);
  return response.data;
};
