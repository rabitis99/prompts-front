import { UserCheck } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';

interface BlockedStateButtonsProps {
  isLoading: boolean;
  onUnblock: () => void;
}

export function BlockedStateButtons({
  isLoading,
  onUnblock,
}: BlockedStateButtonsProps) {
  return (
    <FollowActionButton
      onClick={onUnblock}
      isLoading={isLoading}
      variant="secondary"
      icon={<UserCheck className="w-5 h-5" />}
    >
      차단 해제
    </FollowActionButton>
  );
}

