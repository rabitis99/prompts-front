import { useState } from 'react';
import { likeApi } from '@/features/like/api/like.api';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';

export function usePromptActions(
  promptId: number | null,
  prompt: PromptResponseDto | null,
  setPrompt: (prompt: PromptResponseDto | null) => void
) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  // 좋아요 토글
  const toggleLike = async () => {
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
  };

  // 북마크 토글 (API가 없으면 로컬 상태만 관리)
  const toggleBookmark = async () => {
    // TODO: 북마크 API가 구현되면 연결
    setBookmarked(!bookmarked);
  };

  // 복사하기
  const handleCopy = () => {
    if (!prompt) return;
    
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    liked,
    bookmarked,
    copied,
    toggleLike,
    toggleBookmark,
    handleCopy,
  };
}

