import { useState, useEffect } from 'react';

/**
 * React Hook용 Debounce
 * 
 * @param value - debounce할 값
 * @param delay - 대기 시간 (ms)
 * @returns debounce된 값
 * 
 * @example
 * const debouncedSearchQuery = useDebounce(searchQuery, 300);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

