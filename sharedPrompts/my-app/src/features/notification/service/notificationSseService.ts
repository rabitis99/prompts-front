/**
 * SSE (Server-Sent Events) 기반 실시간 알림 구독 서비스
 * 백엔드: NotificationSseService.subscribe()
 * 
 * 토큰 기반 인증을 지원하기 위해 fetch API와 ReadableStream을 사용하여
 * SSE를 구현합니다. EventSource는 Authorization 헤더를 지원하지 않으므로
 * 사용하지 않습니다.
 */

import type { NotificationResponseDto } from '../types/notification.types';

export type NotificationSseHandler = (notification: NotificationResponseDto) => void;

export interface NotificationSseOptions {
  onNotification?: NotificationSseHandler;
  onError?: (error: Event | Error) => void;
  onOpen?: (event: Event) => void;
  onClose?: () => void;
}

/**
 * SSE 구독 시작
 * 
 * fetch API와 ReadableStream을 사용하여 SSE를 구현합니다.
 * Authorization 헤더를 통해 Bearer 토큰을 전달합니다.
 */
export function subscribeNotificationSse(
  accessToken: string,
  options: NotificationSseOptions = {}
): () => void {
  const controller = new AbortController();
  const sharedState = { isClosed: false };

  subscribeNotificationSseWithFetch(accessToken, options, controller, sharedState);

  // 구독 해제 함수
  return () => {
    if (!sharedState.isClosed) {
      sharedState.isClosed = true;
      options.onClose?.();
      controller.abort();
    }
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
  controller: AbortController,
  sharedState: { isClosed: boolean } = { isClosed: false }
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

      let buffer = '';

      const readChunk = (): Promise<void> => {
        return reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              // 스트림 종료 전 마지막 버퍼 처리
              if (buffer.trim()) {
                const messages = buffer.split('\n\n').filter((msg) => msg.trim());
                for (const message of messages) {
                  const dataLine = message.split('\n').find((line) => line.startsWith('data: '));
                  if (dataLine) {
                    try {
                      const data = dataLine.slice(6); // 'data: ' 제거
                      const notification: NotificationResponseDto = JSON.parse(data);
                      options.onNotification?.(notification);
                    } catch (error) {
                      console.error('Failed to parse notification:', error);
                    }
                  }
                }
              }

              if (!sharedState.isClosed) {
                sharedState.isClosed = true;
                options.onClose?.();
              }
              return Promise.resolve();
            }

            buffer += decoder.decode(value, { stream: true });
            const messages = buffer.split('\n\n');
            // 마지막 요소는 불완전할 수 있으므로 버퍼에 유지
            buffer = messages.pop() || '';

            for (const message of messages) {
              const dataLine = message.split('\n').find((line) => line.startsWith('data: '));
              if (dataLine) {
                try {
                  const data = dataLine.slice(6); // 'data: ' 제거
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
              if (!sharedState.isClosed) {
                sharedState.isClosed = true;
                options.onClose?.();
              }
              options.onError?.(error);
            }
          });
      };

      return readChunk();
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        if (!sharedState.isClosed) {
          sharedState.isClosed = true;
          options.onClose?.();
        }
        options.onError?.(error);
      }
    });
}

