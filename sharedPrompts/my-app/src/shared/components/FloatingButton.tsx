import { Plus, Pencil, MapPinPen, Save } from "lucide-react";

/**
 * 페이지 설정에서 사용하는 의미 기반 아이콘 타입
 */
export type FloatingIconType =
  | "plus"
  | "edit"
  | "location"
  | "save";

interface FloatingButtonProps {
  iconType?: FloatingIconType;
  onClick: () => void;
}

const ICON_MAP: Record<FloatingIconType, React.ElementType> = {
  plus: Plus,
  edit: Pencil,
  location: MapPinPen,
  save: Save,
};

export default function FloatingButton({
  iconType = "plus",
  onClick,
}: FloatingButtonProps) {
  const Icon = ICON_MAP[iconType];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="floating action button"
      className="
        fixed bottom-5
        right-[calc(50%-240px+24px)]
        w-14 h-14
        rounded-full
        shadow-lg
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110
        text-white
        z-50
        bg-[var(--color-primary)]
        hover:bg-[var(--color-accent)]
      "
      style={{ backdropFilter: "blur(4px)" }}
    >
      <Icon className="w-7 h-7" />
    </button>
  );
}
