import { Info } from 'lucide-react';
import type { FollowUserResponseDto } from '@/features/follow/types/follow.types';
import type { FollowStatus } from '@/features/follow/types/follow.types';
import { normalizePendingDirection } from '@/features/follow/types/follow.types';

interface FollowRelationInfoProps {
  user: FollowUserResponseDto;
  actionType: 'follow' | 'follower' | null;
  followStatus: FollowStatus | null;
}

/**
 * 양방향 블록 상태 정보 표시
 */
function BlockInfo({ user }: { user: FollowUserResponseDto }) {
  const isBlockedByMe = user.is_blocked_by_me;
  const isBlockedByTarget = user.is_blocked_by_target;

  if (!isBlockedByMe && !isBlockedByTarget) return null;

  let message: string | null = null;
  if (isBlockedByMe && isBlockedByTarget) {
    message = '서로 차단된 상태입니다.';
  } else if (isBlockedByMe) {
    message = '이 사용자를 차단했습니다.';
  } else if (isBlockedByTarget) {
    message = '이 사용자에게 차단당했습니다.';
  }

  if (!message) return null;

  return (
    <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
      <Info className="w-4 h-4 mt-0.5 text-red-500" />
      <p>{message}</p>
    </div>
  );
}

/**
 * viewer ← target 방향 관계 정보 표시
 * (상대가 나를 향한 관계)
 */
function ReverseRelationInfo({ user, actionType, followStatus }: { user: FollowUserResponseDto; actionType: 'follow' | 'follower' | null; followStatus: FollowStatus | null }) {
  if (actionType !== 'follower') return null;

  const reverseStatus = user.reverse_follow_status;
  const isBlockedByTarget = user.is_blocked_by_target;
  const normalizedPendingDirection = normalizePendingDirection(user.pending_direction);

  // 맞팔 상태 확인
  const isMutualFollow = followStatus === 'FOLLOWING' && reverseStatus === 'FOLLOWING';

  let message: string | null = null;

  if (isBlockedByTarget) {
    message = '이 사용자는 현재 접근할 수 없습니다.';
  } else if (isMutualFollow) {
    message = '서로 팔로우하고 있습니다.';
  } else if (reverseStatus === 'FOLLOWING') {
    message = '나를 팔로우하고 있습니다.';
  } else if (reverseStatus === 'PENDING' && normalizedPendingDirection === 'TO_ME') {
    message = '나에게 팔로우 요청을 보냈습니다.';
  }

  if (!message) return null;

  return (
    <div className="mb-4 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl flex items-start gap-2 text-xs text-neutral-600">
      <Info className="w-4 h-4 mt-0.5 text-neutral-400" />
      <p>{message}</p>
    </div>
  );
}

/**
 * viewer → target 방향 PENDING 상태 안내 문구
 * (내가 상대에게 요청한 경우)
 */
function PendingInfo({ user, actionType, followStatus }: { user: FollowUserResponseDto; actionType: 'follow' | 'follower' | null; followStatus: FollowStatus | null }) {
  if (followStatus !== 'PENDING') return null;
  if (actionType === 'follower') return null; // follower 탭에서는 viewer ← target 정보만 표시

  const normalizedPendingDirection = normalizePendingDirection(user.pending_direction);

  // FROM_ME: 내가 상대에게 요청한 경우
  if (normalizedPendingDirection === 'FROM_ME') {
    return (
      <div className="mb-4 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl flex items-start gap-2 text-xs text-neutral-600">
        <Info className="w-4 h-4 mt-0.5 text-neutral-400" />
        <p>상대방의 수락을 기다리고 있습니다.</p>
      </div>
    );
  }

  return null;
}

/**
 * 팔로우 관계 정보 표시 컴포넌트
 * 양방향 관계 정보를 표시합니다.
 */
export function FollowRelationInfo({ user, actionType, followStatus }: FollowRelationInfoProps) {
  return (
    <>
      <BlockInfo user={user} />
      <ReverseRelationInfo user={user} actionType={actionType} followStatus={followStatus} />
      <PendingInfo user={user} actionType={actionType} followStatus={followStatus} />
    </>
  );
}

