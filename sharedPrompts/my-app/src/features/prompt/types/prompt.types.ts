// Prompt 관련 타입 정의 (백엔드 DTO 문서 기준)

import type { UserResponseDto } from '@/features/auth/types/user';
import type { ActionType } from './action.types';
import type { RoleType } from './role.types';

// ========== Enum (문서 §3) ==========

export const PromptCategory = {
  PRODUCTIVITY: 'PRODUCTIVITY',
  DEVELOPMENT: 'DEVELOPMENT',
  ANALYSIS: 'ANALYSIS',
  MARKETING: 'MARKETING',
  CONTENT: 'CONTENT',
  CREATIVE: 'CREATIVE',
  STUDY: 'STUDY',
  EDUCATION: 'EDUCATION',
  RESEARCH: 'RESEARCH',
  BUSINESS: 'BUSINESS',
  DESIGN: 'DESIGN',
  WRITING: 'WRITING',
  ETC: 'ETC',
} as const;

export type PromptCategory = (typeof PromptCategory)[keyof typeof PromptCategory];

export const PROMPT_CATEGORY_DISPLAY_NAMES: Record<PromptCategory, string> = {
  [PromptCategory.PRODUCTIVITY]: '생산성',
  [PromptCategory.DEVELOPMENT]: '개발',
  [PromptCategory.ANALYSIS]: '분석',
  [PromptCategory.MARKETING]: '마케팅',
  [PromptCategory.CONTENT]: '콘텐츠 제작',
  [PromptCategory.CREATIVE]: '창작',
  [PromptCategory.STUDY]: '학습',
  [PromptCategory.EDUCATION]: '교육',
  [PromptCategory.RESEARCH]: '연구',
  [PromptCategory.BUSINESS]: '비즈니스',
  [PromptCategory.DESIGN]: '디자인',
  [PromptCategory.WRITING]: '글쓰기',
  [PromptCategory.ETC]: '기타',
};

/** 목록 정렬: LATEST(최신순), POPULAR(인기순) */
export const SortType = {
  LATEST: 'LATEST',
  POPULAR: 'POPULAR',
} as const;

export type SortType = (typeof SortType)[keyof typeof SortType];

/** SIMPLE/ADVANCED 요청 시 의도 (ActionIntent) */
export const ActionIntent = {
  // ─── CREATION ──────────
  CREATE: 'CREATE',
  GENERATE: 'GENERATE',
  BRAINSTORM: 'BRAINSTORM',

  // ─── MODIFICATION ──────────
  REWRITE: 'REWRITE',
  EDIT: 'EDIT',
  REFINE: 'REFINE',
  IMPROVE: 'IMPROVE',

  // ─── ANALYSIS ──────────
  ANALYZE: 'ANALYZE',
  EVALUATE: 'EVALUATE',
  COMPARE: 'COMPARE',
  CRITIQUE: 'CRITIQUE',
  DIAGNOSE: 'DIAGNOSE',

  // ─── EXPLANATION ──────────
  EXPLAIN: 'EXPLAIN',
  TEACH: 'TEACH',
  SIMPLIFY: 'SIMPLIFY',
  SUMMARIZE: 'SUMMARIZE',
  OUTLINE: 'OUTLINE',

  // ─── PLANNING ──────────
  PLAN: 'PLAN',
  STRATEGIZE: 'STRATEGIZE',
  PROPOSE: 'PROPOSE',
  ORGANIZE: 'ORGANIZE',

  // ─── DECISION ──────────
  RECOMMEND: 'RECOMMEND',
  OPTIMIZE: 'OPTIMIZE',
  DECIDE: 'DECIDE',

  // ─── RESEARCH ──────────
  INVESTIGATE: 'INVESTIGATE',
  SYNTHESIZE: 'SYNTHESIZE',
  EXPLORE: 'EXPLORE',

  // ─── EXTRACTION / CLASSIFICATION ──────────
  EXTRACT: 'EXTRACT',
  CLASSIFY: 'CLASSIFY',

  // ─── DEPRECATED (FOR FALLBACK) ──────────
  DEBUG: 'DEBUG',
  DESIGN: 'DESIGN',
  CODE: 'CODE',
} as const;

export type ActionIntent = (typeof ActionIntent)[keyof typeof ActionIntent];

export const ToneType = {
  FRIENDLY: 'FRIENDLY',
  FORMAL: 'FORMAL',
  HUMOROUS: 'HUMOROUS',
  MOTIVATIONAL: 'MOTIVATIONAL',
  CASUAL: 'CASUAL',
  PROFESSIONAL: 'PROFESSIONAL',
  EMPATHETIC: 'EMPATHETIC',
  POSITIVE: 'POSITIVE',
  INSPIRATIONAL: 'INSPIRATIONAL',
  NEUTRAL: 'NEUTRAL',
  ENTHUSIASTIC: 'ENTHUSIASTIC',
  SARCASTIC: 'SARCASTIC',
  NEGATIVE: 'NEGATIVE',
} as const;

export type ToneType = (typeof ToneType)[keyof typeof ToneType];

export const StyleType = {
  NARRATIVE: 'NARRATIVE',
  BULLET: 'BULLET',
  CONCISE: 'CONCISE',
  FORMATTED: 'FORMATTED',
  DESCRIPTIVE: 'DESCRIPTIVE',
  INSTRUCTIVE: 'INSTRUCTIVE',
  QUESTION_ANSWER: 'QUESTION_ANSWER',
  STORYTELLING: 'STORYTELLING',
  DIALOGUE: 'DIALOGUE',
  COMPARATIVE: 'COMPARATIVE',
  ANALYTICAL: 'ANALYTICAL',
  CREATIVE: 'CREATIVE',
  TECHNICAL: 'TECHNICAL',
  DETAILED: 'DETAILED',
} as const;

export type StyleType = (typeof StyleType)[keyof typeof StyleType];

export const ExperienceLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
} as const;

export type ExperienceLevel = (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

export const LanguageType = {
  KOREAN: 'KOREAN',
  ENGLISH: 'ENGLISH',
  JAPANESE: 'JAPANESE',
} as const;

export type LanguageType = (typeof LanguageType)[keyof typeof LanguageType];

/** 통합 생성 API 요청 종류 */
export const RequestType = {
  SIMPLE: 'SIMPLE',
  EXTRACTION: 'EXTRACTION',
  ADVANCED: 'ADVANCED',
} as const;

export type RequestTypeValue = (typeof RequestType)[keyof typeof RequestType];

/** 엔진 모드: AUTO | V2 | V3 */
export const EngineMode = {
  AUTO: 'AUTO',
  V2: 'V2',
  V3: 'V3',
} as const;

export type EngineMode = (typeof EngineMode)[keyof typeof EngineMode];

/** 스타일 축 (메타데이터 응답용) */
export const StyleAxis = {
  STRUCTURE: 'STRUCTURE',
  DEPTH: 'DEPTH',
  FORMAT: 'FORMAT',
  FUNCTION: 'FUNCTION',
} as const;

export type StyleAxis = (typeof StyleAxis)[keyof typeof StyleAxis];

// Re-export for backward compatibility
export type { ActionType } from './action.types';
export type { RoleType } from './role.types';

// ========== Response DTOs (문서 §2) ==========

/** 품질 배지 (통합 생성 응답) — 백엔드 BadgeDto: code, display_name */
export interface BadgeDto {
  code: string;
  display_name: string;
}

/** 통합 프롬프트 생성 API 응답 — 백엔드 UnifiedGeneratePromptResponse 기준 */
export interface UnifiedGeneratePromptResponse {
  output: string;
  requested_engine_mode: EngineMode;
  effective_engine_mode: EngineMode;
  engine_profile: string; // EngineProfile
  resolved_category?: PromptCategory;
  resolved_domain: string; // TaskDomain
  objective: string; // PromptObjective
  output_needs: string; // OutputNeeds
  resolved_intent: ActionIntent;
  variant: string | null;
  resolved_role: string | null; // RoleTypeInterface (stable key)
  resolved_action: string | null; // ActionTypeInterface (stable key)
  quality_badges: BadgeDto[];
  verify_passed: boolean;
  repair_count: number;
  finally_passed: boolean;
  schema_contract_failed: boolean;
  schema_failure_reasons: string[];
  semantic_profiles_applied?: string[];
  validation_warnings?: string[];
  recommendation_hints?: string[];
  semantic_resolution_summary?: string | null;
  axis_sources?: Record<string, string> | null;
  /** 생성 후 저장된 프롬프트 ID (백엔드가 반환할 경우 PATCH 등에 사용) */
  id?: number;
}

/** 목록 조회 항목 (GET /prompts, /prompts/me, /prompts/users/{userId}) — 백엔드 PromptSummaryResponse */
export interface PromptSummaryResponse {
  id: number;
  title: string;
  prompt_category: PromptCategory;
  tags: string[];
  author_id: number;
  author_nickname: string;
  like_count: number;
  view_count: number;
  created_at: string;
  description?: string;
  content?: string;
  comment_count?: number;
}

/** 상세 조회/수정 응답 (GET /prompts/{id}, PATCH /prompts/{id}) — 백엔드 PromptDetailResponse */
export interface PromptDetailResponse {
  id: number;
  title: string;
  description: string;
  content: string;
  prompt_category: PromptCategory;
  tags: string[];
  author_id: number;
  author_nickname: string;
  like_count: number;
  view_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  comment_count?: number;
}

/** 즐겨찾기 등 다른 모듈용 프롬프트 응답 (user_response_dto 포함) */
export interface PromptResponseDto {
  id: number;
  title: string;
  description: string;
  content: string;
  is_public: boolean;
  prompt_category: PromptCategory;
  tags: string[];
  user_response_dto: UserResponseDto | null;
  view_count: number;
  comment_count: number;
  like_count: number;
  favorite_count?: number;
  created_at?: string;
  updated_at?: string;
}

// ========== Request DTOs (문서 §1, JSON snake_case) ==========

/** SIMPLE 요청 (category, intent 필수) — 백엔드 DTO는 camelCase "category" 사용 */
export interface SimpleGeneratePromptRequest {
  request_type: 'SIMPLE';
  category: PromptCategory;
  intent: ActionIntent;
  variant?: string;
  input: string;
  tone?: ToneType;
  style?: StyleType;
  language?: LanguageType;
  experience?: ExperienceLevel;
  tags?: string[];
  title?: string;
  description?: string;
}

/** EXTRACTION 요청 (json_schema 필수) */
export interface ExtractionGeneratePromptRequest {
  request_type: 'EXTRACTION';
  input: string;
  json_schema: string;
  language?: LanguageType;
  tags?: string[];
  title?: string;
  description?: string;
}

/** ADVANCED 요청 (action_type, role_type은 도메인별 문자열) — 백엔드 DTO는 camelCase "category" 사용 */
export interface AdvancedGeneratePromptRequest {
  request_type: 'ADVANCED';
  category: PromptCategory;
  intent: ActionIntent;
  variant?: string;
  input: string;
  json_schema?: string;
  engine_mode?: EngineMode;
  tone?: ToneType;
  style?: StyleType;
  language?: LanguageType;
  experience?: ExperienceLevel;
  disable_quality_pipeline?: boolean;
  action_type?: string;
  role_type?: string;
  core_role?: string;
  domain_role?: string;
  tags?: string[];
  title?: string;
  description?: string;
}

export type GeneratePromptRequestDto =
  | SimpleGeneratePromptRequest
  | ExtractionGeneratePromptRequest
  | AdvancedGeneratePromptRequest;

/** PATCH /prompts/{id} body */
export interface PromptUpdateDto {
  title?: string;
  description?: string;
  is_public?: boolean;
  prompt_category?: PromptCategory;
  tags?: string[];
}

/** 목록 API 쿼리 (page, size, sort, prompt_category, keyword) */
export interface PromptSearchCondition {
  page?: number;
  size?: number;
  sort?: SortType;
  prompt_category?: PromptCategory;
  keyword?: string;
}

/** 목록/상세 카드에서 공통으로 쓸 수 있는 타입 (Summary + 선택적 상세 필드) */
export type PromptListItem = PromptSummaryResponse | PromptDetailResponse | PromptResponseDto;
