import { UserMinus, Ban } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';

interface FollowingStateButtonsProps {
  actionType: 'follow' | 'follower' | null;
  isLoading: boolean;
  onUnfollow: () => void;
  onBlock: () => void;
}

export function FollowingStateButtons({
  actionType,
  isLoading,
  onUnfollow,
  onBlock,
}: FollowingStateButtonsProps) {
  // FOLLOWING 상태: 팔로우 확정 상태
  // 팔로워 목록이든 팔로잉 목록이든 동일하게 언팔로우/차단 가능
  return (
    <div className="flex gap-3">
      <FollowActionButton
        onClick={onUnfollow}
        isLoading={isLoading}
        variant="secondary"
        icon={<UserMinus className="w-5 h-5" />}
      >
        언팔로우
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

