import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  label?: string;
}

export function LoadMoreButton({
  onClick,
  isLoading = false,
  hasMore = true,
  label = '더 보기',
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className="text-center pt-4">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin inline" />
        ) : (
          label
        )}
      </button>
    </div>
  );
}

