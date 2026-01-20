import { useNavigate } from 'react-router-dom';
import type { MouseEvent } from 'react';
import { Bell, Heart, MessageCircle, CheckCircle, UserPlus, Star } from 'lucide-react';
import type { NotificationResponseDto } from '../types/notification.types';
import { formatRelativeTime } from '@/shared/utils/date';

interface NotificationItemProps {
  notification: NotificationResponseDto;
  onMarkAsRead: (id: number) => void;
  onClick?: (notification: NotificationResponseDto) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const navigate = useNavigate();

  const getIcon = (type: NotificationResponseDto['type']) => {
    switch (type) {
      case 'LIKE':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'COMMENT':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'FAVORITE':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'FOLLOW':
        return <UserPlus className="w-5 h-5 text-violet-500" />;
      default:
        return <Bell className="w-5 h-5 text-violet-500" />;
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    if (onClick) {
      onClick(notification);
      return;
    }

    // 기본 라우팅 로직
    switch (notification.type) {
      case 'LIKE':
      case 'COMMENT':
      case 'FAVORITE':
        // 프롬프트 상세 페이지로 이동
        navigate(`/prompts/${notification.related_entity_id}`);
        break;
      case 'FOLLOW':
        // 설정 페이지의 팔로우 탭으로 이동
        navigate('/settings?tab=follows');
        break;
      default:
        break;
    }
  };

  const handleMarkAsReadClick = (e: MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-all cursor-pointer ${
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
              onClick={handleMarkAsReadClick}
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

