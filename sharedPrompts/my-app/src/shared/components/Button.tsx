import { ArrowRight } from "lucide-react";
import { colors } from "@/theme/colors";
import classNames from "classnames";

interface ButtonProps {
  label: string;
  onClick: () => void;
  icon?: boolean;
  variant?: "primary" | "secondary" | "surface";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
}

export default function Button({
  label,
  onClick,
  icon = false,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  type = "button",
  "aria-label": ariaLabel,
}: ButtonProps) {
  const base =
    "flex items-center justify-center gap-2 px-10 py-4 rounded-full font-semibold text-lg shadow-md transition-all duration-300 group";
  const width = fullWidth ? "w-full" : "";

  const variantStyles =
    variant === "primary"
      ? "text-white hover:scale-105 hover:shadow-lg"
      : variant === "secondary"
      ? "text-[var(--color-text-main)] hover:opacity-90"
      : "text-[var(--color-text-main)] border border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:text-white";

  const background =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
      ? colors.secondary
      : colors.surface;

  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      className={classNames(base, variantStyles, width)}
      style={{
        backgroundColor: background,
      }}
      aria-label={ariaLabel}
    >
      <span>{label}</span>
      {icon && (
        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </button>
  );
}
