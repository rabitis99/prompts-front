import {
  Sparkles,
  Code,
  TrendingUp,
  Palette,
  PenTool,
  Globe,
  BookOpen,
  GraduationCap,
  Search,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { PromptCategory, PROMPT_CATEGORY_DISPLAY_NAMES } from '@/features/prompt/types/prompt.types';

export interface DomainOption {
  id: string;
  label: string;
  icon: LucideIcon;
  category?: PromptCategory;
}

// 카테고리별 아이콘 매핑
const CATEGORY_ICON_MAP: Partial<Record<PromptCategory, LucideIcon>> = {
  [PromptCategory.PRODUCTIVITY]: Sparkles,
  [PromptCategory.DEVELOPMENT]: Code,
  [PromptCategory.CODING]: Code,
  [PromptCategory.PROGRAMMING]: Code,
  [PromptCategory.ANALYSIS]: TrendingUp,
  [PromptCategory.MARKETING]: TrendingUp,
  [PromptCategory.CONTENT]: PenTool,
  [PromptCategory.CREATIVE]: Sparkles,
  [PromptCategory.STUDY]: BookOpen,
  [PromptCategory.EDUCATION]: GraduationCap,
  [PromptCategory.RESEARCH]: Search,
  [PromptCategory.BUSINESS]: Briefcase,
  [PromptCategory.DESIGN]: Palette,
  [PromptCategory.WRITING]: PenTool,
  [PromptCategory.ETC]: Globe,
};

// PROMPT_CATEGORY_DISPLAY_NAMES를 기반으로 동적으로 DOMAIN_OPTIONS 생성
export const DOMAIN_OPTIONS: DomainOption[] = [
  // '전체' 옵션
  { id: 'all', label: '전체', icon: Sparkles },
  // 모든 카테고리를 자동으로 생성
  ...(Object.entries(PROMPT_CATEGORY_DISPLAY_NAMES) as [PromptCategory, string][]).map(
    ([category, label]) => ({
      id: category.toLowerCase(),
      label,
      icon: CATEGORY_ICON_MAP[category] || Sparkles, // 기본값으로 Sparkles 사용
      category,
    })
  ),
];

export type SortOption = 'latest' | 'popular' | 'comments';

export const SORT_OPTIONS = {
  latest: '최신순',
  popular: '인기순',
  comments: '댓글순',
} as const;

