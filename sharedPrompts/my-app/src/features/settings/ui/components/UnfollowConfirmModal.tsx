import { useEffect } from 'react';
import { Loader2, UserMinus } from 'lucide-react';

interface UnfollowConfirmModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UnfollowConfirmModal({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: UnfollowConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 animate-in fade-in"
      onClick={() => {
        if (!isLoading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unfollow-confirm-title"
      aria-describedby="unfollow-confirm-description"
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <UserMinus className="w-6 h-6 text-neutral-600" />
        </div>
        <h3
          id="unfollow-confirm-title"
          className="text-lg font-semibold text-neutral-900 text-center mb-2"
        >
          팔로우를 취소하시겠습니까?
        </h3>
        <p
          id="unfollow-confirm-description"
          className="text-sm text-neutral-500 text-center mb-6"
        >
          이 사용자의 추가 프롬프트를 팔로우할 수 없게 됩니다.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                처리 중...
              </>
            ) : (
              '언팔로우'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


