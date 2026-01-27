import React from 'react';
import { sanitizeText } from '@/shared/utils/sanitize';

interface SafeTextProps {
  children: string;
  className?: string;
}

/**
 * 사용자 입력 텍스트를 안전하게 렌더링하는 컴포넌트
 * XSS 공격을 방지하기 위해 HTML 태그를 이스케이프합니다.
 */
export function SafeText({ children, className }: SafeTextProps) {
  // React는 기본적으로 JSX에서 텍스트를 이스케이프하지만,
  // 추가 보안을 위해 sanitize를 적용합니다.
  const safeText = sanitizeText(children);
  
  return <span className={className} dangerouslySetInnerHTML={{ __html: safeText }} />;
}

