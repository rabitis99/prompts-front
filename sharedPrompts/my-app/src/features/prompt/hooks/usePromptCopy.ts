import { useState } from 'react';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';

interface UsePromptCopyOptions {
  prompt: PromptResponseDto | null;
}

export function usePromptCopy({ prompt }: UsePromptCopyOptions) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!prompt) return;

    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    copied,
    handleCopy,
  };
}

