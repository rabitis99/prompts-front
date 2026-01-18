import { useState, useEffect } from 'react';
import { favoriteApi } from '@/features/favorite/api/favorite.api';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';

interface UsePromptFavoriteOptions {
  promptId: number | null;
  prompt: PromptResponseDto | null;
  setPrompt: (prompt: PromptResponseDto | null) => void;
}

export function usePromptFavorite({ promptId, prompt, setPrompt }: UsePromptFavoriteOptions) {
  const [isFavorite, setIsFavorite] = useState(false);

  // 프롬프트 로드 시 즐겨찾기 상태 확인
  useEffect(() => {
    if (!promptId) return;

    const checkFavoriteStatus = async () => {
      try {
        const response = await favoriteApi.checkFavorite(promptId);
        setIsFavorite(response.data.data.isFavorite);
      } catch (err) {
        console.error('Failed to check prompt favorite status:', err);
        setIsFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [promptId]);

  // 즐겨찾기 토글
  const toggleFavorite = async () => {
    if (!promptId || !prompt) return;

    const wasFavorite = isFavorite;
    const currentFavoriteCount = prompt.favorite_count || 0;

    // 낙관적 업데이트
    setIsFavorite(!isFavorite);
    setPrompt({
      ...prompt,
      favorite_count: wasFavorite ? currentFavoriteCount - 1 : currentFavoriteCount + 1,
    });

    try {
      if (wasFavorite) {
        await favoriteApi.removeFavorite(promptId);
      } else {
        await favoriteApi.addFavorite(promptId);
      }
    } catch (error) {
      // 에러 발생 시 롤백
      setIsFavorite(wasFavorite);
      setPrompt({
        ...prompt,
        favorite_count: wasFavorite ? currentFavoriteCount + 1 : currentFavoriteCount - 1,
      });
      console.error('Failed to toggle favorite:', error);
    }
  };

  return {
    isFavorite,
    toggleFavorite,
  };
}

