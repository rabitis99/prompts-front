import { UserCheck, UserX, Ban, X } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';
import { ButtonGroup } from './ButtonGroup';
import { ICON_SIZE, FOLLOW_BUTTON_TEXT } from './constants';
import type { PendingStateButtonsProps } from './types';

export function PendingStateButtons({
  actionType,
  isLoading,
  onAcceptFollow,
  onRejectFollow,
  onUnfollow,
  onBlock,
}: PendingStateButtonsProps) {
  // actionType='follower'인 경우: 상대가 나에게 요청한 상태 → 수락/거절/차단 순서
  if (actionType === 'follower') {
    // 최소한 하나의 버튼이라도 표시되어야 함
    const hasAnyButton = onAcceptFollow || onRejectFollow || onBlock;
    
    if (!hasAnyButton) {
      return null;
    }
    
    return (
      <ButtonGroup>
        {onAcceptFollow && (
          <FollowActionButton
            onClick={onAcceptFollow}
            isLoading={isLoading}
            variant="primary"
            icon={<UserCheck className={ICON_SIZE.MEDIUM} />}
          >
            {FOLLOW_BUTTON_TEXT.ACCEPT}
          </FollowActionButton>
        )}
        {onRejectFollow && (
          <FollowActionButton
            onClick={onRejectFollow}
            isLoading={isLoading}
            variant="secondary"
            icon={<UserX className={ICON_SIZE.MEDIUM} />}
          >
            {FOLLOW_BUTTON_TEXT.REJECT}
          </FollowActionButton>
        )}
        {onBlock && (
          <FollowActionButton
            onClick={onBlock}
            isLoading={isLoading}
            variant="danger"
            icon={<Ban className={ICON_SIZE.MEDIUM} />}
          >
            {FOLLOW_BUTTON_TEXT.BLOCK}
          </FollowActionButton>
        )}
      </ButtonGroup>
    );
  }

  // actionType='follow' 또는 null인 경우: 내가 상대에게 보낸 요청 → 요청 취소/차단 버튼
  return (
    <ButtonGroup>
      {onUnfollow && (
        <FollowActionButton
          onClick={onUnfollow}
          isLoading={isLoading}
          variant="secondary"
          icon={<X className={ICON_SIZE.MEDIUM} />}
        >
          {FOLLOW_BUTTON_TEXT.CANCEL_REQUEST}
        </FollowActionButton>
      )}
      {onBlock && (
        <FollowActionButton
          onClick={onBlock}
          isLoading={isLoading}
          variant="danger"
          icon={<Ban className={ICON_SIZE.MEDIUM} />}
        >
          {FOLLOW_BUTTON_TEXT.BLOCK}
        </FollowActionButton>
      )}
    </ButtonGroup>
  );
}

