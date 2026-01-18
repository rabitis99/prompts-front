import { UserPlus } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';

interface NoneStateButtonsProps {
  actionType: 'follow' | 'follower' | null;
  isLoading: boolean;
  onRequestFollow: () => void;
}

export function NoneStateButtons({
  actionType,
  isLoading,
  onRequestFollow,
}: NoneStateButtonsProps) {
  return (
    <FollowActionButton
      onClick={onRequestFollow}
      isLoading={isLoading}
      variant="primary"
      icon={<UserPlus className="w-5 h-5" />}
    >
      팔로우 요청
    </FollowActionButton>
  );
}

