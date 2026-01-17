import { Bell, Heart, MessageCircle, CheckCircle } from 'lucide-react';
import type { NotificationResponseDto } from '../types/notification.types';
import { formatRelativeTime } from '@/shared/utils/date';

interface NotificationItemProps {
  notification: NotificationResponseDto;
  onMarkAsRead: (id: number) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const getIcon = (type: NotificationResponseDto['type']) => {
    switch (type) {
      case 'LIKE':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'COMMENT':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-violet-500" />;
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-all ${
        !notification.is_read ? 'bg-violet-50/50 border-violet-200' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm ${
              !notification.is_read
                ? 'font-semibold text-neutral-900'
                : 'text-neutral-700'
            }`}
          >
            {notification.message}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {formatRelativeTime(notification.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!notification.is_read && (
            <button
              type="button"
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="읽음 처리"
            >
              <CheckCircle className="w-4 h-4 text-neutral-400 hover:text-green-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

