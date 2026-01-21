import { useState, useEffect, useCallback, useRef } from 'react';
import { likeApi } from '@/features/like/api/like.api';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';

interface UsePromptLikeOptions {
  promptId: number | null;
  prompt: PromptResponseDto | null;
  setPrompt: (prompt: PromptResponseDto | null | ((prev: PromptResponseDto | null) => PromptResponseDto | null)) => void;
}

export function usePromptLike({ promptId, prompt, setPrompt }: UsePromptLikeOptions) {
  const [liked, setLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  // 프롬프트 로드 시 좋아요 상태 확인
  useEffect(() => {
    if (!promptId) return;

    const checkLikeStatus = async () => {
      try {
        const response = await likeApi.checkPromptLike(promptId);
        const { isLiked, like_count } = response.data.data;
        setLiked(isLiked);

        // 서버에서 내려준 최신 like_count로 동기화
        if (typeof like_count === 'number') {
          setPrompt((prev: PromptResponseDto | null) =>
            prev
              ? {
                  ...prev,
                  like_count,
                }
              : prev,
          );
        }
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
    if (processingRef.current) return;

    setIsProcessing(true);
    processingRef.current = true;

    try {
      const response = liked
        ? await likeApi.unlikePrompt(promptId)
        : await likeApi.likePrompt(promptId);

      const { isLiked, like_count } = response.data.data;
      setLiked(isLiked);

      if (prompt && typeof like_count === 'number') {
        setPrompt({
          ...prompt,
          like_count,
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  }, [promptId, prompt, liked, setPrompt]);

  return {
    liked,
    isProcessing,
    toggleLike,
  };
}

