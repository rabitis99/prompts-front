import { MessageCircle, Send, Heart, ChevronDown, ChevronUp, Edit, Trash2, X, Check, Flag } from 'lucide-react';
import type { CommentResponseDto } from '@/features/comment/types/comment.types';
import type { PromptResponseDto } from '@/features/prompt/types/prompt.types';

interface CommentsSectionProps {
  prompt: PromptResponseDto;
  comments: CommentResponseDto[];
  allCommentsCount: number;
  commentText: string;
  showAllComments: boolean;
  likedComments: number[];
  isSubmittingComment: boolean;
  editingCommentId: number | null;
  editingText: string;
  isUpdatingComment: boolean;
  isDeletingComment: boolean;
  formatDate: (dateString: string) => string;
  getAvatarGradient: (userId: number) => string;
  onCommentTextChange: (text: string) => void;
  onSubmitComment: () => void;
  onToggleShowAllComments: () => void;
  onToggleCommentLike: (commentId: number) => void;
  onStartEditComment: (commentId: number, currentContent: string) => void;
  onCancelEditComment: () => void;
  onSaveEditComment: (commentId: number) => void;
  onDeleteComment: (commentId: number) => void;
  onEditingTextChange: (text: string) => void;
  isCommentOwner: (commentUserId: number) => boolean;
  onReportComment?: (commentId: number) => void;
}

export function CommentsSection({
  prompt,
  comments,
  allCommentsCount,
  commentText,
  showAllComments,
  likedComments,
  isSubmittingComment,
  editingCommentId,
  editingText,
  isUpdatingComment,
  isDeletingComment,
  formatDate,
  getAvatarGradient,
  onCommentTextChange,
  onSubmitComment,
  onToggleShowAllComments,
  onToggleCommentLike,
  onStartEditComment,
  onCancelEditComment,
  onSaveEditComment,
  onDeleteComment,
  onEditingTextChange,
  isCommentOwner,
  onReportComment,
}: CommentsSectionProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-indigo-500" />
        댓글 {prompt.comment_count}개
      </h2>

      {/* Comment Input */}
      <div className="flex gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex-shrink-0 shadow-md" />
        <div className="flex-1">
          <textarea
            value={commentText}
            onChange={(e) => onCommentTextChange(e.target.value)}
            placeholder="이 프롬프트에 대한 의견을 남겨보세요..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none resize-none transition-all text-sm"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={onSubmitComment}
              disabled={!commentText.trim() || isSubmittingComment}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
              {isSubmittingComment ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            {/* Main Comment */}
            <div className="flex gap-3 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(
                  comment.user_response_dto.id
                )} flex-shrink-0 shadow-md`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-slate-900">{comment.user_response_dto.nickname}</span>
                  <span className="text-xs text-slate-400">{formatDate(comment.created_at)}</span>
                  {editingCommentId !== comment.id && (
                    <div className="flex items-center gap-2 ml-auto">
                      {isCommentOwner(comment.user_response_dto.id) ? (
                        <>
                          <button
                            onClick={() => onStartEditComment(comment.id, comment.content)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="수정"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button
                            onClick={() => onDeleteComment(comment.id)}
                            disabled={isDeletingComment}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </>
                      ) : (
                        onReportComment && (
                          <button
                            onClick={() => onReportComment(comment.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="신고"
                            aria-label="댓글 신고"
                          >
                            <Flag className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
                {editingCommentId === comment.id ? (
                  <div className="mb-3 space-y-2">
                    <textarea
                      value={editingText}
                      onChange={(e) => onEditingTextChange(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border-2 border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none text-sm"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSaveEditComment(comment.id)}
                        disabled={!editingText.trim() || isUpdatingComment}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        저장
                      </button>
                      <button
                        onClick={onCancelEditComment}
                        disabled={isUpdatingComment}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 mb-3 leading-relaxed">{comment.content}</p>
                )}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onToggleCommentLike(comment.id)}
                    disabled={editingCommentId === comment.id}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                      likedComments.includes(comment.id)
                        ? 'text-red-500'
                        : 'text-slate-400 hover:text-red-500'
                    } disabled:opacity-50`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${likedComments.includes(comment.id) ? 'fill-red-500' : ''}`}
                    />
                    {comment.like_count}
                  </button>
                  <button 
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={editingCommentId === comment.id}
                  >
                    답글 달기
                  </button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-12 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3 p-3 rounded-xl bg-slate-50">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(
                        reply.user_response_dto.id
                      )} flex-shrink-0 shadow-md`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 text-sm">
                          {reply.user_response_dto.nickname}
                        </span>
                        {reply.user_response_dto.id === prompt.user_response_dto.id && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold">
                            작성자
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{formatDate(reply.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-700">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More */}
      {allCommentsCount > 3 && (
        <button
          onClick={onToggleShowAllComments}
          className="w-full mt-6 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2 hover:bg-slate-50 rounded-xl transition-all"
        >
          {showAllComments ? (
            <>
              접기 <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              댓글 더보기 ({allCommentsCount - 3}개) <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

