import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Copy, Check } from 'lucide-react';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';
import { PROMPT_CATEGORY_DISPLAY_NAMES } from '@/features/prompt/types/prompt.types';
import { getAvatarGradient } from '@/features/prompt/ui/utils';

interface PromptCardProps {
  prompt: PromptResponseDto;
  isLiked?: boolean;
  isCopied?: boolean;
  onToggleLike?: (promptId: number) => void;
  onCopy?: (promptId: number, content: string) => void;
  variant?: 'default' | 'compact';
  showCategoryBadge?: boolean;
}

function PromptCardComponent({
  prompt,
  isLiked = false,
  isCopied = false,
  onToggleLike,
  onCopy,
  variant = 'default',
  showCategoryBadge = true,
}: PromptCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/prompts/${prompt.id}`);
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(prompt.id, prompt.content);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleLike) {
      onToggleLike(prompt.id);
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (prompt.user_response_dto?.id) {
      navigate(`/users/${prompt.user_response_dto.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const isCompact = variant === 'compact';
  const categoryDisplayName = PROMPT_CATEGORY_DISPLAY_NAMES[prompt.prompt_category] || prompt.prompt_category;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`bg-white border border-slate-200 rounded-xl p-6 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer ${
        isCompact ? 'p-4' : ''
      }`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      {/* Domain Badge */}
      {showCategoryBadge && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-semibold rounded-lg border border-violet-100">
            {categoryDisplayName}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className={`font-bold text-slate-900 mb-3 leading-tight ${isCompact ? 'text-base' : 'text-lg'}`}>
        {prompt.title}
      </h3>

      {/* Description */}
      <p className={`text-slate-600 text-sm leading-relaxed mb-5 ${isCompact ? 'line-clamp-2' : ''}`}>
        {prompt.description}
      </p>

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap pb-5 border-b border-slate-100">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-md"
            >
              #{tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="text-xs text-slate-400">+{prompt.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-4 text-sm">
            {onToggleLike ? (
              <button
                onClick={handleLikeClick}
                className={`flex items-center gap-1.5 transition-colors ${
                  isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                <span className="text-xs font-semibold">{prompt.like_count}</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Heart className="w-4 h-4" />
                <span className="text-xs font-semibold">{prompt.like_count}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-slate-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">{prompt.comment_count}</span>
            </span>
          </div>
          
          {/* User Info */}
          {prompt.user_response_dto && (
            <button
              onClick={handleUserClick}
              className="flex items-center gap-2 ml-auto hover:opacity-80 transition-opacity flex-shrink-0"
              aria-label={`${prompt.user_response_dto.nickname} 프로필 보기`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarGradient(
                  prompt.user_response_dto.id
                )} flex items-center justify-center text-white text-xs font-bold`}
              >
                {prompt.user_response_dto.nickname?.[0] || '?'}
              </div>
              <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
                {prompt.user_response_dto.nickname}
              </span>
            </button>
          )}
        </div>
        {onCopy && (
          <button
            onClick={handleCopyClick}
            aria-label="프롬프트 복사"
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              isCopied
                ? 'bg-green-50 text-green-600'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// React.memo로 메모이제이션하여 불필요한 리렌더링 방지
export const PromptCard = React.memo(PromptCardComponent, (prevProps, nextProps) => {
  // 프롬프트 데이터가 변경되지 않았고, 좋아요/복사 상태도 동일하면 리렌더링 방지
  return (
    prevProps.prompt.id === nextProps.prompt.id &&
    prevProps.prompt.title === nextProps.prompt.title &&
    prevProps.prompt.description === nextProps.prompt.description &&
    prevProps.prompt.like_count === nextProps.prompt.like_count &&
    prevProps.prompt.comment_count === nextProps.prompt.comment_count &&
    prevProps.isLiked === nextProps.isLiked &&
    prevProps.isCopied === nextProps.isCopied &&
    prevProps.variant === nextProps.variant &&
    prevProps.showCategoryBadge === nextProps.showCategoryBadge
  );
});

PromptCard.displayName = 'PromptCard';
