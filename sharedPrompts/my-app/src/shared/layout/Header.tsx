import { Menu, Bell } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="w-full sticky top-0 z-30 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      <div className="flex justify-between items-center h-16 px-4">
        <button
          onClick={onMenuClick}
          aria-label="메뉴 열기"
          className="hover:opacity-80 transition-opacity text-[var(--color-primary)]"
        >
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="text-xl font-bold text-[var(--color-primary)] select-none">
          Pventure
        </h1>

        <button
          aria-label="알림 보기"
          className="relative hover:opacity-80 transition-opacity text-[var(--color-primary)]"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-accent)] border border-[var(--color-surface)] rounded-full" />
        </button>
      </div>
    </header>
  );
}
