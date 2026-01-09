// Prompt 관련 타입 정의

import type { UserResponseDto, CustomResponse } from '@/features/auth/types/user';

export enum PromptCategory {
  PRODUCTIVITY = 'PRODUCTIVITY',
  DEVELOPMENT = 'DEVELOPMENT',
  CODING = 'CODING',
  PROGRAMMING = 'PROGRAMMING',
  ANALYSIS = 'ANALYSIS',
  MARKETING = 'MARKETING',
  CONTENT = 'CONTENT',
  CREATIVE = 'CREATIVE',
  STUDY = 'STUDY',
  EDUCATION = 'EDUCATION',
  RESEARCH = 'RESEARCH',
  BUSINESS = 'BUSINESS',
  DESIGN = 'DESIGN',
  WRITING = 'WRITING',
  ETC = 'ETC',
}

export enum SortType {
  LATEST = 'LATEST',
  POPULAR = 'POPULAR',
}

export enum ToneType {
  FRIENDLY = 'FRIENDLY',
  FORMAL = 'FORMAL',
  HUMOROUS = 'HUMOROUS',
  MOTIVATIONAL = 'MOTIVATIONAL',
  CASUAL = 'CASUAL',
  PROFESSIONAL = 'PROFESSIONAL',
  EMPATHETIC = 'EMPATHETIC',
  SARCASTIC = 'SARCASTIC',
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  INSPIRATIONAL = 'INSPIRATIONAL',
  NEUTRAL = 'NEUTRAL',
  ENTHUSIASTIC = 'ENTHUSIASTIC',
}

export enum StyleType {
  NARRATIVE = 'NARRATIVE',
  BULLET = 'BULLET',
  CONCISE = 'CONCISE',
  FORMATTED = 'FORMATTED',
  DESCRIPTIVE = 'DESCRIPTIVE',
  INSTRUCTIVE = 'INSTRUCTIVE',
  QUESTION_ANSWER = 'QUESTION_ANSWER',
  STORYTELLING = 'STORYTELLING',
  DIALOGUE = 'DIALOGUE',
  COMPARATIVE = 'COMPARATIVE',
  ANALYTICAL = 'ANALYTICAL',
  CREATIVE = 'CREATIVE',
  TECHNICAL = 'TECHNICAL',
  DETAILED = 'DETAILED',
}

export enum ExperienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum LanguageType {
  KOREAN = 'KOREAN',
  ENGLISH = 'ENGLISH',
  JAPANESE = 'JAPANESE',
}

// Prompt Response DTO
export interface PromptResponseDto {
  id: number;
  title: string;
  description: string;
  content: string;
  is_public: boolean;
  prompt_category: PromptCategory;
  tags: string[];
  user_response_dto: UserResponseDto;
  view_count: number;
  comment_count: number;
  like_count: number;
}

// Prompt Request DTO
export interface PromptRequestDto {
  title: string;
  description: string;
  is_public?: boolean;
  prompt_category: PromptCategory;
  tags?: string[];
  input: string;
  tone?: ToneType;
  experience?: ExperienceLevel;
  style?: StyleType;
  language?: LanguageType;
}

// Prompt Update DTO
export interface PromptUpdateDto {
  title?: string;
  description?: string;
  is_public?: boolean;
  prompt_category?: PromptCategory;
  tags?: string[];
}

// Prompt Search Condition
export interface PromptSearchCondition {
  page?: number;
  size?: number;
  sort?: SortType;
  prompt_category?: PromptCategory;
}

// Page Response
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
}

