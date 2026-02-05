import { Outlet, useLocation, matchPath } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Header from "@/shared/layout/Header";
import Sidebar from "@/shared/layout/Sidebar";
import FloatingButtonManager from "@/shared/layout/FloatingButtonManager";
import { PAGE_UI_CONFIG, PAGE_TITLE_CONFIG } from "@/shared/config/pageConfig";
import { colors } from "@/theme/colors";
import { setupForegroundMessageListener } from "@/shared/config/firebase";
import { useAuthStore } from "@/features/auth/store/auth.store";

const defaultConfig = {
  header: true,
  footer: false,
};

function getMatchedConfig<T>(map: Record<string, T>, path: string): T | null {
  for (const [pattern, value] of Object.entries(map)) {
    if (matchPath({ path: pattern, end: true }, path)) {
      return value;
    }
  }
  return null;
}

export default function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const config = getMatchedConfig(PAGE_UI_CONFIG, pathname) ?? defaultConfig;
  const pageTitle =
    getMatchedConfig(PAGE_TITLE_CONFIG, pathname) ?? "PromptHub";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  // FCM 포그라운드 메시지 리스너 설정
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    const setupListener = async () => {
      const unsubscribe = await setupForegroundMessageListener((payload) => {
        // 개발 환경에서만 최소한의 정보만 로그 (개인정보 보호)
        if (import.meta.env.DEV) {
          console.log('[AppLayout] FCM message received:', {
            hasNotification: !!payload.notification,
            notificationTitle: payload.notification?.title,
            hasData: !!payload.data,
            dataKeys: payload.data ? Object.keys(payload.data) : [],
          });
        }

        // 알림 표시
        if (payload.notification) {
          const { title, body, icon } = payload.notification;
          
          // 브라우저 알림 표시
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title || '알림', {
              body: body || '',
              icon: icon || '/vite.svg',
              badge: '/vite.svg',
              tag: payload.data?.paymentId || 'notification',
              data: payload.data ? {
                paymentId: payload.data.paymentId,
                type: payload.data.type,
              } : undefined,
            });
          }
        }
      });

      // await 이후 컴포넌트가 언마운트되었으면 즉시 리스너 해제
      if (!isMounted) {
        if (unsubscribe) {
          unsubscribe();
        }
        return;
      }

      // 컴포넌트가 여전히 마운트되어 있으면 unsubscribe 저장
      if (unsubscribe) {
        unsubscribeRef.current = unsubscribe;
      }
    };

    setupListener();

    // cleanup: 컴포넌트 unmount 시 리스너 해제
    return () => {
      isMounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isAuthenticated]);

  return (
    <div className="app-shell layout relative">
      {/* Sidebar는 Layout 책임 */}
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {config.header && (
        <Header />
      )}

      <main
        className="app-main transition-colors duration-500"
        style={{
          backgroundColor:
            pathname === "/"
              ? "var(--color-landing-bg)"
              : colors.background,
        }}
      >
        <Outlet />
      </main>

      {!isMenuOpen && <FloatingButtonManager />}
    </div>
  );
}
