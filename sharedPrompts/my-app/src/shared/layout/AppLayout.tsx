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

    const unsubscribe = setupForegroundMessageListener((payload) => {
      console.log('[AppLayout] FCM message received:', payload);

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
            data: payload.data,
          });
        }
      }
    });

    if (unsubscribe) {
      unsubscribeRef.current = unsubscribe;
    }

    // cleanup: 컴포넌트 unmount 시 리스너 해제
    return () => {
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
