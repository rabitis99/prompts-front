import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';
import { usePromptLike } from '../hooks/usePromptLike';
import { usePromptFavorite } from '../hooks/usePromptFavorite';
import { usePromptCopy } from '../hooks/usePromptCopy';

/**
 * 프롬프트 관련 액션들을 조합한 컴포저 훅
 * 좋아요, 즐겨찾기, 복사 기능을 통합하여 제공합니다.
 */
export function usePromptActions(
  promptId: number | null,
  prompt: PromptResponseDto | null,
  setPrompt: (prompt: PromptResponseDto | null) => void
) {
  const { liked, toggleLike } = usePromptLike({ promptId, prompt, setPrompt });
  const { isFavorite, toggleFavorite } = usePromptFavorite({ promptId, prompt, setPrompt });
  const { copied, handleCopy } = usePromptCopy({ prompt });

  // UI 호환성을 위해 bookmarked로 매핑 (기존 코드와의 호환성 유지)
  return {
    liked,
    bookmarked: isFavorite,
    copied,
    toggleLike,
    toggleBookmark: toggleFavorite,
    handleCopy,
  };
}

