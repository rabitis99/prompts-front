/**
 * 캐시 무효화 전략 개선
 * API 호출 후 관련 캐시를 자동으로 무효화합니다.
 */

import { apiCache } from './cache';
import { CACHE_POLICY } from '@/shared/config/policy';

/**
 * API 메서드와 URL로부터 무효화할 캐시 패턴 생성
 */
function getInvalidationPatterns(method: string, url: string): RegExp[] {
  const patterns: RegExp[] = [];
  
  // 정책에서 무효화 패턴 찾기
  const policyKey = `${method} ${url}`;
  
  for (const [pattern, invalidatedEndpoints] of Object.entries(CACHE_POLICY.invalidationPatterns)) {
    const [patternMethod, patternUrl] = pattern.split(' ');
    const regex = new RegExp('^' + patternUrl.replace(/:[^/]+/g, '[^/]+') + '$');
    
    if (patternMethod === method && regex.test(url)) {
      // 무효화할 엔드포인트들에 대한 패턴 생성
      invalidatedEndpoints.forEach((endpoint) => {
        // GET /prompts 같은 패턴을 정규식으로 변환
        const endpointRegex = new RegExp('^GET:' + endpoint.replace(/:[^/]+/g, '[^/]+') + '(:|$)');
        patterns.push(endpointRegex);
      });
    }
  }
  
  return patterns;
}

/**
 * API 호출 후 관련 캐시 무효화
 * @param method - HTTP 메서드
 * @param url - API URL
 */
export function invalidateRelatedCache(method: string, url: string): void {
  // POST, PATCH, DELETE 요청 후에만 무효화
  if (!['POST', 'PATCH', 'DELETE', 'PUT'].includes(method.toUpperCase())) {
    return;
  }

  const patterns = getInvalidationPatterns(method, url);
  
  // 패턴에 맞는 캐시 모두 무효화
  patterns.forEach((pattern) => {
    apiCache.invalidatePattern(pattern);
  });
  
  // 특정 URL의 캐시도 직접 무효화
  apiCache.invalidate('GET', url);
  
  // 관련된 목록 캐시도 무효화 (예: /prompts/:id 수정 시 /prompts 목록 무효화)
  if (url.includes('/prompts/')) {
    apiCache.invalidatePattern(/^GET:\/prompts(:|$)/);
  }
  
  if (url.includes('/comments')) {
    // 댓글 관련 캐시 무효화
    const promptIdMatch = url.match(/\/prompts\/(\d+)/);
    if (promptIdMatch) {
      const promptId = promptIdMatch[1];
      apiCache.invalidate('GET', `/prompts/${promptId}`);
    }
  }
}

/**
 * 특정 엔드포인트의 모든 캐시 무효화
 */
export function invalidateEndpointCache(endpoint: string): void {
  apiCache.invalidatePattern(new RegExp(`^GET:${endpoint.replace(/:[^/]+/g, '[^/]+')}(:|$)`));
}

