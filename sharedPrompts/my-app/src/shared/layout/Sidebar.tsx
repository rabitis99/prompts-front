import { X, Settings, Folder, Calendar, UserRound, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { userApi } from "@/features/auth/api/user.api";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  useEffect(() => {
    let isMounted = true;
    const checkAdminRole = async () => {
      if (!isAuthenticated) {
        if (isMounted) {
          setIsAdmin(false);
        }
        return;
      }

      try {
        // UserResponseDto를 사용하여 role 정보 확인
        // 일반 유저도 role을 받을 수 있지만, UI에는 표시하지 않음
        const response = await userApi.getMyInfo();
        const user = response.data.data;
        // role이 ADMIN 또는 ROLE_ADMIN일 때만 admin 메뉴 표시
        if (isMounted) {
          setIsAdmin(user.role === "ADMIN" || user.role === "ROLE_ADMIN");
        }
      } catch (error) {
        console.error("[Sidebar] Failed to fetch user info:", error);
        if (isMounted) {
          setIsAdmin(false);
        }
      }
    };

    checkAdminRole();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full z-40 transition-opacity duration-300 ${isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
    >
      {isOpen && (
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {isOpen && (
        <aside
          className="absolute top-0 left-0 w-full h-[calc(100dvh)] flex flex-col bg-[var(--color-bg)] shadow-xl z-50 overflow-y-auto overscroll-contain"
          style={{
            WebkitOverflowScrolling: "touch",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex items-center justify-between h-16 px-8 border-b border-[var(--color-border)]">
            <h2 className="text-2xl font-bold text-violet-600">
              PromptHub
            </h2>
            <button onClick={onClose} aria-label="닫기">
              <X className="w-7 h-7 text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]" />
            </button>
          </div>

          <div className="flex flex-col items-center py-10 border-b border-[var(--color-border)]">
            <div
              className="relative w-20 h-20 flex items-center justify-center rounded-full 
                bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] shadow-md"
            >
              <UserRound className="w-10 h-10 text-white" />
            </div>
            <p className="mt-4 text-lg font-semibold text-[var(--color-text-main)]">
              OO님
            </p>
            <p className="text-[var(--color-text-sub)] text-sm mt-1">
              PromptHub ID: user123
            </p>
          </div>

          <nav className="flex flex-col gap-6 p-8 text-[var(--color-text-main)]">
            <button
              onClick={() => handleNav("/folders")}
              className="flex items-center gap-4 text-lg hover:text-[var(--color-primary)]"
            >
              <Folder className="w-6 h-6" /> 나의 여행
            </button>
            <button
              onClick={() => handleNav("/calendar")}
              className="flex items-center gap-4 text-lg hover:text-[var(--color-primary)]"
            >
              <Calendar className="w-6 h-6" /> 캘린더
            </button>
            <button
              onClick={() => handleNav("/profile")}
              className="flex items-center gap-4 text-lg hover:text-[var(--color-primary)]"
            >
              <UserRound className="w-6 h-6" /> 내 정보
            </button>
            <button
              onClick={() => handleNav("/settings")}
              className="flex items-center gap-4 text-lg hover:text-[var(--color-primary)]"
            >
              <Settings className="w-6 h-6" /> 설정
            </button>
            {isAdmin && (
              <button
                onClick={() => handleNav("/admin")}
                className="flex items-center gap-4 text-lg hover:text-[var(--color-primary)] text-purple-600"
              >
                <Shield className="w-6 h-6" /> 관리자
              </button>
            )}
          </nav>

          <div className="mt-auto px-8 pb-[calc(env(safe-area-inset-bottom,40px)+40px)]">
            <button className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-base hover:opacity-90 transition-all duration-300">
              로그아웃
            </button>
            <p className="text-xs text-[var(--color-text-sub)] text-center mt-5">
              v1.0.0
            </p>
          </div>
        </aside>
      )
      }
    </div >
  );
}
