export interface RecommendPromptRequest {
  request_mode: string; // e.g. 'SIMPLE'
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
  input: string; // maps from raw_input
  json_schema?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface UnifiedGeneratePromptResponse {
  output: string;
  resolved_category?: string;
  resolved_intent?: string;
  semantic_resolution_summary?: string;
  axis_sources?: Record<string, string>;
  recommendation_hints?: string[];
  validation_warnings?: string[];
  schema_failure_reasons?: string[];
  quality_badges?: Array<{ name: string; description: string }>;
}

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
