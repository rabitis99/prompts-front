import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeNotificationSse } from '../service/notificationSseService';
import type { NotificationResponseDto } from '../types/notification.types';
import { useAuthStore } from '@/features/auth/store/auth.store';

export interface UseNotificationSseOptions {
  /** 새 알림 수신 시 호출될 콜백 */
  onNotification?: (notification: NotificationResponseDto) => void;
  /** SSE 연결 오류 시 호출될 콜백 */
  onError?: (error: Event | Error) => void;
  /** SSE 연결 성공 시 호출될 콜백 */
  onOpen?: (event: Event) => void;
  /** SSE 연결 종료 시 호출될 콜백 */
  onClose?: () => void;
  /** SSE 구독을 활성화할지 여부 */
  enabled?: boolean;
}

export interface UseNotificationSseReturn {
  /** SSE 연결 여부 */
  isConnected: boolean;
  /** SSE 구독 수동 시작 */
  start: () => void;
  /** SSE 구독 수동 종료 */
  stop: () => void;
}

/**
 * 실시간 알림 구독 (SSE)을 담당하는 훅
 */
export function useNotificationSse(
  options: UseNotificationSseOptions = {}
): UseNotificationSseReturn {
  const {
    onNotification,
    onError,
    onOpen,
    onClose,
    enabled = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const optionsRef = useRef(options);

  // 최신 콜백 참조 유지
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /**
   * SSE 구독 시작
   */
  const start = useCallback(() => {
    // 이미 구독 중이면 중단
    if (unsubscribeRef.current) {
      return;
    }

    const { accessToken } = useAuthStore.getState();

    if (!accessToken) {
      console.warn('Access token not found, cannot subscribe to SSE');
      return;
    }

    const unsubscribe = subscribeNotificationSse(accessToken, {
      onNotification: (notification) => {
        optionsRef.current.onNotification?.(notification);
      },
      onError: (error) => {
        setIsConnected(false);
        optionsRef.current.onError?.(error);
      },
      onOpen: (event) => {
        setIsConnected(true);
        optionsRef.current.onOpen?.(event);
      },
      onClose: () => {
        setIsConnected(false);
        optionsRef.current.onClose?.();
      },
    });

    unsubscribeRef.current = unsubscribe;
  }, []);

  /**
   * SSE 구독 종료
   */
  const stop = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // enabled 상태에 따라 자동 구독/구독 해제
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  return {
    isConnected,
    start,
    stop,
  };
}

