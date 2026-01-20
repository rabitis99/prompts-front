import { useState } from 'react';
import { X, Ban, Loader2, Users } from 'lucide-react';
import { useFollowList } from '@/features/follow/hooks/useFollowList';
import { followApi } from '@/features/follow/api/follow.api';
import { FollowActionButton } from './FollowActionButton';
import { ICON_SIZE, FOLLOW_BUTTON_TEXT } from './constants';
import type { FollowUserResponseDto } from '@/features/follow/types/follow.types';

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BlockedUsersModal({ isOpen, onClose, onSuccess }: BlockedUsersModalProps) {
  const blockedUsers = useFollowList({
    type: 'followers',
    status: 'BLOCKED',
    autoLoad: isOpen,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] shadow-xl animate-in zoom-in-95 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">차단된 사용자 관리</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {blockedUsers.isLoading && blockedUsers.users.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-4" />
              <p className="text-sm text-neutral-500">불러오는 중...</p>
            </div>
          ) : blockedUsers.users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-neutral-900 mb-2">
                차단된 사용자가 없습니다
              </h3>
              <p className="text-sm text-neutral-500">
                차단한 사용자가 없습니다
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {blockedUsers.users.map((user) => (
                  <BlockedUserItem
                    key={user.id}
                    user={user}
                    onUnblock={() => {
                      blockedUsers.refresh();
                      onSuccess?.();
                    }}
                    isLoading={blockedUsers.isLoading}
                  />
                ))}
              </div>
              {/* 더 보기 버튼 */}
              {blockedUsers.hasMore && (
                <div className="text-center pt-4 mt-4 border-t border-neutral-100">
                  <button
                    onClick={blockedUsers.loadMore}
                    disabled={blockedUsers.isLoading}
                    className="px-6 py-2 text-sm font-medium text-violet-600 hover:text-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {blockedUsers.isLoading ? '불러오는 중...' : '더 보기'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface BlockedUserItemProps {
  user: FollowUserResponseDto;
  onUnblock: () => void;
  isLoading: boolean;
}

function BlockedUserItem({ user, onUnblock, isLoading }: BlockedUserItemProps) {
  const [isUnblocking, setIsUnblocking] = useState(false);

  const handleUnblock = async () => {
    setIsUnblocking(true);
    try {
      await followApi.unblockFollow(user.id);
      setIsUnblocking(false);
      onUnblock();
    } catch (error) {
      setIsUnblocking(false);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  // 디버깅을 위한 로그
  console.log('BlockedUserItem user data:', user);

  return (
    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {user.nickname?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-neutral-900 truncate">
            {user.nickname || '알 수 없음'}
          </div>
          {user.email && (
            <div className="text-sm text-neutral-600 truncate mt-0.5">{user.email}</div>
          )}
          {(user.job || user.age) && (
            <div className="text-xs text-neutral-500 truncate mt-1">
              {user.job && <span>{user.job}</span>}
              {user.job && user.age && <span className="mx-1">•</span>}
              {user.age && <span>{user.age}세</span>}
            </div>
          )}
        </div>
      </div>
      <FollowActionButton
        onClick={handleUnblock}
        isLoading={isUnblocking || isLoading}
        variant="secondary"
        icon={<Ban className={ICON_SIZE.MEDIUM} />}
      >
        {FOLLOW_BUTTON_TEXT.UNBLOCK}
      </FollowActionButton>
    </div>
  );
}

