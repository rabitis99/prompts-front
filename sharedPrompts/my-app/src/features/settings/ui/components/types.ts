import type { FollowStatus, FollowUserResponseDto } from '@/features/follow/types/follow.types';

export type FollowActionType = 'follow' | 'follower' | null;

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface BaseButtonStateProps {
  isLoading: boolean;
}

export interface FollowActionHandlers {
  onRequestFollow: () => void;
  onAcceptFollow: () => void;
  onRejectFollow: () => void;
  onUnfollow: () => void;
  onBlock: () => void;
  onUnblock: () => void;
  onRemoveFollower?: () => void;
}

export interface FollowActionButtonsProps extends FollowActionHandlers {
  followStatus: FollowStatus | null;
  actionType: FollowActionType;
  isLoading: boolean;
  isChecking: boolean;
  hasChecked: boolean;
  user?: FollowUserResponseDto | null;
}

export interface PendingStateButtonsProps extends BaseButtonStateProps {
  actionType: FollowActionType;
  onAcceptFollow?: () => void;
  onRejectFollow?: () => void;
  onUnfollow?: () => void;
  onBlock?: () => void;
}

export interface FollowingStateButtonsProps extends BaseButtonStateProps {
  actionType: FollowActionType;
  onUnfollow?: () => void;
  onRequestFollow?: () => void;
  onBlock?: () => void;
  onRemoveFollower?: () => void;
}

export interface BlockedStateButtonsProps extends BaseButtonStateProps {
  onUnblock?: () => void;
}

export interface RetryRequestButtonsProps extends BaseButtonStateProps {
  onRequestFollow: () => void;
}

export interface NoneStateButtonsProps extends BaseButtonStateProps {
  actionType: FollowActionType;
  onRequestFollow: () => void;
}


