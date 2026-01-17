/**
 * SSE (Server-Sent Events) 기반 실시간 알림 구독 서비스
 * 백엔드: NotificationSseService.subscribe()
 * 
 * EventSource API를 사용하여 실시간 알림을 수신합니다.
 * 인증 토큰은 Authorization 헤더를 통해 전달해야 하므로,
 * EventSource 대신 fetch API와 ReadableStream을 사용할 수도 있습니다.
 */

import type { NotificationResponseDto } from '../types/notification.types';

export type NotificationSseHandler = (notification: NotificationResponseDto) => void;

export interface NotificationSseOptions {
  onNotification?: NotificationSseHandler;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  onClose?: () => void;
}

/**
 * SSE 구독 시작
 * 
 * 주의: EventSource는 Authorization 헤더를 직접 설정할 수 없습니다.
 * 백엔드에서 쿠키 기반 인증을 사용하거나, 
 * fetch API와 ReadableStream을 사용하는 방식으로 구현해야 합니다.
 * 
 * @see fetch-based SSE implementation below
 */
export function subscribeNotificationSse(
  accessToken: string,
  options: NotificationSseOptions = {}
): () => void {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  // EventSource는 Authorization 헤더를 지원하지 않으므로,
  // fetch API를 사용하여 SSE를 구현
  const controller = new AbortController();
  let eventSource: EventSource | null = null;

  // 백엔드에서 쿠키 기반 인증을 사용하는 경우 EventSource 사용 가능
  // 그렇지 않다면 fetch 기반 SSE 구현 필요
  try {
    // 방법 1: 쿠키 기반 인증 사용 시 (백엔드 설정 필요)
    eventSource = new EventSource(`${API_BASE_URL}/notifications/subscribe`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const notification: NotificationResponseDto = JSON.parse(event.data);
        options.onNotification?.(notification);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    eventSource.onerror = (error) => {
      options.onError?.(error);
      // 연결 오류 시 자동 재연결 시도
    };

    eventSource.onopen = (event) => {
      options.onOpen?.(event);
    };
  } catch (error) {
    console.error('Failed to create EventSource:', error);
    // fetch 기반 SSE로 폴백
    subscribeNotificationSseWithFetch(accessToken, options, controller);
  }

  // 구독 해제 함수
  return () => {
    eventSource?.close();
    controller.abort();
  };
}

/**
 * fetch API를 사용한 SSE 구독 (Authorization 헤더 지원)
 * 
 * EventSource는 Authorization 헤더를 지원하지 않으므로,
 * fetch API와 ReadableStream을 사용하여 SSE를 구현합니다.
 */
function subscribeNotificationSseWithFetch(
  accessToken: string,
  options: NotificationSseOptions,
  controller: AbortController
): void {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  fetch(`${API_BASE_URL}/notifications/subscribe`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'text/event-stream',
    },
    signal: controller.signal,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      options.onOpen?.(new Event('open'));

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const readChunk = (): Promise<void> => {
        return reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              options.onClose?.();
              return Promise.resolve();
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = line.slice(6); // 'data: ' 제거
                  const notification: NotificationResponseDto = JSON.parse(data);
                  options.onNotification?.(notification);
                } catch (error) {
                  console.error('Failed to parse notification:', error);
                }
              }
            }

            return readChunk();
          })
          .catch((error) => {
            if (error.name !== 'AbortError') {
              options.onError?.(error);
            }
          });
      };

      return readChunk();
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        options.onError?.(error);
      }
    });
}

