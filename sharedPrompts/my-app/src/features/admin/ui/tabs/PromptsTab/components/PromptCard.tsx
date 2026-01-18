import { Trash2, Eye, EyeOff } from 'lucide-react';
import type { AdminPromptResponseDto } from '../../../../types/admin.types';

interface PromptCardProps {
  prompt: AdminPromptResponseDto;
  onDelete: (promptId: number) => void;
  onToggleVisibility: (promptId: number, isPublic: boolean) => void;
}

export function PromptCard({ prompt, onDelete, onToggleVisibility }: PromptCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-neutral-900">{prompt.title}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                prompt.is_public
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {prompt.is_public ? '공개' : '비공개'}
            </span>
          </div>
          <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{prompt.description}</p>
          <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
            <span>작성자: {prompt.user_response_dto?.nickname || '알 수 없음'}</span>
            <span>•</span>
            <span>조회: {prompt.view_count}</span>
            <span>•</span>
            <span>좋아요: {prompt.like_count}</span>
            <span>•</span>
            <span>댓글: {prompt.comment_count}</span>
            {prompt.reports_count && prompt.reports_count > 0 && (
              <>
                <span>•</span>
                <span className="text-red-600">신고: {prompt.reports_count}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-neutral-200">
        <button
          onClick={() => onToggleVisibility(prompt.id, prompt.is_public)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
            prompt.is_public
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {prompt.is_public ? (
            <>
              <EyeOff className="w-3 h-3" />
              비공개로 전환
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              공개로 전환
            </>
          )}
        </button>
        <button
          onClick={() => onDelete(prompt.id)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          삭제
        </button>
      </div>
    </div>
  );
}

