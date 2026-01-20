import { UserPlus } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';
import { ICON_SIZE, FOLLOW_BUTTON_TEXT } from './constants';
import type { RetryRequestButtonsProps } from './types';

export function RetryRequestButtons({
  isLoading,
  onRequestFollow,
}: RetryRequestButtonsProps) {
  return (
    <FollowActionButton
      onClick={onRequestFollow}
      isLoading={isLoading}
      variant="primary"
      icon={<UserPlus className={ICON_SIZE.MEDIUM} />}
    >
      {FOLLOW_BUTTON_TEXT.RETRY_REQUEST}
    </FollowActionButton>
  );
}

