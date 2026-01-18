import type { FollowStatus } from '@/features/follow/types/follow.types';
import { CheckingState } from './CheckingState';
import { NoneStateButtons } from './NoneStateButtons';
import { PendingStateButtons } from './PendingStateButtons';
import { FollowingStateButtons } from './FollowingStateButtons';
import { BlockedStateButtons } from './BlockedStateButtons';

interface FollowActionButtonsProps {
  followStatus: FollowStatus | null;
  actionType: 'follow' | 'follower' | null;
  isLoading: boolean;
  isChecking: boolean;
  onRequestFollow: () => void;
  onAcceptFollow: () => void;
  onRejectFollow: () => void;
  onUnfollow: () => void;
  onBlock: () => void;
  onUnblock: () => void;
}

export function FollowActionButtons({
  followStatus,
  actionType,
  isLoading,
  isChecking,
  onRequestFollow,
  onAcceptFollow,
  onRejectFollow,
  onUnfollow,
  onBlock,
  onUnblock,
}: FollowActionButtonsProps) {
  if (isChecking) {
    return <CheckingState />;
  }

  if (!followStatus) {
    return (
      <NoneStateButtons
        actionType={actionType}
        isLoading={isLoading}
        onRequestFollow={onRequestFollow}
      />
    );
  }

  switch (followStatus) {
    case 'PENDING':
      return (
        <PendingStateButtons
          actionType={actionType}
          isLoading={isLoading}
          onAcceptFollow={onAcceptFollow}
          onRejectFollow={onRejectFollow}
          onUnfollow={onUnfollow}
          onBlock={onBlock}
        />
      );

    case 'FOLLOWING':
      return (
        <FollowingStateButtons
          actionType={actionType}
          isLoading={isLoading}
          onUnfollow={onUnfollow}
          onBlock={onBlock}
        />
      );

    case 'BLOCKED':
      return (
        <BlockedStateButtons
          isLoading={isLoading}
          onUnblock={onUnblock}
        />
      );

    default:
      return null;
  }
}

