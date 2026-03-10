/** POST /prompts/recommend — 백엔드 RecommendPromptRequest */
export interface RecommendPromptRequest {
  request_mode: string; // RequestMode: SIMPLE | EXTRACTION | ADVANCED
  category?: string;
  intent?: string;
  role_type?: string;
  action_type?: string;
  tone?: string;
  style?: string;
  language?: string;
  experience?: string;
  raw_input: string;
}

/** POST /prompts/recommend 응답 — 백엔드 RecommendPromptResponse */
export interface RecommendPromptResponse {
  request_mode: string;
  category: string;
  recommended_intent?: string;
  intent_candidates?: string[];
  recommended_role?: string;
  role_candidates?: string[];
  recommended_action?: string;
  action_candidates?: string[];
  recommended_tone?: string;
  recommended_style?: string;
  axis_sources?: Record<string, string>;
  recommendation_hints?: string[];
  validation_warnings?: string[];
  fallback_applied?: string[];
  default_selection?: string;
}

/** POST /prompts/generate/confirmed — 백엔드 ConfirmedGeneratePromptRequest */
export interface ConfirmedGeneratePromptRequest {
  request_mode: string;
  category: string;
  intent: string;
  role_type?: string;
  action_type?: string;
  tone?: string;
  style?: string;
  language?: string;
  experience?: string;
  input: string;
  json_schema?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

/** 통합 생성 응답은 prompt.types.UnifiedGeneratePromptResponse 사용 */
export type { UnifiedGeneratePromptResponse } from '@/features/prompt/types/prompt.types';

export interface PromptBuilderState {
  rawInput: string;
  category: string;
  selectedAxes: {
    intent: string;
    roleType: string;
    actionType: string;
    tone: string;
    style: string;
    language: string;
    experience: string;
  };
}

export interface UserOverrides {
  intent: boolean;
  roleType: boolean;
  actionType: boolean;
  tone: boolean;
  style: boolean;
  language: boolean;
  experience: boolean;
}
