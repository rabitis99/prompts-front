/**
 * 날짜/시간 포맷팅 유틸리티
 * 상대 시간 표현 (예: "2분 전", "1시간 전")
 */

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
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}시간 전`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
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

