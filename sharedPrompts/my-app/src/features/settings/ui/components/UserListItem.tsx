import { UserPlus } from 'lucide-react';
import type { FollowUserResponseDto } from '@/features/follow/types/follow.types';

interface UserListItemProps {
  user: FollowUserResponseDto;
  onClick?: () => void;
}

export function UserListItem({ user, onClick }: UserListItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors text-left"
      type="button"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
        {user.nickname?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-neutral-900 truncate">{user.nickname}</div>
        {user.job && <div className="text-sm text-neutral-500 truncate">{user.job}</div>}
      </div>
      <UserPlus className="w-5 h-5 text-neutral-400" />
    </button>
  );
}

