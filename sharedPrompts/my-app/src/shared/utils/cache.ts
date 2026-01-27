/**
 * API 응답 캐싱 시스템
 * 
 * 목표: 동일한 요청에 대해 일정 시간 동안 캐시된 응답 재사용
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  defaultTTL: number; // 기본 TTL (ms)
  maxSize: number; // 최대 캐시 엔트리 수
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      defaultTTL: 30000, // 30초 기본 TTL
      maxSize: 500, // 최대 500개 엔트리
      ...config,
    };
  }

  /**
   * 캐시 키 생성
   */
  private createKey(method: string, url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramsStr}`;
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  get<T>(method: string, url: string, params?: any): T | null {
    const key = this.createKey(method, url, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 만료 체크
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 캐시에 데이터 저장
   */
  set<T>(method: string, url: string, data: T, params?: any, ttl?: number): void {
    const key = this.createKey(method, url, params);
    const now = Date.now();
    const expiresAt = now + (ttl ?? this.config.defaultTTL);

    // 캐시 크기 제한
    if (this.cache.size >= this.config.maxSize) {
      // 가장 오래된 엔트리 제거
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  /**
   * 특정 요청의 캐시 무효화
   */
  invalidate(method: string, url: string, params?: any): void {
    const key = this.createKey(method, url, params);
    this.cache.delete(key);
  }

  /**
   * 패턴으로 캐시 무효화 (예: 모든 GET /prompts 캐시 삭제)
   */
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 전체 캐시 클리어
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 만료된 엔트리 정리
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 통계 정보
   */
  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
    };
  }
}

// 싱글톤 인스턴스
export const apiCache = new ApiCache({
  defaultTTL: 30000, // 30초
  maxSize: 500,
});

// 주기적으로 만료된 캐시 정리 (5분마다)
let cleanupIntervalId: ReturnType<typeof setInterval> | null = null;
if (typeof window !== 'undefined') {
  cleanupIntervalId = setInterval(() => {
    apiCache.cleanup();
  }, 5 * 60 * 1000);
  
  // HMR이나 모듈 재로딩 시 이전 interval 정리
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      if (cleanupIntervalId) {
        clearInterval(cleanupIntervalId);
        cleanupIntervalId = null;
      }
    });
  }
}

