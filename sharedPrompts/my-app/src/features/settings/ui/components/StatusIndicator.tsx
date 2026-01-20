import { ReactNode } from 'react';
import { STATUS_CLASSES } from './constants';

interface StatusIndicatorProps {
  icon?: ReactNode;
  text: string;
  className?: string;
}

export function StatusIndicator({ 
  icon, 
  text, 
  className = '' 
}: StatusIndicatorProps) {
  return (
    <div className={`${STATUS_CLASSES.WAITING} ${className}`}>
      {icon}
      {text}
    </div>
  );
}

