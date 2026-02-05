/**
 * Rate Limit 추적 및 관리 유틸리티
 * 
 * 목표: 60초에 100건의 요청 제한을 준수하며,
 * Rate Limit 초과를 사전에 방지
 * 
 * 개선사항:
 * - 엔드포인트별 RateLimit 정책 지원
 * - 동적 RateLimit 조정 (429 에러 발생 시)
 * - 배치 요청과의 통합 지원
 */

import { getRateLimitPolicy } from '@/shared/config/policy';

interface RateLimitConfig {
  maxRequests: number; // 최대 요청 수 (기본: 100)
  windowMs: number; // 시간 윈도우 (기본: 60000ms = 60초)
  buffer: number; // 안전 버퍼 (기본: 5건, 예: 95건까지만 사용)
}

interface RequestRecord {
  timestamp: number;
  method: string;
  url: string;
  endpoint?: string; // 엔드포인트 패턴 (예: '/prompts', '/users/:id')
}

class RateLimitTracker {
  private requests: RequestRecord[] = [];
  private config: RateLimitConfig;
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private endpointConfigs: Map<string, RateLimitConfig> = new Map(); // 엔드포인트별 설정
  private adaptiveBuffer: number; // 동적 조정되는 버퍼
  private last429Time: number = 0; // 마지막 429 에러 발생 시간
  private consecutive429Count: number = 0; // 연속 429 에러 횟수

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      maxRequests: 100,
      windowMs: 60000, // 60초
      buffer: 5, // 안전 버퍼: 95건까지만 사용
      ...config,
    };
    this.adaptiveBuffer = this.config.buffer;
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
   * 엔드포인트 패턴 추출 (예: '/users/123' -> '/users/:id')
   */
  private extractEndpointPattern(url: string): string {
    // 숫자 ID를 :id로 변환
    const pattern = url.replace(/\/\d+(?=\/|$)/g, '/:id');
    // 쿼리 파라미터 제거
    return pattern.split('?')[0];
  }

  /**
   * 엔드포인트별 설정 가져오기
   */
  private getEndpointConfig(url: string): RateLimitConfig {
    const pattern = this.extractEndpointPattern(url);
    
    // 캐시된 설정 확인
    if (this.endpointConfigs.has(pattern)) {
      return this.endpointConfigs.get(pattern)!;
    }

    // 정책에서 설정 가져오기
    const policy = getRateLimitPolicy(pattern);
    const endpointConfig: RateLimitConfig = {
      maxRequests: policy.maxRequests,
      windowMs: policy.windowMs,
      buffer: Math.floor(policy.maxRequests * 0.05), // 5% 버퍼
    };

    // 캐시에 저장
    this.endpointConfigs.set(pattern, endpointConfig);
    return endpointConfig;
  }

  /**
   * 요청을 기록하고 Rate Limit 체크
   * @param url 요청 URL (선택적, 엔드포인트별 정책 적용 시 사용)
   * @returns 대기 시간(ms), 0이면 즉시 요청 가능
   */
  canMakeRequest(url?: string): number {
    this.pruneOldRequests();

    // 엔드포인트별 정책이 있으면 사용, 없으면 전역 정책
    const config = url ? this.getEndpointConfig(url) : this.config;
    const effectiveBuffer = url ? config.buffer : this.adaptiveBuffer;

    // 해당 엔드포인트의 요청만 필터링 (엔드포인트별 windowMs 기준으로 시간 필터링)
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const relevantRequests = url 
      ? this.requests.filter(r => {
          const pattern = this.extractEndpointPattern(r.url);
          const isSameEndpoint = pattern === this.extractEndpointPattern(url);
          const isWithinWindow = r.timestamp > windowStart;
          return isSameEndpoint && isWithinWindow;
        })
      : this.requests.filter(r => r.timestamp > windowStart);

    const availableSlots = config.maxRequests - effectiveBuffer - relevantRequests.length;

    if (availableSlots > 0) {
      return 0; // 즉시 요청 가능
    }

    // 가장 오래된 요청이 윈도우를 벗어날 때까지 대기
    if (relevantRequests.length > 0) {
      const oldestRequest = relevantRequests[0];
      const waitTime = oldestRequest.timestamp + config.windowMs - Date.now() + 100; // 100ms 여유
      return Math.max(0, waitTime);
    }

    return 0;
  }

  /**
   * 요청 기록
   */
  recordRequest(method: string, url: string): void {
    const now = Date.now();
    const endpoint = this.extractEndpointPattern(url);
    this.requests.push({ timestamp: now, method, url, endpoint });

    // 메모리 최적화: 최대 200개까지만 유지
    if (this.requests.length > 200) {
      this.requests = this.requests.slice(-200);
    }
  }

  /**
   * 429 에러 발생 시 동적 조정
   * 버퍼를 증가시켜 더 보수적으로 요청 처리
   */
  handle429Error(): void {
    const now = Date.now();
    const timeSinceLast429 = now - this.last429Time;

    // 1분 이내에 429가 다시 발생하면 연속 카운트 증가
    if (timeSinceLast429 < 60000) {
      this.consecutive429Count++;
    } else {
      this.consecutive429Count = 1;
    }

    this.last429Time = now;

    // 연속 429 발생 횟수에 따라 버퍼 증가 (최대 20%까지)
    const bufferIncrease = Math.min(
      this.consecutive429Count * 2,
      Math.floor(this.config.maxRequests * 0.2)
    );
    this.adaptiveBuffer = Math.min(
      this.config.buffer + bufferIncrease,
      Math.floor(this.config.maxRequests * 0.3) // 최대 30% 버퍼
    );

    console.warn(`[RateLimit] 429 에러 발생. 버퍼를 ${this.adaptiveBuffer}로 증가시킵니다. (연속 ${this.consecutive429Count}회)`);
  }

  /**
   * 성공적인 요청 후 버퍼 점진적 복구
   */
  recoverBuffer(): void {
    // 429가 발생한 지 5분이 지나면 버퍼를 점진적으로 복구
    const timeSinceLast429 = Date.now() - this.last429Time;
    if (timeSinceLast429 > 300000 && this.adaptiveBuffer > this.config.buffer) {
      // 1분마다 버퍼를 1씩 감소
      const minutesSince429 = Math.floor(timeSinceLast429 / 60000);
      this.adaptiveBuffer = Math.max(
        this.config.buffer,
        this.adaptiveBuffer - Math.floor(minutesSince429 / 5)
      );
      
      if (this.adaptiveBuffer === this.config.buffer) {
        this.consecutive429Count = 0;
      }
    }
  }

  /**
   * 현재 사용 가능한 요청 슬롯 수
   * @param url 엔드포인트별 슬롯 확인 시 사용
   */
  getAvailableSlots(url?: string): number {
    this.pruneOldRequests();
    
    if (url) {
      const config = this.getEndpointConfig(url);
      const pattern = this.extractEndpointPattern(url);
      const now = Date.now();
      const windowStart = now - config.windowMs;
      // 엔드포인트별 windowMs 기준으로 시간 필터링
      const relevantRequests = this.requests.filter(r => {
        const rPattern = this.extractEndpointPattern(r.url);
        const isSameEndpoint = rPattern === pattern;
        const isWithinWindow = r.timestamp > windowStart;
        return isSameEndpoint && isWithinWindow;
      });
      return Math.max(0, config.maxRequests - config.buffer - relevantRequests.length);
    }
    
    // 전역 설정의 경우 전역 windowMs 기준으로 필터링
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const recentRequests = this.requests.filter(r => r.timestamp > windowStart);
    return Math.max(0, this.config.maxRequests - this.adaptiveBuffer - recentRequests.length);
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
   * 백엔드 RateLimit 헤더와 동기화
   * 백엔드에서 제공하는 실제 RateLimit 정보로 프론트엔드 추적기 업데이트
   */
  syncWithBackend(info: {
    limit: number;
    remaining: number;
    reset?: number; // Unix timestamp (밀리초)
    url?: string;
  }): void {
    // 백엔드의 실제 제한과 남은 요청 수를 기반으로 프론트엔드 추적기 조정
    const endpoint = info.url ? this.extractEndpointPattern(info.url) : undefined;
    
    if (endpoint) {
      // 엔드포인트별 설정 업데이트
      const endpointConfig = this.getEndpointConfig(info.url!);
      endpointConfig.maxRequests = info.limit;
      
      // 백엔드의 remaining이 낮으면 프론트엔드 버퍼 증가
      const usagePercent = (info.limit - info.remaining) / info.limit;
      if (usagePercent > 0.8) {
        // 80% 이상 사용 시 버퍼 증가
        endpointConfig.buffer = Math.floor(info.limit * 0.1);
      }
      
      this.endpointConfigs.set(endpoint, endpointConfig);
    } else {
      // 전역 설정 업데이트
      this.config.maxRequests = info.limit;
      
      // 백엔드의 remaining이 낮으면 프론트엔드 버퍼 증가
      const usagePercent = (info.limit - info.remaining) / info.limit;
      if (usagePercent > 0.8) {
        this.adaptiveBuffer = Math.floor(info.limit * 0.1);
      }
    }
    
    // 리셋 시간이 제공되면 오래된 요청 정리
    if (info.reset) {
      const resetTime = info.reset;
      const now = Date.now();
      
      if (resetTime <= now) {
        // resetTime이 이미 지난 경우: 백엔드가 이미 리셋했으므로 모든 요청 제거
        // 엔드포인트별 정리인 경우 해당 엔드포인트만, 전역인 경우 모두 제거
        if (endpoint) {
          const pattern = this.extractEndpointPattern(info.url!);
          this.requests = this.requests.filter(r => {
            const rPattern = this.extractEndpointPattern(r.url);
            return rPattern !== pattern;
          });
        } else {
          this.requests = [];
        }
      } else {
        // resetTime이 아직 미래인 경우: 새로운 윈도우 범위 내 요청만 유지
        // windowMs를 가져와서 resetTime - windowMs 이후의 요청만 유지
        const config = endpoint 
          ? this.getEndpointConfig(info.url!)
          : this.config;
        const windowStart = resetTime - config.windowMs;
        
        if (endpoint) {
          const pattern = this.extractEndpointPattern(info.url!);
          this.requests = this.requests.filter(r => {
            const rPattern = this.extractEndpointPattern(r.url);
            const isSameEndpoint = rPattern === pattern;
            const isWithinWindow = r.timestamp > windowStart;
            // 다른 엔드포인트는 유지, 같은 엔드포인트는 윈도우 내만 유지
            return !isSameEndpoint || isWithinWindow;
          });
        } else {
          // 전역 설정: 윈도우 내 요청만 유지
          this.requests = this.requests.filter(r => r.timestamp > windowStart);
        }
      }
    }
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
      adaptiveBuffer: this.adaptiveBuffer,
      consecutive429Count: this.consecutive429Count,
    };
  }

  /**
   * 초기화 (테스트용 또는 429 발생 시)
   */
  reset(): void {
    this.requests = [];
    this.pendingRequests.clear();
    // 429 발생 시에는 버퍼만 증가시키고, 완전 리셋은 하지 않음
    // 완전 리셋이 필요한 경우 (예: 로그아웃)에는 reset(true) 호출
  }

  /**
   * 완전 초기화 (버퍼 포함)
   */
  fullReset(): void {
    this.reset();
    this.adaptiveBuffer = this.config.buffer;
    this.consecutive429Count = 0;
    this.last429Time = 0;
    this.endpointConfigs.clear();
  }
}

// 싱글톤 인스턴스
export const rateLimitTracker = new RateLimitTracker();

/**
 * Rate Limit을 고려하여 요청을 지연시키는 헬퍼
 * @param url 엔드포인트별 정책 적용 시 사용
 */
export async function waitForRateLimit(url?: string): Promise<void> {
  // 버퍼 복구 체크
  rateLimitTracker.recoverBuffer();
  
  while (true) {
    const waitTime = rateLimitTracker.canMakeRequest(url);
    if (waitTime <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
}

