/**
 * 프롬프트 좋아요 상태 관리 Hook
 * 
 * 기능:
 * - 배치 요청으로 좋아요 상태 확인
 * - 캐싱을 통한 API 호출 최소화
 * - 중복 요청 방지
 */

import { useState, useCallback } from 'react';
import { likeApi } from '@/features/like/api/like.api';
import type { PromptSummaryResponse } from '@/features/prompt/types/prompt.types';
import { rateLimitTracker } from '@/shared/utils/rateLimit';
import { apiCache } from '@/shared/utils/cache';
import { batchRequests } from '@/shared/utils/batchRequest';

interface UsePromptLikesOptions {
  isAuthenticated: boolean;
}

interface UsePromptLikesReturn {
  likedIds: number[];
  setLikedIds: React.Dispatch<React.SetStateAction<number[]>>;
  checkPromptsLikes: (
    prompts: PromptSummaryResponse[],
    append: boolean,
    abortSignal?: AbortSignal
  ) => Promise<void>;
  toggleLike: (id: number) => Promise<{ isLiked: boolean; like_count: number } | null>;
  isTogglingLike: (id: number) => boolean;
}

/**
 * 프롬프트 좋아요 상태를 관리하는 Hook
 */
export function usePromptLikes(
  options: UsePromptLikesOptions
): UsePromptLikesReturn {
  const { isAuthenticated } = options;
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [togglingLikeIds, setTogglingLikeIds] = useState<Set<number>>(new Set());

  /**
   * 여러 프롬프트의 좋아요 상태를 배치로 확인
   */
  const checkPromptsLikes = useCallback(
    async (
      promptsToCheck: PromptSummaryResponse[],
      append: boolean,
      abortSignal?: AbortSignal
    ) => {
      // 인증되지 않은 사용자는 좋아요 상태 확인 생략
      if (!isAuthenticated || promptsToCheck.length === 0) {
        if (!append) {
          setLikedIds([]);
        }
        return;
      }

      try {
        // 캐시에서 먼저 확인
        const cachedLikedIds: number[] = [];
        const uncachedPrompts: PromptSummaryResponse[] = [];

        for (const prompt of promptsToCheck) {
          const cached = apiCache.get<{ data: { data: { isLiked: boolean } } }>(
            'GET',
            `/prompts/${prompt.id}/likes`
          );

          // 캐시가 존재하면 (isLiked가 true든 false든) 캐시 히트로 처리
          if (cached?.data?.data !== undefined) {
            if (cached.data.data.isLiked) {
              cachedLikedIds.push(prompt.id);
            }
            // isLiked가 false인 경우도 캐시 히트이므로 uncachedPrompts에 추가하지 않음
          } else {
            uncachedPrompts.push(prompt);
          }
        }

        // 캐시된 결과 먼저 반영
        if (cachedLikedIds.length > 0) {
          if (append) {
            setLikedIds((prev) => [...new Set([...prev, ...cachedLikedIds])]);
          } else {
            setLikedIds(cachedLikedIds);
          }
        }

        // 캐시되지 않은 프롬프트만 API 호출
        if (uncachedPrompts.length === 0) {
          return;
        }

        // 배치 요청으로 처리 (최대 5개씩, 100ms 딜레이)
        const requests = uncachedPrompts.map((prompt) => () => {
          // 취소 신호 확인
          if (abortSignal?.aborted) {
            return Promise.reject(new Error('Request aborted'));
          }
          
          // 중복 요청 방지
          const requestKey = rateLimitTracker.createRequestKey(
            'GET',
            `/prompts/${prompt.id}/likes`
          );

          return rateLimitTracker.getOrCreateRequest(requestKey, () =>
            likeApi.checkPromptLike(prompt.id).then((res) => ({
              promptId: prompt.id,
              isLiked: res.data.data.isLiked,
            }))
          );
        });

        const results = await batchRequests(requests, {
          maxConcurrent: 5, // 동시에 최대 5개
          delayBetweenBatches: 100, // 배치 간 100ms 딜레이
        });

        // 요청이 취소되었는지 확인
        if (abortSignal?.aborted) {
          return;
        }

        const newLikedIds = results
          .filter((result) => result.isLiked)
          .map((result) => result.promptId);

        if (append) {
          setLikedIds((prev) => [...new Set([...prev, ...newLikedIds])]);
        } else {
          setLikedIds([...cachedLikedIds, ...newLikedIds]);
        }
      } catch (err) {
        // Rate limit 에러는 무시하고 계속 진행
        if (err instanceof Error && err.message.includes('Rate limit')) {
          console.warn('Rate limit reached while checking likes. Skipping like status check.');
        } else {
          console.error('Failed to check prompts like statuses:', err);
        }
        if (!append) {
          setLikedIds([]);
        }
      }
    },
    [isAuthenticated]
  );

  /**
   * 좋아요 토글
   */
  const toggleLike = useCallback(async (id: number): Promise<{ isLiked: boolean; like_count: number } | null> => {
    // 현재 토글 중인지 확인을 위해 함수형 업데이트 사용
    let isCurrentlyToggling = false;
    setTogglingLikeIds((prev) => {
      isCurrentlyToggling = prev.has(id);
      return prev;
    });
    if (isCurrentlyToggling) return null;

    setTogglingLikeIds((prev) => new Set(prev).add(id));

    try {
      // 현재 좋아요 상태 확인을 위해 함수형 업데이트 사용
      let isCurrentlyLiked = false;
      setLikedIds((prev) => {
        isCurrentlyLiked = prev.includes(id);
        return prev;
      });

      // 좋아요 상태 변경 시 캐시 무효화
      apiCache.invalidate('GET', `/prompts/${id}/likes`);

      const response = isCurrentlyLiked
        ? await likeApi.unlikePrompt(id)
        : await likeApi.likePrompt(id);

      const { isLiked } = response.data.data;

      // 좋아요 아이디 목록 동기화
      setLikedIds((prev) =>
        isLiked
          ? prev.includes(id)
            ? prev
            : [...prev, id]
          : prev.filter((i) => i !== id)
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to toggle like:', error);
      throw error;
    } finally {
      setTogglingLikeIds((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    }
  }, []);

  const isTogglingLike = useCallback(
    (id: number) => togglingLikeIds.has(id),
    [togglingLikeIds]
  );

  return {
    likedIds,
    setLikedIds,
    checkPromptsLikes,
    toggleLike,
    isTogglingLike,
  };
}

