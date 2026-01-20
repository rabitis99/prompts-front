import type { FollowStatus } from '@/features/follow/types/follow.types';
import { CheckingState } from './CheckingState';
import { NoneStateButtons } from './NoneStateButtons';
import { PendingStateButtons } from './PendingStateButtons';
import { FollowingStateButtons } from './FollowingStateButtons';
import { BlockedStateButtons } from './BlockedStateButtons';
import { RejectedStateButtons } from './RejectedStateButtons';
import { CancelledStateButtons } from './CancelledStateButtons';
import type { FollowActionButtonsProps } from './types';

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

  // followStatus가 null인 경우 (에러 또는 초기 상태) - 기본 팔로우 요청 버튼 표시
  if (!followStatus) {
    return (
      <NoneStateButtons
        actionType={actionType}
        isLoading={isLoading}
        onRequestFollow={onRequestFollow}
      />
    );
  }

  return renderStatusButtons(
    followStatus,
    {
      actionType,
      isLoading,
      onRequestFollow,
      onAcceptFollow,
      onRejectFollow,
      onUnfollow,
      onBlock,
      onUnblock,
    }
  );
}

function renderStatusButtons(
  status: FollowStatus,
  handlers: Omit<FollowActionButtonsProps, 'followStatus' | 'isChecking'>
) {
  const { actionType, isLoading, onRequestFollow, onAcceptFollow, onRejectFollow, onUnfollow, onBlock, onUnblock } = handlers;

  switch (status) {
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

    case 'REJECTED':
      return (
        <RejectedStateButtons
          isLoading={isLoading}
          onRequestFollow={onRequestFollow}
        />
      );

    case 'CANCELLED':
      return (
        <CancelledStateButtons
          isLoading={isLoading}
          onRequestFollow={onRequestFollow}
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

