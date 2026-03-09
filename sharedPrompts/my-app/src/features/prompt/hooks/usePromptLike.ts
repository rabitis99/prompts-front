import { useState, useEffect, useCallback, useRef, Dispatch, SetStateAction } from 'react';
import { likeApi } from '@/features/like/api/like.api';
import type { PromptDetailResponse } from '@/features/prompt/types/prompt.types';

interface UsePromptLikeOptions {
  promptId: number | null;
  prompt: PromptDetailResponse | null;
  setPrompt: Dispatch<SetStateAction<PromptDetailResponse | null>>;
}

export function usePromptLike({ promptId, prompt, setPrompt }: UsePromptLikeOptions) {
  const [liked, setLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const latestPromptIdRef = useRef<number | null>(promptId);

  useEffect(() => {
    latestPromptIdRef.current = promptId;
  }, [promptId]);

  // 프롬프트 로드 시 좋아요 상태 확인
  useEffect(() => {
    if (!promptId) return;

    const checkLikeStatus = async () => {
      try {
        const response = await likeApi.checkPromptLike(promptId);
        if (latestPromptIdRef.current !== promptId) return;

        const { isLiked, like_count } = response.data.data;
        setLiked(isLiked);

        // 서버에서 내려준 최신 like_count로 동기화
        // 프롬프트 전환 시 응답 레이스 컨디션 방지: 현재 promptId와 일치하는 경우에만 업데이트
        if (typeof like_count === 'number') {
          setPrompt((prev) =>
            prev && prev.id === promptId
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
  }, [promptId, setPrompt]);

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

      if (latestPromptIdRef.current !== promptId) return;

      const { isLiked, like_count } = response.data.data;
      setLiked(isLiked);

      // 프롬프트 전환 시 응답 레이스 컨디션 방지: 현재 promptId와 일치하는 경우에만 업데이트
      if (typeof like_count === 'number') {
        setPrompt((prev) =>
          prev && prev.id === promptId
            ? {
                ...prev,
                like_count,
              }
            : prev,
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // TODO: 사용자에게 좋아요 실패에 대한 피드백 제공 (예: toast 또는 snackbar)
      // Toast 알림 시스템이 구현되면 아래 주석을 해제하고 사용하세요:
      // toast.error('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
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

