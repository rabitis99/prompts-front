import { LogOut, Loader2 } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  isLoggingOut: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({
  isOpen,
  isLoggingOut,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-6 h-6 text-neutral-600" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 text-center mb-2">
          로그아웃
        </h3>
        <p className="text-sm text-neutral-500 text-center mb-6">
          정말 로그아웃 하시겠습니까?
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            disabled={isLoggingOut}
            className="flex-1 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex-1 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                처리 중...
              </>
            ) : (
              '로그아웃'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

