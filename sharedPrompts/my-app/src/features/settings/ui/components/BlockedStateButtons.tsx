import { Ban } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';
import { ICON_SIZE, FOLLOW_BUTTON_TEXT } from './constants';
import type { BlockedStateButtonsProps } from './types';

export function BlockedStateButtons({
  isLoading,
  onUnblock,
}: BlockedStateButtonsProps) {
  // BLOCKED: 차단 상태
  // UX 스펙:
  // - 버튼 텍스트: "차단됨"
  // - 비활성 (해제 불가, 별도 관리 화면에서만 해제)
  return (
    <FollowActionButton
      onClick={() => {}}
      isLoading={isLoading}
      disabled
      variant="secondary"
      icon={<Ban className={ICON_SIZE.MEDIUM} />}
    >
      {FOLLOW_BUTTON_TEXT.BLOCK}
    </FollowActionButton>
  );
}

