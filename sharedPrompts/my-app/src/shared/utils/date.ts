/**
 * 날짜/시간 포맷팅 유틸리티
 * 상대 시간 표현 (예: "2분 전", "1시간 전")
 */

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86400;
const SECONDS_IN_MONTH = 2592000;

/**
 * 날짜 문자열을 상대 시간으로 포맷팅
 * 예: "방금 전", "2분 전", "1시간 전", "3일 전"
 * 
 * @param dateString - ISO 8601 형식의 날짜 문자열 (예: "2024-01-15T10:30:00")
 * @returns 포맷팅된 상대 시간 문자열
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < SECONDS_IN_MINUTE) {
      return '방금 전';
    } else if (diffInSeconds < SECONDS_IN_HOUR) {
      const minutes = Math.floor(diffInSeconds / SECONDS_IN_MINUTE);
      return `${minutes}분 전`;
    } else if (diffInSeconds < SECONDS_IN_DAY) {
      const hours = Math.floor(diffInSeconds / SECONDS_IN_HOUR);
      return `${hours}시간 전`;
    } else if (diffInSeconds < SECONDS_IN_MONTH) {
      const days = Math.floor(diffInSeconds / SECONDS_IN_DAY);
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  } catch {
    return dateString;
  }
}

