import { UserCheck, UserX, Ban } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';
import { ButtonGroup } from './ButtonGroup';
import { StatusIndicator } from './StatusIndicator';
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
  // actionType='follower'인 경우: 상대가 나에게 요청한 상태 → 수락/거절/차단
  if (actionType === 'follower') {
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

  // actionType='follow'인 경우: 팔로잉 탭에서 내가 보낸 요청 → 요청 취소 버튼
  if (actionType === 'follow') {
    return (
      <FollowActionButton
        onClick={onUnfollow}
        isLoading={isLoading}
        variant="secondary"
        icon={<UserX className={ICON_SIZE.MEDIUM} />}
      >
        {FOLLOW_BUTTON_TEXT.CANCEL_REQUEST}
      </FollowActionButton>
    );
  }

  // actionType=null인 경우(기타 컨텍스트): 단순 상태 표시용 비활성 "요청됨"
  return (
    <FollowActionButton
      onClick={() => {}}
      isLoading={false}
      disabled
      variant="secondary"
    >
      {FOLLOW_BUTTON_TEXT.WAITING}
    </FollowActionButton>
  );
}

