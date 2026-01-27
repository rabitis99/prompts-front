/**
 * 프롬프트 검색 필터링 유틸리티
 */

import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';
import { PROMPT_CATEGORY_DISPLAY_NAMES } from '@/features/prompt/types/prompt.types';

/**
 * 프롬프트 목록을 검색 쿼리로 필터링
 * 
 * @param prompts - 필터링할 프롬프트 목록
 * @param searchQuery - 검색 쿼리
 * @returns 필터링된 프롬프트 목록
 */
export function filterPrompts(
  prompts: PromptResponseDto[],
  searchQuery: string
): PromptResponseDto[] {
  if (!searchQuery) {
    return prompts;
  }

  const query = searchQuery.toLowerCase();
  return prompts.filter((p) => {
    const categoryDisplayName =
      PROMPT_CATEGORY_DISPLAY_NAMES[p.prompt_category]?.toLowerCase() || '';
    return (
      p.title.toLowerCase().includes(query) ||
      p.tags.some((t) => t.toLowerCase().includes(query)) ||
      categoryDisplayName.includes(query)
    );
  });
}

