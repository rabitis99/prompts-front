import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useFollowActions } from '@/features/follow/hooks/useFollowActions';
import { FollowActionButtons } from './components/FollowActionButtons';
import { FollowRelationInfo } from './components/FollowRelationInfo';
import type { FollowUserResponseDto } from '@/features/follow/types/follow.types';
import type { FollowStatus } from '@/features/follow/types/follow.types';
import { normalizePendingDirection } from '@/features/follow/types/follow.types';

interface FollowActionModalProps {
  isOpen: boolean;
  user: FollowUserResponseDto | null;
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
  // 목록에서 받은 초기 관계 정보 사용 (N+1 방지)
  const [initialUser, setInitialUser] = useState<FollowUserResponseDto | null>(null);
  
  const {
    followStatus,
    followData,
    isLoading,
    isChecking,
    hasChecked,
    error,
    checkFollowStatus,
    requestFollow,
    acceptFollow,
    rejectFollow,
    unfollow,
    block,
    unblock,
    removeFollower,
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
      // 액션 성공 후 모달 닫기
      onClose();
    },
  });

  // 모달이 열릴 때 목록에서 받은 관계 정보를 초기 상태로 설정
  useEffect(() => {
    if (isOpen && user) {
      // 목록에서 받은 관계 정보를 초기 상태로 사용
      setInitialUser(user);
      // 최신 상태 확인 (목록 정보는 캐시될 수 있으므로)
      checkFollowStatus();
    }
  }, [isOpen, user, checkFollowStatus]);

  // API 응답의 최신 정보를 사용하여 user 정보 업데이트
  const rawPendingDirection = followData?.pending_direction ?? user?.pending_direction;
  const normalizedPendingDirection = normalizePendingDirection(rawPendingDirection);
  
  const displayUser: FollowUserResponseDto | null = user ? {
    ...user,
    follow_status: followStatus ?? user.follow_status,
    reverse_follow_status: followData?.reverse_status ?? user.reverse_follow_status,
    pending_direction: normalizedPendingDirection ?? (rawPendingDirection as any),
    is_blocked_by_me: followData?.is_blocked_by_me ?? user.is_blocked_by_me,
    is_blocked_by_target: followData?.is_blocked_by_target ?? user.is_blocked_by_target,
  } : null;

  const displayFollowStatus = followStatus ?? user?.follow_status ?? null;

  // 디버깅: displayUser 정보 확인
  console.log('[FollowActionModal] displayUser 정보:', {
    userId: user?.id,
    actionType,
    originalUser: user,
    followData,
    rawPendingDirection,
    normalizedPendingDirection,
    displayUser,
    displayFollowStatus,
    hasIncomingRequest: displayUser?.reverse_follow_status === 'PENDING' && normalizedPendingDirection === 'TO_ME',
    hasOutgoingRequest: displayFollowStatus === 'PENDING' && normalizedPendingDirection === 'FROM_ME',
  });

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
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

        {/* 관계 정보 표시 */}
        {displayUser && (
          <FollowRelationInfo
            user={displayUser}
            actionType={actionType}
            followStatus={displayFollowStatus}
          />
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* 액션 버튼 */}
        {displayUser && (
          <FollowActionButtons
            followStatus={displayFollowStatus}
            actionType={actionType}
            isLoading={isLoading}
            isChecking={isChecking}
            hasChecked={hasChecked}
            user={displayUser}
            onRequestFollow={requestFollow}
            onAcceptFollow={acceptFollow}
            onRejectFollow={rejectFollow}
            onUnfollow={unfollow}
            onBlock={block}
            onUnblock={unblock}
            onRemoveFollower={removeFollower}
          />
        )}
      </div>
    </div>
  );
}
