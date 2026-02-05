// Firebase Cloud Messaging Service Worker
// 백그라운드 푸시 알림 수신을 위한 서비스 워커

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase 설정 (환경 변수를 사용할 수 없으므로 직접 설정 필요)
// 주의: 이 파일은 빌드 시점에 public 폴더에서 그대로 복사되므로
// 실제 Firebase 설정 값을 직접 입력해야 합니다.
const firebaseConfig = {
  apiKey: "AIzaSyAyKu2tcp2Xzuz0yVT1BNQUegpdsZ63Yzs",
  authDomain: "sharedprompt-8ed9d.firebaseapp.com",
  projectId: "sharedprompt-8ed9d",
  storageBucket: "sharedprompt-8ed9d.firebasestorage.app",
  messagingSenderId: "1025868027313",
  appId: "1:1025868027313:web:7037c3f64cd63949215990"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/vite.svg',
    badge: '/vite.svg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // 알림 클릭 시 앱으로 이동
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열려있는 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // 열려있는 창이 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
