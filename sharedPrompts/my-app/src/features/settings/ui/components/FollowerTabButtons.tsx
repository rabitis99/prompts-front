import type { FollowStatus, FollowUserResponseDto } from '@/features/follow/types/follow.types';
import { normalizePendingDirection } from '@/features/follow/types/follow.types';
import { NoneStateButtons } from './NoneStateButtons';
import { PendingStateButtons } from './PendingStateButtons';
import { FollowingStateButtons } from './FollowingStateButtons';
import { BlockedStateButtons } from './BlockedStateButtons';

interface FollowerTabButtonsProps {
  followStatus: FollowStatus | null;
  user?: FollowUserResponseDto | null;
  isLoading: boolean;
  onRequestFollow: () => void;
  onAcceptFollow?: () => void;
  onRejectFollow?: () => void;
  onUnfollow: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
  onRemoveFollower?: () => void;
}

/**
 * 팔로워 탭 전용 버튼 렌더링 컴포넌트
 * 
 * 팔로워 탭에 있는 사용자는 나를 팔로우하고 있는 사용자입니다.
 * getFollowStatus는 viewer → target 방향만 반환하므로, 상대가 나를 팔로우하고 있지만
 * 내가 상대를 팔로우하지 않는 경우 followStatus가 null일 수 있습니다.
 * 
 * 상태별 동작:
 * - FOLLOWING: 내가 상대를 팔로우하고 있음 → 팔로우 요청 버튼과 차단 버튼 표시
 * - BLOCKED: 차단 해제 버튼 표시
 * - REJECTED/CANCELLED: 처리 완료 후 → 팔로우 요청 버튼 표시
 * - PENDING: 내가 상대에게 보낸 요청 (대기 중) → 요청 취소/차단 버튼 표시 (이 경우는 팔로워 탭에서 드뭄)
 * - null: 상대가 나를 팔로우하고 있지만 내가 상대를 팔로우하지 않음 → 팔로우 요청 버튼과 차단 버튼 표시
 */
export function FollowerTabButtons({
  followStatus,
  user,
  isLoading,
  onRequestFollow,
  onAcceptFollow,
  onRejectFollow,
  onUnfollow,
  onBlock,
  onUnblock,
  onRemoveFollower,
}: FollowerTabButtonsProps) {
  // pending_direction 값을 정규화
  const normalizedPendingDirection = normalizePendingDirection(user?.pending_direction);
  
  // 상대가 나에게 팔로우 요청을 보낸 경우 확인 (reverse_follow_status가 PENDING이고 pending_direction이 TO_ME)
  const hasIncomingRequest = user?.reverse_follow_status === 'PENDING' && normalizedPendingDirection === 'TO_ME';
  
  // 내가 상대에게 보낸 요청인지 확인 (followStatus가 PENDING이고 pending_direction이 FROM_ME)
  const hasOutgoingRequest = followStatus === 'PENDING' && normalizedPendingDirection === 'FROM_ME';

  // 맞팔 상태 확인: 서로 팔로우하고 있는 경우
  const isMutualFollow = followStatus === 'FOLLOWING' && user?.reverse_follow_status === 'FOLLOWING';

  // 1. BLOCKED 상태: 차단 해제 버튼 표시 (가장 우선 처리)
  if (followStatus === 'BLOCKED') {
    return (
      <BlockedStateButtons
        isLoading={isLoading}
        onUnblock={onUnblock}
      />
    );
  }

  // 2. 상대가 나에게 보낸 요청인 경우 → 수락/거절/차단 버튼 표시 (최우선 처리)
  // "나에게 팔로우 요청을 보냈습니다" 상태
  if (hasIncomingRequest) {
    return (
      <PendingStateButtons
        actionType="follower"
        isLoading={isLoading}
        onAcceptFollow={onAcceptFollow}
        onRejectFollow={onRejectFollow}
        onBlock={onBlock}
      />
    );
  }

  // 3. 내가 상대에게 보낸 요청인 경우 → 요청 취소/차단 버튼 표시
  if (hasOutgoingRequest) {
    return (
      <PendingStateButtons
        actionType="follow"
        isLoading={isLoading}
        onUnfollow={onUnfollow}
        onBlock={onBlock}
      />
    );
  }

  // 4. PENDING 상태이지만 방향이 명확하지 않은 경우 (레거시 호환)
  if (followStatus === 'PENDING') {
    // reverse_follow_status가 PENDING이면 수락/거절, 아니면 취소
    if (user?.reverse_follow_status === 'PENDING') {
      return (
        <PendingStateButtons
          actionType="follower"
          isLoading={isLoading}
          onAcceptFollow={onAcceptFollow}
          onRejectFollow={onRejectFollow}
          onBlock={onBlock}
        />
      );
    }
    // 내가 보낸 요청인 경우 취소
    return (
      <PendingStateButtons
        actionType="follow"
        isLoading={isLoading}
        onUnfollow={onUnfollow}
        onBlock={onBlock}
      />
    );
  }

  // 5. 맞팔 상태: 서로 팔로우하고 있는 경우 → 언팔로우/차단/삭제 버튼 표시
  // "나를 팔로우하고 있습니다" + "내가 상대를 팔로우하고 있습니다"
  if (isMutualFollow) {
    return (
      <FollowingStateButtons
        actionType="follower"
        isLoading={isLoading}
        onUnfollow={onUnfollow}
        onBlock={onBlock}
        onRemoveFollower={onRemoveFollower}
      />
    );
  }

  // 6. 상대가 나를 팔로우하고 있는 경우 (reverse_follow_status === 'FOLLOWING')
  // "나를 팔로우하고 있습니다" 메시지가 표시되는 경우
  // 내가 상대를 팔로우하지 않는 경우 → 팔로우 요청/차단/삭제 버튼 표시
  if (user?.reverse_follow_status === 'FOLLOWING') {
    return (
      <FollowingStateButtons
        actionType="follower"
        isLoading={isLoading}
        onRequestFollow={onRequestFollow}
        onUnfollow={onUnfollow}
        onBlock={onBlock}
        onRemoveFollower={onRemoveFollower}
      />
    );
  }
  
  // 7. FOLLOWING 상태: 내가 상대를 팔로우하고 있음 → 언팔로우/차단 버튼 표시
  // (상대가 나를 팔로우하지 않는 경우)
  if (followStatus === 'FOLLOWING') {
    return (
      <FollowingStateButtons
        actionType="follower"
        isLoading={isLoading}
        onUnfollow={onUnfollow}
        onBlock={onBlock}
        onRemoveFollower={onRemoveFollower}
      />
    );
  }

  // 8. REJECTED/CANCELLED 상태: 수락/거절/차단 처리가 끝난 후 → 팔로우 요청 버튼 표시
  if (followStatus === 'REJECTED' || followStatus === 'CANCELLED') {
    return (
      <NoneStateButtons
        actionType="follower"
        isLoading={isLoading}
        onRequestFollow={onRequestFollow}
      />
    );
  }

  // 9. null 상태: viewer → target 방향으로 관계가 없음
  // 상대가 나를 팔로우하고 있지만 내가 상대를 팔로우하지 않는 경우 → 팔로우 요청 버튼과 차단 버튼 표시
  if (!followStatus) {
    return (
      <FollowingStateButtons
        actionType="follower"
        isLoading={isLoading}
        onRequestFollow={onRequestFollow}
        onBlock={onBlock}
        onRemoveFollower={onRemoveFollower}
      />
    );
  }

  // 위의 모든 상태에 해당하지 않는 경우: 버튼 표시하지 않음
  return null;
}

