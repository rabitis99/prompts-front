import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// FCM 인스턴스 (브라우저 환경에서만 초기화)
let messaging: ReturnType<typeof getMessaging> | null = null;
// Service Worker 등록 상태 추적
let serviceWorkerRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;
// Messaging 초기화 Promise 추적 (경쟁 상태 방지)
let messagingInitPromise: Promise<ReturnType<typeof getMessaging> | null> | null = null;

/**
 * Messaging 초기화 (경쟁 상태 방지를 위해 Promise 반환)
 */
function initializeMessaging(): Promise<ReturnType<typeof getMessaging> | null> {
  // 이미 초기화 중이면 기존 Promise 반환
  if (messagingInitPromise) {
    return messagingInitPromise;
  }

  // 브라우저 환경이 아니면 null 반환
  if (typeof window === 'undefined') {
    messagingInitPromise = Promise.resolve(null);
    return messagingInitPromise;
  }

  // 초기화 Promise 생성
  messagingInitPromise = isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
      return messaging;
    }
    return null;
  });

  return messagingInitPromise;
}

// 브라우저 환경에서만 messaging 초기화 시작
if (typeof window !== 'undefined') {
  initializeMessaging();
  
  // 개발 환경에서 전역 디버깅 함수 추가
  if (import.meta.env.DEV) {
    (window as any).checkFCMStatus = checkFCMStatus;
    (window as any).refreshFCMToken = refreshFCMToken;
    (window as any).getFCMToken = getFCMToken;
    console.log('[FCM] 디버깅 함수가 전역에 추가되었습니다:');
    console.log('  - window.checkFCMStatus() - FCM 상태 확인');
    console.log('  - window.refreshFCMToken() - FCM 토큰 갱신');
    console.log('  - window.getFCMToken() - FCM 토큰 가져오기');
  }
}

/**
 * Service Worker 등록
 * Firebase Messaging이 백그라운드 알림을 받기 위해 필요합니다.
 * 중복 등록을 방지하기 위해 Promise를 재사용합니다.
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  // 이미 등록 중이면 기존 Promise 반환
  if (serviceWorkerRegistrationPromise) {
    return serviceWorkerRegistrationPromise;
  }

  // 이미 등록되어 있는지 확인
  try {
    const existingRegistration = await navigator.serviceWorker.getRegistration('/');
    if (existingRegistration?.active) {
      console.log('[Firebase] Service Worker already registered:', existingRegistration.scope);
      serviceWorkerRegistrationPromise = Promise.resolve(existingRegistration);
      return existingRegistration;
    }
  } catch (error) {
    console.warn('[Firebase] Error checking existing registration:', error);
  }

  // 새로 등록
  serviceWorkerRegistrationPromise = (async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });
      console.log('[Firebase] Service Worker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.error('[Firebase] Service Worker registration failed:', error);
      serviceWorkerRegistrationPromise = null; // 실패 시 재시도 가능하도록 null로 설정
      return null;
    }
  })();

  return serviceWorkerRegistrationPromise;
}

/**
 * FCM 디바이스 토큰 가져오기
 * - 사용자가 알림 권한을 허용한 경우에만 토큰을 반환
 * - 권한이 없거나 지원되지 않는 환경에서는 null 반환
 * - Service Worker가 등록되어 있지 않으면 자동으로 등록합니다.
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    // Messaging 초기화 완료 대기 (경쟁 상태 방지)
    const initializedMessaging = await initializeMessaging();
    if (!initializedMessaging) {
      console.warn('[FCM] FCM is not supported in this browser');
      return null;
    }

    // Service Worker 등록 확인 및 등록
    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn('[FCM] Service Worker registration failed');
      return null;
    }
    console.log('[FCM] Service Worker registered:', registration.scope);

    // 알림 권한 요청
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission denied:', permission);
      return null;
    }
    console.log('[FCM] Notification permission granted');

    // VAPID 키를 사용하여 토큰 가져오기
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('[FCM] VAPID key is not configured');
      return null;
    }

    const token = await getToken(initializedMessaging, { vapidKey });

    if (token) {
      if (import.meta.env.DEV) {
        console.log('[FCM] Token obtained:', token);
      } else {
        console.log('[FCM] Token obtained:', token.slice(0, 10) + '...');
      }
      return token;
    } else {
      console.warn('[FCM] No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Error getting FCM token:', error);
    return null;
  }
}

/**
 * FCM 포그라운드 메시지 리스너 설정
 * - 앱이 포그라운드에 있을 때 푸시 알림을 받기 위한 리스너
 * - 백그라운드 알림은 Service Worker에서 처리됩니다.
 */
export async function setupForegroundMessageListener(
  onMessageReceived: (payload: any) => void
): Promise<(() => void) | null> {
  try {
    // Messaging 초기화 완료 대기 (경쟁 상태 방지)
    const initializedMessaging = await initializeMessaging();
    if (!initializedMessaging) {
      console.warn('[FCM] Messaging not initialized, cannot setup foreground listener');
      return null;
    }

    const unsubscribe = onMessage(initializedMessaging, (payload) => {
      console.log('[FCM] Foreground message received:', {
        hasNotification: !!payload.notification,
        notificationTitle: payload.notification?.title,
        notificationBody: payload.notification?.body,
        hasData: !!payload.data,
        dataKeys: payload.data ? Object.keys(payload.data) : [],
        messageId: payload.messageId,
        from: payload.from,
      });
      onMessageReceived(payload);
    });

    console.log('[FCM] Foreground message listener setup complete');
    return unsubscribe;
  } catch (error) {
    console.error('[FCM] Error setting up foreground message listener:', error);
    return null;
  }
}

/**
 * FCM 상태 확인 및 디버깅 유틸리티
 */
export async function checkFCMStatus(): Promise<{
  isSupported: boolean;
  messagingInitialized: boolean;
  serviceWorkerRegistered: boolean;
  notificationPermission: NotificationPermission;
  hasVapidKey: boolean;
  currentToken: string | null;
  serviceWorkerScope: string | null;
}> {
  const status = {
    isSupported: false,
    messagingInitialized: false,
    serviceWorkerRegistered: false,
    notificationPermission: 'default' as NotificationPermission,
    hasVapidKey: false,
    currentToken: null as string | null,
    serviceWorkerScope: null as string | null,
  };

  try {
    // FCM 지원 여부 확인
    if (typeof window !== 'undefined') {
      const supported = await isSupported();
      status.isSupported = supported;
    }

    // Messaging 초기화 확인
    const initializedMessaging = await initializeMessaging();
    status.messagingInitialized = !!initializedMessaging;

    // Service Worker 등록 확인
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration('/');
      status.serviceWorkerRegistered = !!registration?.active;
      status.serviceWorkerScope = registration?.scope || null;
    }

    // 알림 권한 확인
    if ('Notification' in window) {
      status.notificationPermission = Notification.permission;
    }

    // VAPID 키 확인
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    status.hasVapidKey = !!vapidKey;

    // 현재 토큰 가져오기
    if (initializedMessaging && status.notificationPermission === 'granted' && status.hasVapidKey) {
      try {
        const token = await getToken(initializedMessaging, { vapidKey });
        status.currentToken = token;
      } catch (error) {
        console.error('[FCM] Error getting token for status check:', error);
      }
    }
  } catch (error) {
    console.error('[FCM] Error checking FCM status:', error);
  }

  return status;
}

/**
 * FCM 토큰 갱신 및 백엔드에 업데이트
 * 로그인 후 토큰이 변경되었을 수 있으므로 주기적으로 호출하거나
 * 알림이 오지 않을 때 호출할 수 있습니다.
 */
export async function refreshFCMToken(): Promise<string | null> {
  try {
    const token = await getFCMToken();
    if (token) {
      console.log('[FCM] Token refreshed:', import.meta.env.DEV ? token : token.slice(0, 10) + '...');
      // TODO: 백엔드에 토큰 업데이트 API 호출 (필요한 경우)
      // await updateDeviceToken(token);
    }
    return token;
  } catch (error) {
    console.error('[FCM] Error refreshing token:', error);
    return null;
  }
}

export { app, messaging };
