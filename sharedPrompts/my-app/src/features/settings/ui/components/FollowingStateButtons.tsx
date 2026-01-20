import { UserMinus } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';
import { ICON_SIZE, FOLLOW_BUTTON_TEXT } from './constants';
import type { FollowingStateButtonsProps } from './types';

export function FollowingStateButtons({
  actionType,
  isLoading,
  onUnfollow,
}: FollowingStateButtonsProps) {
  const handleClick = () => {
    const confirmed = window.confirm(
      '팔로우를 취소하시겠습니까?\n\n이 사용자의 추가 프롬프트를 팔로우할 수 없게 됩니다.'
    );

    if (!confirmed) return;

    onUnfollow?.();
  };

  return (
    <FollowActionButton
      onClick={handleClick}
      isLoading={isLoading}
      variant="secondary"
      icon={<UserMinus className={ICON_SIZE.MEDIUM} />}
    >
      {FOLLOW_BUTTON_TEXT.FOLLOWING}
    </FollowActionButton>
  );
}

