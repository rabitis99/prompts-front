import { useState } from 'react';
import { UserMinus, UserPlus, Ban, UserX } from 'lucide-react';
import { FollowActionButton } from './FollowActionButton';
import { ButtonGroup } from './ButtonGroup';
import { UnfollowConfirmModal } from './UnfollowConfirmModal';
import { ICON_SIZE, FOLLOW_BUTTON_TEXT } from './constants';
import type { FollowingStateButtonsProps } from './types';

export function FollowingStateButtons({
  actionType,
  isLoading,
  onUnfollow,
  onRequestFollow,
  onBlock,
  onRemoveFollower,
}: FollowingStateButtonsProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    onUnfollow?.();
  };

  // 팔로워 탭에서 null 상태: 팔로우 요청 버튼과 차단/삭제 버튼 표시
  // (상대가 나를 팔로우하고 있지만 내가 상대를 팔로우하지 않는 경우)
  if (actionType === 'follower' && onRequestFollow) {
    return (
      <ButtonGroup>
        {onRequestFollow && (
          <FollowActionButton
            onClick={onRequestFollow}
            isLoading={isLoading}
            variant="primary"
            icon={<UserPlus className={ICON_SIZE.MEDIUM} />}
          >
            {FOLLOW_BUTTON_TEXT.REQUEST}
          </FollowActionButton>
        )}
        {onRemoveFollower && (
          <FollowActionButton
            onClick={onRemoveFollower}
            isLoading={isLoading}
            variant="secondary"
            icon={<UserX className={ICON_SIZE.MEDIUM} />}
          >
            {FOLLOW_BUTTON_TEXT.REMOVE}
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

  // 팔로워 탭에서 FOLLOWING 상태: 차단과 삭제 버튼만 표시
  // (상대가 나를 팔로우하고 있고, 내가 상대를 팔로우하고 있는 경우)
  if (actionType === 'follower' && (onBlock || onRemoveFollower)) {
    return (
      <ButtonGroup>
        {onRemoveFollower && (
          <FollowActionButton
            onClick={onRemoveFollower}
            isLoading={isLoading}
            variant="secondary"
            icon={<UserX className={ICON_SIZE.MEDIUM} />}
          >
            {FOLLOW_BUTTON_TEXT.REMOVE}
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

  // 일반적인 FOLLOWING 상태: 언팔로우 버튼 표시
  return (
    <>
      <FollowActionButton
        onClick={handleClick}
        isLoading={isLoading}
        variant="secondary"
        icon={<UserMinus className={ICON_SIZE.MEDIUM} />}
      >
        {FOLLOW_BUTTON_TEXT.FOLLOWING}
      </FollowActionButton>
      <UnfollowConfirmModal
        isOpen={showConfirmModal}
        isLoading={isLoading}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

