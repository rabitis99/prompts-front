import { CheckingState } from './CheckingState';
import { FollowerTabButtons } from './FollowerTabButtons';
import { GeneralStatusButtons } from './GeneralStatusButtons';
import type { FollowActionButtonsProps } from './types';

/**
 * 팔로우 액션 버튼 메인 컴포넌트
 * 
 * actionType에 따라 적절한 버튼 컴포넌트로 라우팅합니다.
 * - 'follower': FollowerTabButtons 사용 (팔로워 탭 전용 로직)
 * - 기타: GeneralStatusButtons 사용 (일반 상태 버튼)
 */
export function FollowActionButtons({
  followStatus,
  actionType,
  isLoading,
  isChecking,
  hasChecked,
  user,
  onRequestFollow,
  onAcceptFollow,
  onRejectFollow,
  onUnfollow,
  onBlock,
  onUnblock,
  onRemoveFollower,
}: FollowActionButtonsProps) {
  // 상태 확인 중이거나 아직 확인하지 않은 경우 로딩 표시
  if (isChecking || !hasChecked) {
    return <CheckingState />;
  }

  // 팔로워 탭 전용 버튼 렌더링
  if (actionType === 'follower') {
    return (
      <FollowerTabButtons
        followStatus={followStatus}
        user={user}
        isLoading={isLoading}
        onRequestFollow={onRequestFollow}
        onAcceptFollow={onAcceptFollow}
        onRejectFollow={onRejectFollow}
        onUnfollow={onUnfollow}
        onBlock={onBlock}
        onUnblock={onUnblock}
        onRemoveFollower={onRemoveFollower}
      />
    );
  }

  // 일반적인 상태별 버튼 렌더링
  return (
    <GeneralStatusButtons
      followStatus={followStatus}
      actionType={actionType}
      isLoading={isLoading}
      onRequestFollow={onRequestFollow}
      onAcceptFollow={onAcceptFollow}
      onRejectFollow={onRejectFollow}
      onUnfollow={onUnfollow}
      onBlock={onBlock}
      onUnblock={onUnblock}
    />
  );
}

