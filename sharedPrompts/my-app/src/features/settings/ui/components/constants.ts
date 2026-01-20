export const FOLLOW_BUTTON_TEXT = {
  REQUEST: '팔로우',
  RETRY_REQUEST: '팔로우 재요청',
  ACCEPT: '팔로우 수락',
  REJECT: '거절',
  FOLLOWING: '팔로잉',
  UNFOLLOW: '언팔로우',
  CANCEL_REQUEST: '요청 취소',
  BLOCK: '차단',
  BLOCKED: '차단됨',
  UNBLOCK: '차단 해제',
  UNBLOCK_AND_REQUEST: '차단 해제 후 요청',
  REMOVE: '삭제',
  WAITING: '요청됨',
  PROCESSING: '처리 중...',
} as const;

export const ICON_SIZE = {
  SMALL: 'w-4 h-4',
  MEDIUM: 'w-5 h-5',
  LARGE: 'w-6 h-6',
} as const;

export const BUTTON_GROUP_CLASSES = {
  HORIZONTAL: 'flex gap-3',
  HORIZONTAL_WITH_STATUS: 'flex gap-3 items-center',
} as const;

export const STATUS_CLASSES = {
  WAITING: 'flex-1 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-medium flex items-center justify-center gap-2',
} as const;

