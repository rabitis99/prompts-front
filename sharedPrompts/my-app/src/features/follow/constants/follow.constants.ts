/**
 * 팔로우 관련 에러 메시지 상수
 */
export const FOLLOW_ERROR_MESSAGES = {
  REQUEST_FAILED: '팔로우 요청에 실패했습니다.',
  ACCEPT_FAILED: '팔로우 수락에 실패했습니다.',
  REJECT_FAILED: '팔로우 거절에 실패했습니다.',
  REJECT_INVALID_STATE: '대기 상태가 아닌 관계는 거부할 수 없습니다.',
  UNFOLLOW_FAILED: '언팔로우에 실패했습니다.',
  BLOCK_FAILED: '차단에 실패했습니다.',
  BLOCK_FOLLOWER_FAILED: '팔로워 차단에 실패했습니다.',
  UNBLOCK_FAILED: '차단 해제에 실패했습니다.',
  REMOVE_FOLLOWER_FAILED: '팔로워 삭제에 실패했습니다.',
  STATUS_CHECK_FAILED: '팔로우 상태를 확인하는데 실패했습니다.',
  LOAD_FOLLOWERS_FAILED: '팔로워 목록을 불러오는데 실패했습니다.',
  LOAD_FOLLOWING_FAILED: '팔로잉 목록을 불러오는데 실패했습니다.',
  NO_RESPONSE_DATA: '응답 데이터가 없습니다.',
} as const;

