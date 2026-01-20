import { Ban } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';
import { ICON_SIZE, FOLLOW_BUTTON_TEXT } from './constants';
import type { BlockedStateButtonsProps } from './types';

export function BlockedStateButtons({
  isLoading,
  onUnblock,
}: BlockedStateButtonsProps) {
  // BLOCKED: 차단 상태 → 차단 해제 버튼 표시
  if (!onUnblock) {
    return null;
  }

  return (
    <FollowActionButton
      onClick={onUnblock}
      isLoading={isLoading}
      variant="secondary"
      icon={<Ban className={ICON_SIZE.MEDIUM} />}
    >
      {FOLLOW_BUTTON_TEXT.UNBLOCK}
    </FollowActionButton>
  );
}

