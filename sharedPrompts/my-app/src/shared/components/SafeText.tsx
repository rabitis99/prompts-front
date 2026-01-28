import React from 'react';

interface SafeTextProps {
  children: string;
  className?: string;
}

/**
 * 사용자 입력 텍스트를 안전하게 렌더링하는 컴포넌트
 * React는 JSX에서 텍스트를 자동으로 이스케이프합니다.
 */
export function SafeText({ children, className }: SafeTextProps) {
  // React는 JSX에서 텍스트를 자동으로 이스케이프합니다
  return <span className={className}>{children}</span>;
}

