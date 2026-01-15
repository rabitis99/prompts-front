import { useState } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, CheckCircle, X } from 'lucide-react';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'like',
      message: '김개발님이 당신의 프롬프트를 좋아합니다',
      timestamp: '2분 전',
      read: false,
      link: '/prompts/123',
    },
    {
      id: 2,
      type: 'comment',
      message: '박디자인님이 댓글을 남겼습니다: "정말 유용한 프롬프트네요!"',
      timestamp: '1시간 전',
      read: false,
      link: '/prompts/456',
    },
    {
      id: 3,
      type: 'follow',
      message: '이기획님이 당신을 팔로우하기 시작했습니다',
      timestamp: '3시간 전',
      read: true,
      link: '/users/789',
    },
    {
      id: 4,
      type: 'like',
      message: '최학생님 외 5명이 당신의 프롬프트를 좋아합니다',
      timestamp: '5시간 전',
      read: true,
      link: '/prompts/123',
    },
    {
      id: 5,
      type: 'system',
      message: '새로운 기능이 추가되었습니다. 확인해보세요!',
      timestamp: '1일 전',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-violet-500" />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-neutral-900">알림</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              모두 읽음 처리
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              알림이 없습니다
            </h3>
            <p className="text-sm text-neutral-500">
              새로운 알림이 오면 여기에 표시됩니다
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-all ${
                  !notification.read ? 'bg-violet-50/50 border-violet-200' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        !notification.read
                          ? 'font-semibold text-neutral-900'
                          : 'text-neutral-700'
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {notification.timestamp}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        aria-label="읽음 처리"
                      >
                        <CheckCircle className="w-4 h-4 text-neutral-400 hover:text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                      aria-label="삭제"
                    >
                      <X className="w-4 h-4 text-neutral-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

