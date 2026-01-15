import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';
import { PROMPT_CATEGORY_DISPLAY_NAMES } from '@/features/prompt/types/prompt.types';

interface RelatedPromptsProps {
  relatedPrompts: PromptResponseDto[];
}

export function RelatedPrompts({ relatedPrompts }: RelatedPromptsProps) {
  if (relatedPrompts.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        관련 프롬프트
      </h3>
      <div className="space-y-3">
        {relatedPrompts.map((p) => (
          <Link
            key={p.id}
            to={`/prompts/${p.id}`}
            className="block p-4 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-200 hover:shadow-md"
          >
            <h4 className="font-semibold text-slate-900 text-sm mb-2 line-clamp-2 leading-snug">
              {p.title}
            </h4>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
                {PROMPT_CATEGORY_DISPLAY_NAMES[p.prompt_category] || p.prompt_category}
              </span>
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <Heart className="w-3 h-3" />
                {p.like_count}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

