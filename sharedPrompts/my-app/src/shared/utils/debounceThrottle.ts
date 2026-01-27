/**
 * Debounce 및 Throttle 유틸리티 함수
 * 
 * 목표: 빠른 연속 입력/요청에 대한 호출 지연 처리
 */

/**
 * Debounce: 마지막 호출 후 일정 시간이 지나면 실행
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Throttle: 일정 시간 간격으로 최대 1회만 실행
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= wait) {
      // 즉시 실행
      lastCallTime = now;
      func(...args);
    } else {
      // 남은 시간 후 실행 예약
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        func(...args);
        timeoutId = null;
      }, wait - timeSinceLastCall);
    }
  };
}

/**
 * React Hook용 Debounce
 * 별도 파일로 분리 권장: useDebounce.ts
 */
// import { useState, useEffect } from 'react';
// 
// export function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);
//
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);
//
//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);
//
//   return debouncedValue;
// }

