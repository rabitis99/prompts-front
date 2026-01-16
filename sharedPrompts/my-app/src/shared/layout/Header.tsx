import { Menu, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="w-full sticky top-0 z-30 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      <div className="flex justify-between items-center h-16 px-4">
        <button
          onClick={() => navigate("/settings")}
          aria-label="설정"
          className="hover:opacity-80 transition-opacity text-violet-600"
        >
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="text-xl font-bold text-violet-600 select-none">
          PromptHub
        </h1>

        <button
          onClick={() => navigate("/notifications")}
          aria-label="알림 보기"
          className="relative hover:opacity-80 transition-opacity text-violet-600"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-accent)] border border-[var(--color-surface)] rounded-full" />
        </button>
      </div>
    </header>
  );
}
