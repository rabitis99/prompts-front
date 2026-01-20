// features/settings/ui/components/FollowActionButton.tsx

import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { ICON_SIZE, FOLLOW_BUTTON_TEXT } from './constants';
import type { ButtonVariant } from './types';

interface FollowActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: ButtonVariant;
  icon?: ReactNode;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export function FollowActionButton({
  onClick,
  disabled = false,
  isLoading = false,
  variant = 'primary',
  icon,
  children,
  type = 'button',
}: FollowActionButtonProps) {
  const baseClass = 'w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2';
  
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
      className={`${baseClass} ${variantClasses[variant]}`}
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

