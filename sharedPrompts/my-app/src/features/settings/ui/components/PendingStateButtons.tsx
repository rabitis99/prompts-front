import { UserCheck, UserX, Loader2, Ban } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';

interface PendingStateButtonsProps {
  actionType: 'follow' | 'follower' | null;
  isLoading: boolean;
  onAcceptFollow: () => void;
  onRejectFollow: () => void;
  onUnfollow: () => void;
  onBlock: () => void;
}

export function PendingStateButtons({
  actionType,
  isLoading,
  onAcceptFollow,
  onRejectFollow,
  onUnfollow,
  onBlock,
}: PendingStateButtonsProps) {
  if (actionType === 'follower') {
    // 팔로워 목록: 상대방이 나에게 팔로우 요청을 보냄 (PENDING 상태)
    // 수락/거절/차단 가능
    // 주의: 거절은 PENDING 상태일 때만 가능
    return (
      <div className="flex gap-3">
        <FollowActionButton
          onClick={onAcceptFollow}
          isLoading={isLoading}
          variant="primary"
          icon={<UserCheck className="w-5 h-5" />}
        >
          팔로우 수락
        </FollowActionButton>
        <FollowActionButton
          onClick={onRejectFollow}
          isLoading={isLoading}
          variant="secondary"
          icon={<UserX className="w-5 h-5" />}
        >
          거절
        </FollowActionButton>
        <FollowActionButton
          onClick={onBlock}
          isLoading={isLoading}
          variant="danger"
          icon={<Ban className="w-5 h-5" />}
        >
          차단
        </FollowActionButton>
      </div>
    );
  }

  // 팔로잉 목록: 내가 상대방에게 팔로우 요청을 보냄
  // 대기 중 상태, 요청 취소만 가능
  return (
    <div className="flex gap-3 items-center">
      <div className="flex-1 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-medium flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        대기 중
      </div>
      <FollowActionButton
        onClick={onUnfollow}
        isLoading={isLoading}
        variant="secondary"
        icon={<UserX className="w-5 h-5" />}
      >
        요청 취소
      </FollowActionButton>
    </div>
  );
}

