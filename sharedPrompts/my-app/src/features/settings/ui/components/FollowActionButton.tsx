// features/settings/ui/components/FollowActionButton.tsx

import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { ICON_SIZE, FOLLOW_BUTTON_TEXT } from './constants';
import type { ButtonSize, ButtonVariant } from './types';

interface FollowActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export function FollowActionButton({
  onClick,
  disabled = false,
  isLoading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  icon,
  children,
  type = 'button',
}: FollowActionButtonProps) {
  const baseClass =
    'rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2';

  const sizeClasses = {
    md: 'py-3 text-sm',
    sm: 'py-2 text-xs',
  } satisfies Record<ButtonSize, string>;
  
  const variantClasses = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? 'w-full' : 'w-auto'}`}
    >
      {isLoading ? (
        <>
          <Loader2 className={`${ICON_SIZE.MEDIUM} animate-spin`} />
          {FOLLOW_BUTTON_TEXT.PROCESSING}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

