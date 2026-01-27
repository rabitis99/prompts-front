/**
 * Rate Limit 추적 및 관리 유틸리티
 * 
 * 목표: 60초에 100건의 요청 제한을 준수하며,
 * Rate Limit 초과를 사전에 방지
 */

interface RateLimitConfig {
  maxRequests: number; // 최대 요청 수 (기본: 100)
  windowMs: number; // 시간 윈도우 (기본: 60000ms = 60초)
  buffer: number; // 안전 버퍼 (기본: 5건, 예: 95건까지만 사용)
}

interface RequestRecord {
  timestamp: number;
  method: string;
  url: string;
}

class RateLimitTracker {
  private requests: RequestRecord[] = [];
  private config: RateLimitConfig;
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      maxRequests: 100,
      windowMs: 60000, // 60초
      buffer: 5, // 안전 버퍼: 95건까지만 사용
      ...config,
    };
  }

  /**
   * 오래된 요청 정리
   */
  private pruneOldRequests(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    this.requests = this.requests.filter((r) => r.timestamp > windowStart);
  }

  /**
   * 요청을 기록하고 Rate Limit 체크
   * @returns 대기 시간(ms), 0이면 즉시 요청 가능
   */
  canMakeRequest(): number {
    this.pruneOldRequests();

    const availableSlots = this.config.maxRequests - this.config.buffer - this.requests.length;

    if (availableSlots > 0) {
      return 0; // 즉시 요청 가능
    }

    // 가장 오래된 요청이 윈도우를 벗어날 때까지 대기
    if (this.requests.length > 0) {
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest.timestamp + this.config.windowMs - Date.now() + 100; // 100ms 여유
      return Math.max(0, waitTime);
    }

    return 0;
  }

  /**
   * 요청 기록
   */
  recordRequest(method: string, url: string): void {
    const now = Date.now();
    this.requests.push({ timestamp: now, method, url });

    // 메모리 최적화: 최대 200개까지만 유지
    if (this.requests.length > 200) {
      this.requests = this.requests.slice(-200);
    }
  }

  /**
   * 현재 사용 가능한 요청 슬롯 수
   */
  getAvailableSlots(): number {
    this.pruneOldRequests();
    return Math.max(0, this.config.maxRequests - this.config.buffer - this.requests.length);
  }

  /**
   * 중복 요청 방지: 동일한 요청이 진행 중이면 기존 Promise 반환
   */
  getOrCreateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const existing = this.pendingRequests.get(key);
    if (existing) {
      return existing;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * 요청 키 생성 (중복 체크용)
   */
  createRequestKey(method: string, url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramsStr}`;
  }

  /**
   * 통계 정보
   */
  getStats() {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const recentRequests = this.requests.filter((r) => r.timestamp > windowStart);

    return {
      recentCount: recentRequests.length,
      availableSlots: this.getAvailableSlots(),
      pendingRequests: this.pendingRequests.size,
      windowMs: this.config.windowMs,
    };
  }

  /**
   * 초기화 (테스트용)
   */
  reset(): void {
    this.requests = [];
    this.pendingRequests.clear();
  }
}

// 싱글톤 인스턴스
export const rateLimitTracker = new RateLimitTracker();

/**
 * Rate Limit을 고려하여 요청을 지연시키는 헬퍼
 */
export async function waitForRateLimit(): Promise<void> {
  const waitTime = rateLimitTracker.canMakeRequest();
  if (waitTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
}

