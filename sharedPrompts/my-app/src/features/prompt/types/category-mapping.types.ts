// 카테고리별 ActionType 및 RoleType 매핑

import { PromptCategory } from './prompt.types';
import type { ActionType } from './action.types';
import type { RoleType } from './role.types';

// 카테고리별 ActionType 매핑
export const CATEGORY_ACTION_TYPES: Record<PromptCategory, readonly ActionType[]> = {
  [PromptCategory.PRODUCTIVITY]: [
    'WORKFLOW_OPTIMIZATION',
    'TIME_MANAGEMENT',
    'SCHEDULE_PLANNING',
    'DAILY_PLANNING',
    'WEEKLY_PLANNING',
    'MONTHLY_PLANNING',
    'TASK_AUTOMATION',
    'SHOPPING_LIST',
    'MEAL_PLANNING',
    'BUDGET_PLANNING',
    'HOUSEHOLD_MANAGEMENT',
    'EFFICIENCY_ANALYSIS',
    'PRODUCTIVITY_PLANNING',
    'PROCESS_IMPROVEMENT',
    'RESOURCE_OPTIMIZATION',
  ] as const,
  [PromptCategory.DEVELOPMENT]: [
    'ARCHITECTURE_DESIGN',
    'SYSTEM_DESIGN',
    'TECH_STACK_SELECTION',
    'PERFORMANCE_OPTIMIZATION',
    'DEPLOYMENT_STRATEGY',
    'DOCUMENTATION',
    'CODEBASE_ANALYSIS',
    'SECURITY_IMPLEMENTATION',
    'SCALABILITY_PLANNING',
  ] as const,
  [PromptCategory.CODING]: [
    'CODE_GENERATION',
    'CODE_MODIFICATION',
    'CODE_REVIEW',
    'REFACTORING',
    'TEST_GENERATION',
    'DEBUGGING',
    'CODE_ANALYSIS',
    'PATTERN_APPLICATION',
    'CODE_OPTIMIZATION',
    'LEGACY_CODE_MAINTENANCE',
  ] as const,
  [PromptCategory.PROGRAMMING]: [
    'ALGORITHM_IMPLEMENTATION',
    'DATA_STRUCTURE_DESIGN',
    'LANGUAGE_LEARNING',
    'SYNTAX_OPTIMIZATION',
    'LOGIC_DEVELOPMENT',
    'API_DESIGN',
    'CONCURRENT_PROGRAMMING',
  ] as const,
  [PromptCategory.ANALYSIS]: [
    'DATA_ANALYSIS',
    'STATISTICAL_ANALYSIS',
    'INSIGHT_EXTRACTION',
    'TREND_ANALYSIS',
    'PATTERN_RECOGNITION',
    'PREDICTIVE_ANALYSIS',
    'COMPARATIVE_ANALYSIS',
    'ROOT_CAUSE_ANALYSIS',
    'BUSINESS_INTELLIGENCE',
  ] as const,
  [PromptCategory.MARKETING]: [
    'MARKETING_STRATEGY',
    'BRANDING',
    'AD_CAMPAIGN',
    'MARKET_RESEARCH',
    'CUSTOMER_ANALYSIS',
    'SEO_OPTIMIZATION',
    'SOCIAL_MEDIA_STRATEGY',
    'CONTENT_MARKETING',
    'INFLUENCER_MARKETING',
    'CONVERSION_OPTIMIZATION',
  ] as const,
  [PromptCategory.CONTENT]: [
    'CONTENT_CREATION',
    'CONTENT_REVISION',
    'CONTENT_PLANNING',
    'BLOG_WRITING',
    'SNS_CONTENT',
    'SOCIAL_MEDIA_POST',
    'INSTAGRAM_CAPTION',
    'FACEBOOK_POST',
    'TWITTER_POST',
    'COMMENT_WRITING',
    'VIDEO_SCRIPT',
    'CONTENT_OPTIMIZATION',
    'MULTIMEDIA_PRODUCTION',
    'PODCAST_SCRIPT',
    'NEWSLETTER_WRITING',
  ] as const,
  [PromptCategory.CREATIVE]: [
    'IDEA_GENERATION',
    'CREATIVE_WRITING',
    'ARTISTIC_DESIGN',
    'STORYTELLING',
    'CONCEPT_DEVELOPMENT',
    'VISUAL_CREATION',
    'CHARACTER_DEVELOPMENT',
    'WORLD_BUILDING',
  ] as const,
  [PromptCategory.STUDY]: [
    'STUDY_PLANNING',
    'NOTE_TAKING',
    'KNOWLEDGE_ORGANIZATION',
    'COMPREHENSION_IMPROVEMENT',
    'MEMORIZATION_STRATEGY',
    'EXAM_PREPARATION',
    'SKILL_DEVELOPMENT',
    'LEARNING_PATH_DESIGN',
    'QUIZ_GENERATION',
  ] as const,
  [PromptCategory.EDUCATION]: [
    'CURRICULUM_DESIGN',
    'MATERIAL_CREATION',
    'TEACHING_METHOD',
    'LEARNER_ANALYSIS',
    'ASSESSMENT_DESIGN',
    'INTERACTIVE_CONTENT',
    'EDUCATIONAL_STRATEGY',
    'LESSON_PLANNING',
  ] as const,
  [PromptCategory.RESEARCH]: [
    'RESEARCH_DESIGN',
    'PAPER_WRITING',
    'METHODOLOGY_DEVELOPMENT',
    'EXPERIMENT_DESIGN',
    'DATA_INTERPRETATION',
    'LITERATURE_REVIEW',
    'HYPOTHESIS_FORMULATION',
    'STATISTICAL_MODELING',
  ] as const,
  [PromptCategory.BUSINESS]: [
    'PROPOSAL_WRITING',
    'REPORT_WRITING',
    'BUSINESS_STRATEGY',
    'PROJECT_MANAGEMENT',
    'FINANCIAL_ANALYSIS',
    'PRESENTATION_PREPARATION',
    'CONTRACT_REVIEW',
    'RISK_ASSESSMENT',
    'STAKEHOLDER_MANAGEMENT',
    'BUSINESS_PLAN_DEVELOPMENT',
  ] as const,
  [PromptCategory.DESIGN]: [
    'UI_DESIGN',
    'UX_DESIGN',
    'GRAPHIC_DESIGN',
    'PRODUCT_DESIGN',
    'DESIGN_DOC',
    'WIREFRAMING',
    'PROTOTYPING',
    'VISUAL_IDENTITY',
    'INTERACTION_DESIGN',
    'RESPONSIVE_DESIGN',
  ] as const,
  [PromptCategory.WRITING]: [
    'ARTICLE_WRITING',
    'ESSAY_WRITING',
    'TECHNICAL_WRITING',
    'CREATIVE_WRITING_GEN',
    'EDITING',
    'PROOFREADING',
    'TRANSLATION',
    'DOC_UPDATE',
    'COPYWRITING',
    'GRANT_WRITING',
    'LETTER_WRITING',
    'PERSONAL_LETTER',
    'BUSINESS_LETTER',
    'INVITATION_CARD',
    'THANK_YOU_CARD',
    'CONGRATULATORY_MESSAGE',
    'CONDOLENCE_MESSAGE',
    'MESSAGE_WRITING',
    'TEXT_MESSAGE',
    'WHATSAPP_MESSAGE',
  ] as const,
  [PromptCategory.ETC]: [
    'GENERAL_CONSULTATION',
    'PROBLEM_SOLVING',
    'INFORMATION_RESEARCH',
    'RECOMMENDATION',
    'EXPLANATION',
    'ADVICE',
    'GUIDANCE',
    'RECIPE_CREATION',
    'COOKING_TIPS',
    'HEALTH_MANAGEMENT',
  ] as const,
};

// 카테고리별 RoleType 매핑
export const CATEGORY_ROLE_TYPES: Record<PromptCategory, readonly RoleType[]> = {
  [PromptCategory.PRODUCTIVITY]: ['PRODUCTIVITY_EXPERT'] as const,
  [PromptCategory.DEVELOPMENT]: [
    'BACKEND_DEVELOPER',
    'FRONTEND_DEVELOPER',
    'FULL_STACK_DEVELOPER',
    'DEVOPS_ENGINEER',
    'CLOUD_ARCHITECT',
    'SITE_RELIABILITY_ENGINEER',
  ] as const,
  [PromptCategory.CODING]: [] as const,
  [PromptCategory.PROGRAMMING]: [] as const,
  [PromptCategory.ANALYSIS]: [] as const,
  [PromptCategory.MARKETING]: [
    'MARKETING_STRATEGIST',
    'BRAND_SPECIALIST',
    'DIGITAL_MARKETER',
  ] as const,
  [PromptCategory.CONTENT]: [
    'CONTENT_CREATOR',
    'CONTENT_STRATEGIST',
    'SOCIAL_MEDIA_MANAGER',
  ] as const,
  [PromptCategory.CREATIVE]: [
    'CREATIVE_DIRECTOR',
    'STORYTELLER',
    'CONCEPT_ARTIST',
  ] as const,
  [PromptCategory.STUDY]: [
    'STUDY_COACH',
    'LEARNING_SPECIALIST',
    'TUTOR',
  ] as const,
  [PromptCategory.EDUCATION]: [
    'EDUCATOR',
    'CURRICULUM_DESIGNER',
    'INSTRUCTIONAL_DESIGNER',
  ] as const,
  [PromptCategory.RESEARCH]: [
    'RESEARCHER',
    'ACADEMIC_WRITER',
    'RESEARCH_METHODOLOGIST',
  ] as const,
  [PromptCategory.BUSINESS]: [
    'BUSINESS_CONSULTANT',
    'PROJECT_MANAGER',
    'BUSINESS_ANALYST_BUSINESS',
    'FINANCIAL_ANALYST',
  ] as const,
  [PromptCategory.DESIGN]: [
    'UI_UX_DESIGNER',
    'GRAPHIC_DESIGNER',
    'PRODUCT_DESIGNER',
    'INTERACTION_DESIGNER',
  ] as const,
  [PromptCategory.WRITING]: [
    'TECHNICAL_WRITER',
    'CONTENT_WRITER',
    'COPYWRITER',
    'EDITOR',
    'TRANSLATOR',
  ] as const,
  [PromptCategory.ETC]: [
    'GENERAL_CONSULTANT',
    'PROBLEM_SOLVER',
    'INFORMATION_SPECIALIST',
  ] as const,
};

// 카테고리에 맞는 ActionType 타입 추출 헬퍼 타입
export type ActionTypeForCategory<C extends PromptCategory> = C extends keyof typeof CATEGORY_ACTION_TYPES
  ? (typeof CATEGORY_ACTION_TYPES)[C][number]
  : never;

// 카테고리에 맞는 RoleType 타입 추출 헬퍼 타입
export type RoleTypeForCategory<C extends PromptCategory> = C extends keyof typeof CATEGORY_ROLE_TYPES
  ? (typeof CATEGORY_ROLE_TYPES)[C][number]
  : never;

// 카테고리에 맞는 ActionType 목록을 반환하는 헬퍼 함수
export function getActionTypesForCategory(category: PromptCategory): readonly ActionType[] {
  return CATEGORY_ACTION_TYPES[category] || [];
}

// 카테고리에 맞는 RoleType 목록을 반환하는 헬퍼 함수
export function getRoleTypesForCategory(category: PromptCategory): readonly RoleType[] {
  return CATEGORY_ROLE_TYPES[category] || [];
}

