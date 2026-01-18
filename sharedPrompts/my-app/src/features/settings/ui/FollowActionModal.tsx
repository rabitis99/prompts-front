import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useFollowActions } from '@/features/follow/hooks/useFollowActions';
import { FollowActionButtons } from './components/FollowActionButtons';
import type { UserResponseDto } from '@/features/auth/types/user';

interface FollowActionModalProps {
  isOpen: boolean;
  user: UserResponseDto | null;
  actionType: 'follow' | 'follower' | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FollowActionModal({
  isOpen,
  user,
  actionType,
  onClose,
  onSuccess,
}: FollowActionModalProps) {
  const {
    followStatus,
    isLoading,
    isChecking,
    error,
    checkFollowStatus,
    requestFollow,
    acceptFollow,
    rejectFollow,
    unfollow,
    block,
    unblock,
    setError,
  } = useFollowActions({
    userId: user?.id ?? null,
    actionType,
    onSuccess: () => {
      // 액션 성공 후 상태를 다시 확인하여 최신 상태 반영
      if (user) {
        setTimeout(() => {
          checkFollowStatus();
        }, 300);
      }
      onSuccess?.();
    },
  });

  useEffect(() => {
    if (isOpen && user) {
      checkFollowStatus();
    }
  }, [isOpen, user, checkFollowStatus]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">팔로우 관리</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* 사용자 정보 */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-neutral-50 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            {user.nickname[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-neutral-900 truncate">{user.nickname}</div>
            {user.job && <div className="text-sm text-neutral-500 truncate">{user.job}</div>}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* 액션 버튼 */}
        <FollowActionButtons
          followStatus={followStatus}
          actionType={actionType}
          isLoading={isLoading}
          isChecking={isChecking}
          onRequestFollow={requestFollow}
          onAcceptFollow={acceptFollow}
          onRejectFollow={rejectFollow}
          onUnfollow={unfollow}
          onBlock={block}
          onUnblock={unblock}
        />
      </div>
    </div>
  );
}
