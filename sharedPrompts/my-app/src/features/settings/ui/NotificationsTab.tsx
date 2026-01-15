import type { NotificationSettings } from '../types/settings.types';
import { NOTIFICATION_OPTIONS } from '../constants/settings.constants';

interface NotificationsTabProps {
  notifications: NotificationSettings;
  onNotificationsChange: (notifications: NotificationSettings) => void;
}

export function NotificationsTab({
  notifications,
  onNotificationsChange,
}: NotificationsTabProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">알림 설정</h3>
      <div className="space-y-4">
        {NOTIFICATION_OPTIONS.map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors">
            <div>
              <div className="font-medium text-neutral-900">{item.label}</div>
              <div className="text-sm text-neutral-500">{item.desc}</div>
            </div>
            <button 
              onClick={() => 
                onNotificationsChange({ 
                  ...notifications, 
                  [item.key]: !notifications[item.key as keyof NotificationSettings] 
                })
              } 
              className={`w-12 h-7 rounded-full relative transition-colors ${
                notifications[item.key as keyof NotificationSettings] ? 'bg-violet-500' : 'bg-neutral-300'
              }`}
            >
              <div 
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  notifications[item.key as keyof NotificationSettings] ? 'left-6' : 'left-1'
                }`} 
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

