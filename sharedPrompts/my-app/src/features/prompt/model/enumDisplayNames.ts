import type { ToneType, ExperienceLevel, StyleType, LanguageType } from '@/features/prompt/types/prompt.types';

// 백엔드 enum의 displayName과 일치하도록 매핑
export const TONE_DISPLAY_NAMES: Record<ToneType, string> = {
  FRIENDLY: '친근한',
  FORMAL: '공식적인',
  HUMOROUS: '유머러스한',
  MOTIVATIONAL: '동기부여형',
  CASUAL: '일상적인',
  PROFESSIONAL: '전문적인',
  EMPATHETIC: '공감하는',
  SARCASTIC: '비꼬는',
  POSITIVE: '긍정적인',
  NEGATIVE: '부정적인',
  INSPIRATIONAL: '영감을 주는',
  NEUTRAL: '중립적인',
  ENTHUSIASTIC: '열정적인',
};

export const EXPERIENCE_DISPLAY_NAMES: Record<ExperienceLevel, string> = {
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
  EXPERT: '전문가',
};

export const STYLE_DISPLAY_NAMES: Record<StyleType, string> = {
  NARRATIVE: '서사형',
  BULLET: '글머리형',
  CONCISE: '간결형',
  FORMATTED: '서식형',
  DESCRIPTIVE: '묘사형',
  INSTRUCTIVE: '설명/가이드형',
  QUESTION_ANSWER: '질문-답변형',
  STORYTELLING: '스토리텔링형',
  DIALOGUE: '대화형',
  COMPARATIVE: '비교형',
  ANALYTICAL: '분석형',
  CREATIVE: '창의형',
  TECHNICAL: '기술형',
  DETAILED: '상세형',
};

export const LANGUAGE_DISPLAY_NAMES: Record<LanguageType, string> = {
  KOREAN: '한국어',
  ENGLISH: '영어',
  JAPANESE: '일본어',
};

