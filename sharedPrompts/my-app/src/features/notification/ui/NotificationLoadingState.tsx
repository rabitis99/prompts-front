import { Loader2 } from 'lucide-react';

export function NotificationLoadingState() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
      <Loader2 className="w-8 h-8 text-violet-500 mx-auto mb-4 animate-spin" />
      <p className="text-sm text-neutral-500">알림을 불러오는 중...</p>
    </div>
  );
}

