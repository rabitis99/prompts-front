import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavoritePrompts } from '@/features/favorite/hooks/useFavoritePrompts';
import { PromptCard } from '@/features/prompt/ui/components/PromptCard';
import { BookmarkCheck } from 'lucide-react';
import { Pagination } from '@/shared/ui/Pagination';

const PAGE_SIZE = 20;

export function FavoritesTab() {
  const navigate = useNavigate();
  const { prompts, isLoading, error, page, totalPages, refresh, goToPage } = useFavoritePrompts({
    pageSize: PAGE_SIZE,
  });
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = async (id: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  if (isLoading && prompts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookmarkCheck className="w-7 h-7 text-neutral-300" />
          </div>
          <p className="text-sm text-neutral-500">즐겨찾기를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && prompts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-8">
        <div className="text-center py-12">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-8">
        <div className="text-center py-12">
          <BookmarkCheck className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-neutral-900 mb-2">즐겨찾기가 없습니다</h3>
          <p className="text-sm text-neutral-500 mb-6">관심있는 프롬프트를 즐겨찾기에 추가해보세요</p>
          <button
            onClick={() => navigate('/feed')}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
          >
            프롬프트 둘러보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">내 즐겨찾기</h2>
        <p className="text-sm text-neutral-500">저장한 프롬프트 목록입니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            isCopied={copiedId === prompt.id}
            onCopy={handleCopy}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={(nextPage) => goToPage(nextPage - 1)}
          />
        </div>
      )}
    </div>
  );
}

