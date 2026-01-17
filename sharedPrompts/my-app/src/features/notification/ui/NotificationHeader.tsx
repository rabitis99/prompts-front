interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export function NotificationHeader({
  unreadCount,
  onMarkAllAsRead,
}: NotificationHeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">알림</h1>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            모두 읽음 처리
          </button>
        )}
      </div>
    </header>
  );
}

