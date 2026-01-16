import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteUserModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteUserModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 text-center mb-2">
          정말 탈퇴하시겠습니까?
        </h3>
        <p className="text-sm text-neutral-500 text-center mb-6">
          모든 데이터가 영구적으로 삭제됩니다.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            disabled={isDeleting}
            className="flex-1 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                처리 중...
              </>
            ) : (
              '탈퇴하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

