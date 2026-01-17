import { Bell } from 'lucide-react';

export function NotificationEmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
      <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        알림이 없습니다
      </h3>
      <p className="text-sm text-neutral-500">
        새로운 알림이 오면 여기에 표시됩니다
      </p>
    </div>
  );
}

