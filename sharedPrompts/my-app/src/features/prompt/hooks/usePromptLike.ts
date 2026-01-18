import { useState, useEffect, useCallback } from 'react';
import { likeApi } from '@/features/like/api/like.api';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';

interface UsePromptLikeOptions {
  promptId: number | null;
  prompt: PromptResponseDto | null;
  setPrompt: (prompt: PromptResponseDto | null) => void;
}

export function usePromptLike({ promptId, prompt, setPrompt }: UsePromptLikeOptions) {
  const [liked, setLiked] = useState(false);

  // 프롬프트 로드 시 좋아요 상태 확인
  useEffect(() => {
    if (!promptId) return;

    const checkLikeStatus = async () => {
      try {
        const response = await likeApi.checkPromptLike(promptId);
        setLiked(response.data.data.isLiked);
      } catch (err) {
        console.error('Failed to check prompt like status:', err);
        setLiked(false);
      }
    };

    checkLikeStatus();
  }, [promptId]);

  // 좋아요 토글
  const toggleLike = useCallback(async () => {
    if (!promptId || !prompt) return;

    const wasLiked = liked;

    // 낙관적 업데이트
    setLiked(!liked);
    setPrompt({
      ...prompt,
      like_count: wasLiked ? prompt.like_count - 1 : prompt.like_count + 1,
    });

    try {
      if (wasLiked) {
        await likeApi.unlikePrompt(promptId);
      } else {
        await likeApi.likePrompt(promptId);
      }
    } catch (error) {
      // 에러 발생 시 롤백
      setLiked(wasLiked);
      setPrompt({
        ...prompt,
        like_count: wasLiked ? prompt.like_count + 1 : prompt.like_count - 1,
      });
      console.error('Failed to toggle like:', error);
    }
  }, [promptId, prompt, liked, setPrompt]);

  return {
    liked,
    toggleLike,
  };
}

