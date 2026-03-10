import type { Dispatch, SetStateAction } from 'react';
import { usePromptLike } from '../../hooks/usePromptLike';
import { usePromptFavorite } from '../../hooks/usePromptFavorite';
import { usePromptCopy } from '../../hooks/usePromptCopy';

/**
 * 프롬프트 관련 액션들을 조합한 컴포저 훅
 * 좋아요, 즐겨찾기, 복사 기능을 통합하여 제공합니다.
 */
export function usePromptActions<T extends { id: number; like_count?: number; favorite_count?: number; content: string }>(
  promptId: number | null,
  prompt: T | null,
  setPrompt: Dispatch<SetStateAction<T | null>>
) {
  const { liked, isProcessing, toggleLike } = usePromptLike({ promptId, prompt, setPrompt });
  const { isFavorite, toggleFavorite } = usePromptFavorite({ promptId, prompt, setPrompt });
  const { copied, handleCopy } = usePromptCopy({ prompt });

  // UI 호환성을 위해 bookmarked로 매핑 (기존 코드와의 호환성 유지)
  return {
    liked,
    isLiking: isProcessing,
    bookmarked: isFavorite,
    copied,
    toggleLike,
    toggleBookmark: toggleFavorite,
    handleCopy,
  };
}
