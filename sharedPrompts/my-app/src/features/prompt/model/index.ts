/**
 * Prompt feature model — re-exports from 세분화된 하위 폴더
 * - create: 프롬프트 생성 플로우
 * - detail: 프롬프트 상세/댓글/관련
 * - feed: 홈 피드
 * - shared: enum 표시명·가이드라인 등 공용
 */

export {
  useCreatePromptView,
  getCurrentStepId,
  getTotalStepCount,
  getStepsForRequestType,
  type CreatePromptFormData,
  type CreatePromptRequestType,
  type StepId,
} from './create/useCreatePromptView';
export { DOMAINS, POPULAR_TAGS, CATEGORY_EXAMPLES, type DomainOption, type CategoryExample } from './create/createPrompt.constants';

export { usePromptDetailView } from './detail/usePromptDetailView';

export { useHomeFeedView } from './feed/useHomeFeedView';
export { DOMAIN_OPTIONS, SORT_OPTIONS, PAGE_SIZE, VALID_SORT_OPTIONS } from './feed/homeFeed.constants';
export type { SortOption, DomainOption as FeedDomainOption } from './feed/homeFeed.constants';

export {
  TONE_DISPLAY_NAMES,
  EXPERIENCE_DISPLAY_NAMES,
  STYLE_DISPLAY_NAMES,
  LANGUAGE_DISPLAY_NAMES,
} from './shared/enumDisplayNames';
export {
  TONE_GUIDELINES,
  EXPERIENCE_GUIDELINES,
  STYLE_GUIDELINES,
  EXAMPLE_PROMPTS,
} from './shared/enumGuidelines';
export { ACTION_TYPE_DISPLAY_NAMES_KO, ROLE_TYPE_DISPLAY_NAMES_KO } from './shared/actionRoleDisplayNames';
