import { Heart, MessageCircle, Copy, Check, ExternalLink, Clock, Eye, Sparkles } from 'lucide-react';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';
import { PROMPT_CATEGORY_DISPLAY_NAMES } from '@/features/prompt/types/prompt.types';

interface PromptDetailCardProps {
  prompt: PromptResponseDto;
  liked: boolean;
  copied: boolean;
  onToggleLike: () => void;
  onCopy: () => void;
  formatDate: (dateString: string) => string;
}

export function PromptDetailCard({
  prompt,
  liked,
  copied,
  onToggleLike,
  onCopy,
  formatDate,
}: PromptDetailCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="p-6 sm:p-8">
        {/* Meta Info */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            {PROMPT_CATEGORY_DISPLAY_NAMES[prompt.prompt_category] || prompt.prompt_category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            {prompt.view_count.toLocaleString()}
          </div>
          {prompt.created_at && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(prompt.created_at)}
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">{prompt.title}</h1>
        <p className="text-slate-600 leading-relaxed text-lg mb-6">{prompt.description}</p>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Prompt Body */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/50 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-slate-300">프롬프트</span>
            </div>
            <button
              onClick={onCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                copied
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '복사완료!' : '복사하기'}
            </button>
          </div>
          <pre className="p-6 text-sm text-slate-100 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
            {prompt.content}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 sm:px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLike}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
              liked
                ? 'bg-red-50 text-red-500 shadow-md shadow-red-100'
                : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
            {prompt.like_count}
          </button>
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <MessageCircle className="w-5 h-5" />
            <span>{prompt.comment_count}</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/30">
          <ExternalLink className="w-4 h-4" />
          AI에서 사용
        </button>
      </div>
    </div>
  );
}

