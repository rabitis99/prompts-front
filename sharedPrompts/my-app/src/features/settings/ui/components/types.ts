import type { FollowStatus } from '@/features/follow/types/follow.types';

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
}

export interface FollowActionButtonsProps extends FollowActionHandlers {
  followStatus: FollowStatus | null;
  actionType: FollowActionType;
  isLoading: boolean;
  isChecking: boolean;
}

export interface PendingStateButtonsProps extends BaseButtonStateProps {
  actionType: FollowActionType;
  onAcceptFollow?: () => void;
  onRejectFollow?: () => void;
  onUnfollow: () => void;
  onBlock?: () => void;
}

export interface FollowingStateButtonsProps extends BaseButtonStateProps {
  actionType: FollowActionType;
  onUnfollow: () => void;
}

export interface BlockedStateButtonsProps extends BaseButtonStateProps {
}

export interface RetryRequestButtonsProps extends BaseButtonStateProps {
  onRequestFollow: () => void;
}

export interface NoneStateButtonsProps extends BaseButtonStateProps {
  actionType: FollowActionType;
  onRequestFollow: () => void;
}


