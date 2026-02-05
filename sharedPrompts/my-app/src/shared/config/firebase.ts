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
      console.warn('FCM is not supported in this browser');
      return null;
    }

    // Service Worker 등록 확인 및 등록
    await registerServiceWorker();

    // 알림 권한 요청
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // VAPID 키를 사용하여 토큰 가져오기
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(initializedMessaging, { vapidKey });

    if (token) {
      if (import.meta.env.DEV) {
        console.log('FCM token obtained:', token);
      } else {
        console.log('FCM token obtained:', token.slice(0, 10) + '...');
      }
      return token;
    } else {
      console.warn('No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
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
      console.log('[FCM] Foreground message received:', payload);
      onMessageReceived(payload);
    });

    console.log('[FCM] Foreground message listener setup complete');
    return unsubscribe;
  } catch (error) {
    console.error('[FCM] Error setting up foreground message listener:', error);
    return null;
  }
}

export { app, messaging };
