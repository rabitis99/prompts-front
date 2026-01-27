import DOMPurify from 'dompurify';

/**
 * HTML 문자열을 sanitize하여 XSS 공격을 방지합니다.
 * @param dirty - sanitize할 HTML 문자열
 * @returns sanitize된 HTML 문자열
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // 모든 HTML 태그 제거 (텍스트만 허용)
    ALLOWED_ATTR: [],
  });
}

/**
 * 마크다운 렌더링을 위한 HTML을 sanitize합니다.
 * 기본적인 마크다운 태그만 허용합니다.
 * @param dirty - sanitize할 HTML 문자열
 * @returns sanitize된 HTML 문자열
 */
export function sanitizeMarkdown(dirty: string): string {
  // target="_blank" 링크에 rel="noopener noreferrer" 자동 추가
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      const rel = (node.getAttribute('rel') || '')
        .split(/\s+/)
        .filter(Boolean);
      const relSet = new Set(rel);
      relSet.add('noopener');
      relSet.add('noreferrer');
      node.setAttribute('rel', [...relSet].join(' '));
    }
  });

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    // target="_blank" 사용 시 rel="noopener noreferrer" 자동 추가
    ADD_ATTR: ['target'],
    FORBID_ATTR: [],
  });
}

/**
 * 사용자 입력 텍스트를 안전하게 렌더링합니다.
 * HTML 태그를 이스케이프하여 XSS를 방지합니다.
 * @param text - 사용자 입력 텍스트
 * @returns 안전한 텍스트
 */
export function sanitizeText(text: string): string {
  // HTML 태그를 이스케이프 (SSR 호환)
  if (typeof document === 'undefined') {
    // SSR 환경에서는 수동 이스케이프
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

