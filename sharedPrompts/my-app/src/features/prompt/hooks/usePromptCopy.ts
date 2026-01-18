import { useState, useCallback, useRef, useEffect } from 'react';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';

interface UsePromptCopyOptions {
  prompt: PromptResponseDto | null;
}

export function usePromptCopy({ prompt }: UsePromptCopyOptions) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  }, [prompt]);

  return {
    copied,
    handleCopy,
  };
}

