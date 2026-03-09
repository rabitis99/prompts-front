import { useState, useEffect } from 'react';
import { promptApi } from '@/features/prompt/api/prompt.api';
import type { PromptDetailResponse, PromptSummaryResponse } from '@/features/prompt/types/prompt.types';

export function useRelatedPrompts(prompt: PromptDetailResponse | null) {
  const [relatedPrompts, setRelatedPrompts] = useState<PromptSummaryResponse[]>([]);

  useEffect(() => {
    if (!prompt?.prompt_category || prompt?.id == null) {
      setRelatedPrompts([]);
      return;
    }

    let cancelled = false;

    const fetchRelatedPrompts = async () => {
      try {
        const response = await promptApi.getPrompts({
          page: 0,
          size: 4,
          prompt_category: prompt.prompt_category,
        });
        
        const related = response.data.data.content
          .filter((p) => p.id !== prompt.id)
          .slice(0, 3);
        
        if (!cancelled) {
          setRelatedPrompts(related);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch related prompts:', err);
        }
      }
    };

    fetchRelatedPrompts();
    return () => {
      cancelled = true;
    };
  }, [prompt?.prompt_category, prompt?.id]);

  return { relatedPrompts };
}

