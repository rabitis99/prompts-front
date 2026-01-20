import { UserPlus } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';
import { ICON_SIZE, FOLLOW_BUTTON_TEXT } from './constants';
import type { NoneStateButtonsProps } from './types';

/**
 * 팔로우 관계가 없는 상태(null) 또는 처리 완료 후(REJECTED/CANCELLED)의 팔로우 요청 버튼
 * 
 * 사용 케이스:
 * 1. followStatus === null: 팔로우 관계 없음 → 팔로우 요청 버튼 표시
 * 2. actionType === 'follower' && (REJECTED/CANCELLED): 수락/거절/차단 처리 완료 후 → 팔로우 요청 버튼 표시
 */
export function NoneStateButtons({
  actionType: _actionType,
  isLoading,
  onRequestFollow,
}: NoneStateButtonsProps) {
  return (
    <FollowActionButton
      onClick={onRequestFollow}
      isLoading={isLoading}
      variant="primary"
      icon={<UserPlus className={ICON_SIZE.MEDIUM} />}
    >
      {FOLLOW_BUTTON_TEXT.REQUEST}
    </FollowActionButton>
  );
}

