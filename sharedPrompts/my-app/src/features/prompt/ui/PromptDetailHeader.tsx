import { ArrowLeft, Share2, Bookmark, BookmarkCheck, MoreHorizontal, Flag, Edit, Trash2 } from 'lucide-react';

interface PromptDetailHeaderProps {
  bookmarked: boolean;
  showMore: boolean;
  isOwner: boolean;
  onBack: () => void;
  onToggleBookmark: () => void;
  onToggleShowMore: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PromptDetailHeader({
  bookmarked,
  showMore,
  isOwner,
  onBack,
  onToggleBookmark,
  onToggleShowMore,
  onEdit,
  onDelete,
}: PromptDetailHeaderProps) {
  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">뒤로</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBookmark}
            className={`p-2.5 rounded-xl transition-all ${
              bookmarked
                ? 'bg-amber-100 text-amber-600 scale-110'
                : 'hover:bg-slate-100 text-slate-400'
            }`}
          >
            {bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
          <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={onToggleShowMore}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMore && (
              <div className="absolute right-0 top-14 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 w-48 z-50">
                {isOwner ? (
                  <>
                    <button
                      onClick={onEdit}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> 수정하기
                    </button>
                    <button
                      onClick={onDelete}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> 삭제하기
                    </button>
                  </>
                ) : (
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <Flag className="w-4 h-4" /> 신고하기
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

