import type { FollowStatus } from '@/features/follow/types/follow.types';
import { NoneStateButtons } from './NoneStateButtons';
import { PendingStateButtons } from './PendingStateButtons';
import { FollowingStateButtons } from './FollowingStateButtons';
import { BlockedStateButtons } from './BlockedStateButtons';
import { RejectedStateButtons } from './RejectedStateButtons';
import { CancelledStateButtons } from './CancelledStateButtons';
import type { FollowActionType } from './types';

interface GeneralStatusButtonsProps {
  followStatus: FollowStatus | null;
  actionType: FollowActionType;
  isLoading: boolean;
  onRequestFollow: () => void;
  onAcceptFollow?: () => void;
  onRejectFollow?: () => void;
  onUnfollow: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
}

/**
 * 일반적인 상태별 버튼 렌더링 컴포넌트
 * 
 * 팔로잉 탭이나 기타 일반적인 컨텍스트에서 사용되는 버튼 렌더링 로직입니다.
 * 팔로워 탭이 아닌 경우에 사용됩니다.
 */
export function GeneralStatusButtons({
  followStatus,
  actionType,
  isLoading,
  onRequestFollow,
  onAcceptFollow,
  onRejectFollow,
  onUnfollow,
  onBlock,
  onUnblock,
}: GeneralStatusButtonsProps) {
  // null 상태: 팔로우 관계 없음 → 팔로우 요청 버튼 표시
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
      // actionType='follow' 또는 null인 경우: 내가 보낸 요청 → 요청 취소/차단 버튼 표시
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
          onRequestFollow={onRequestFollow}
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

