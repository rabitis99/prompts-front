import { ReactNode } from 'react';
import { BUTTON_GROUP_CLASSES } from './constants';

interface ButtonGroupProps {
  children: ReactNode;
  layout?: 'horizontal' | 'horizontal-with-status';
  className?: string;
}

export function ButtonGroup({ 
  children, 
  layout = 'horizontal',
  className = '' 
}: ButtonGroupProps) {
  const layoutClass = layout === 'horizontal-with-status' 
    ? BUTTON_GROUP_CLASSES.HORIZONTAL_WITH_STATUS 
    : BUTTON_GROUP_CLASSES.HORIZONTAL;

  return (
    <div className={`${layoutClass} ${className}`}>
      {children}
    </div>
  );
}

