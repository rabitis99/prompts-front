import { useState, useEffect } from 'react';
import { promptApi } from '@/features/prompt/api/prompt.api';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';

export function usePromptDetail(promptId: number | null) {
  const [prompt, setPrompt] = useState<PromptResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!promptId) {
      setError(new Error('프롬프트 ID가 없습니다.'));
      setIsLoading(false);
      return;
    }

    const fetchPromptDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await promptApi.getPromptDetail(promptId);
        const promptData = response.data.data;
        setPrompt(promptData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('프롬프트를 불러오는데 실패했습니다.'));
        console.error('Failed to fetch prompt detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromptDetail();
  }, [promptId]);

  return {
    prompt,
    setPrompt,
    isLoading,
    error,
  };
}

