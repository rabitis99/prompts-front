/**
 * 배치 요청 관리 시스템
 * 
 * 목표: 여러 개별 요청을 모아서 한 번에 처리하거나,
 * 순차적으로 배치 단위로 처리하여 Rate Limit 방지
 * 
 * 개선: rateLimitTracker와 통합하여 RateLimit을 고려한 배치 처리
 */

import { rateLimitTracker, waitForRateLimit } from './rateLimit';

interface BatchRequest<T> {
  id: string;
  requestFn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

interface BatchConfig {
  maxBatchSize: number; // 배치당 최대 요청 수
  maxWaitTime: number; // 최대 대기 시간 (ms)
  delayBetweenBatches: number; // 배치 간 딜레이 (ms)
}

class BatchRequestManager {
  private queue: BatchRequest<any>[] = [];
  private processing = false;
  private config: BatchConfig;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(config?: Partial<BatchConfig>) {
    this.config = {
      maxBatchSize: 10, // 배치당 최대 10개
      maxWaitTime: 200, // 최대 200ms 대기
      delayBetweenBatches: 100, // 배치 간 100ms 딜레이
      ...config,
    };
  }

  /**
   * 요청을 큐에 추가하고 배치 처리
   */
  async addRequest<T>(
    id: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        id,
        requestFn,
        resolve,
        reject,
      });

      // 즉시 처리 시작 (이미 처리 중이면 무시)
      this.processBatch();
    });
  }

  /**
   * 배치 처리 실행
   */
  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    // 타이머가 있으면 취소
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // 배치 크기에 도달하면 즉시 처리
    if (this.queue.length >= this.config.maxBatchSize) {
      this.processing = true;
      await this.executeBatch();
    } else {
      // 최대 대기 시간 후 처리
      this.timer = setTimeout(async () => {
        this.processing = true;
        await this.executeBatch();
      }, this.config.maxWaitTime);
    }
  }

  /**
   * 배치 실행
   */
  private async executeBatch(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    // RateLimit 체크: 사용 가능한 슬롯 확인
    const availableSlots = rateLimitTracker.getAvailableSlots();
    const batchSize = Math.min(
      this.config.maxBatchSize,
      Math.max(1, availableSlots) // 최소 1개는 처리
    );

    // 배치 추출
    const batch = this.queue.splice(0, batchSize);

    // RateLimit 대기 (배치 실행 전)
    if (availableSlots <= 0) {
      await waitForRateLimit();
    }

    try {
      // 배치 내 요청들을 병렬 처리
      const results = await Promise.allSettled(
        batch.map((item) => item.requestFn())
      );

      // 결과 처리
      results.forEach((result, index) => {
        const item = batch[index];
        if (result.status === 'fulfilled') {
          item.resolve(result.value);
        } else {
          item.reject(result.reason);
        }
      });
    } catch (error) {
      // Promise.allSettled는 rejection을 throw하지 않으므로 
      // 개별 실패는 results에서 처리됨
      // 하지만 예상치 못한 에러에 대비
      batch.forEach((item) => item.reject(error));
    }

    // 다음 배치 처리 (대기 중인 요청이 있으면)
    if (this.queue.length > 0) {
      // 배치 간 딜레이 (RateLimit 고려)
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.delayBetweenBatches)
      );
      await this.executeBatch();
    } else {
      this.processing = false;
    }
  }

  /**
   * 큐 크기
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * 초기화
   */
  reset(): void {
    this.queue = [];
    this.processing = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// 싱글톤 인스턴스
export const batchRequestManager = new BatchRequestManager({
  maxBatchSize: 10,
  maxWaitTime: 200,
  delayBetweenBatches: 100,
});

/**
 * 여러 개별 요청을 배치로 처리하는 헬퍼
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  options?: {
    maxConcurrent?: number;
    delayBetweenBatches?: number;
  }
): Promise<T[]> {
  const maxConcurrent = options?.maxConcurrent ?? 5;
  const delayBetweenBatches = options?.delayBetweenBatches ?? 100;

  const results: T[] = [];
  const batches: Array<() => Promise<T>>[] = [];

  // 배치로 분할
  for (let i = 0; i < requests.length; i += maxConcurrent) {
    batches.push(requests.slice(i, i + maxConcurrent));
  }

  // 배치 순차 처리 (RateLimit 고려)
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    // RateLimit 체크: 사용 가능한 슬롯 확인
    const availableSlots = rateLimitTracker.getAvailableSlots();
    if (availableSlots <= 0) {
      await waitForRateLimit();
    }

    const batchResults = await Promise.allSettled(
      batch.map((req) => req())
    );

    results.push(
      ...batchResults
        .filter((result): result is PromiseFulfilledResult<Awaited<T>> => result.status === 'fulfilled')
        .map((result) => result.value as T)
    );

    // 마지막 배치가 아니면 딜레이
    if (i < batches.length - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, delayBetweenBatches)
      );
    }
  }

  return results;
}

