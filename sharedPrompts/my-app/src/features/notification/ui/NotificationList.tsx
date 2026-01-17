import { Loader2 } from 'lucide-react';
import type { NotificationResponseDto } from '../types/notification.types';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: NotificationResponseDto[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onMarkAsRead: (id: number) => void;
  onLoadMore: () => void;
}

export function NotificationList({
  notifications,
  hasMore,
  isLoadingMore,
  onMarkAsRead,
  onLoadMore,
}: NotificationListProps) {
  return (
    <>
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 text-sm text-violet-600 hover:text-violet-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>불러오는 중...</span>
              </>
            ) : (
              <span>더 보기</span>
            )}
          </button>
        </div>
      )}
    </>
  );
}

