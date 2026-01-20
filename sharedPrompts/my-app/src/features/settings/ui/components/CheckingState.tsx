import { Loader2 } from 'lucide-react';

export function CheckingState() {
  return (
    <div
      className="flex items-center justify-center py-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="w-6 h-6 animate-spin text-neutral-400" aria-hidden="true" />
      <span className="ml-2 text-sm text-neutral-500">팔로우 상태 확인 중...</span>
    </div>
  );
}

