import { useState, useEffect } from 'react';
import { promptApi } from '@/features/prompt/api/prompt.api';
import type { PromptResponseDto, PromptCategory } from '@/features/prompt/types/prompt.types';

export function useRelatedPrompts(prompt: PromptResponseDto | null) {
  const [relatedPrompts, setRelatedPrompts] = useState<PromptResponseDto[]>([]);

  useEffect(() => {
    if (!prompt) return;

    const fetchRelatedPrompts = async () => {
      try {
        const response = await promptApi.getPrompts({
          page: 0,
          size: 3,
          prompt_category: prompt.prompt_category,
        });
        
        const related = response.data.data.content
          .filter((p) => p.id !== prompt.id)
          .slice(0, 3);
        
        setRelatedPrompts(related);
      } catch (err) {
        console.error('Failed to fetch related prompts:', err);
      }
    };

    fetchRelatedPrompts();
  }, [prompt]);

  return { relatedPrompts };
}

