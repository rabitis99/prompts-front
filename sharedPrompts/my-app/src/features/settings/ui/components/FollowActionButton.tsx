import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface FollowActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: ReactNode;
  children: ReactNode;
}

export function FollowActionButton({
  onClick,
  disabled = false,
  isLoading = false,
  variant = 'primary',
  icon,
  children,
}: FollowActionButtonProps) {
  const baseClass = 'w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClass} ${variantClasses[variant]}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          처리 중...
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

