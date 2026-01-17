import { NotificationHeader } from './NotificationHeader';
import { NotificationList } from './NotificationList';
import { NotificationLoadingState } from './NotificationLoadingState';
import { NotificationEmptyState } from './NotificationEmptyState';
import { NotificationErrorAlert } from './NotificationErrorAlert';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationView() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
  } = useNotifications();

  return (
    <div className="min-h-screen bg-neutral-50">
      <NotificationHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && <NotificationErrorAlert message={error} />}

        {isLoading ? (
          <NotificationLoadingState />
        ) : notifications.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          <NotificationList
            notifications={notifications}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onMarkAsRead={markAsRead}
            onLoadMore={loadMore}
          />
        )}
      </main>
    </div>
  );
}

