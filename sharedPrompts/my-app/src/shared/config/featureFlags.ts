/**
 * Feature Flag 시스템
 * 환경 변수 또는 런타임 설정으로 기능을 on/off 할 수 있습니다.
 */

import { useMemo } from 'react';

type FeatureFlag = {
  name: string;
  description: string;
  enabled: boolean;
  // 환경별 오버라이드 가능
  overrides?: {
    development?: boolean;
    production?: boolean;
  };
};

/**
 * Feature Flag 정의
 */
const featureFlags: Record<string, FeatureFlag> = {
  // 예시: 새 기능을 점진적으로 롤아웃
  NEW_COMMENT_SYSTEM: {
    name: 'NEW_COMMENT_SYSTEM',
    description: '새로운 댓글 시스템 활성화',
    enabled: false,
    overrides: {
      development: true, // 개발 환경에서는 활성화
    },
  },
  
  // 예시: 실험적 기능
  EXPERIMENTAL_SEARCH: {
    name: 'EXPERIMENTAL_SEARCH',
    description: '실험적 검색 기능',
    enabled: false,
  },
  
  // 예시: 관리자 전용 기능
  ADMIN_ANALYTICS: {
    name: 'ADMIN_ANALYTICS',
    description: '관리자 분석 대시보드',
    enabled: true,
  },
};

/**
 * 현재 환경 확인
 */
function getCurrentEnv(): 'development' | 'production' {
  return import.meta.env.MODE === 'production' ? 'production' : 'development';
}

/**
 * Feature Flag가 활성화되어 있는지 확인
 * @param flagName - Feature Flag 이름
 * @returns 활성화 여부
 */
export function isFeatureEnabled(flagName: string): boolean {
  const flag = featureFlags[flagName];
  
  if (!flag) {
    console.warn(`Feature flag "${flagName}" not found. Returning false.`);
    return false;
  }

  const env = getCurrentEnv();
  
  // 환경별 오버라이드 확인
  if (flag.overrides?.[env] !== undefined) {
    return flag.overrides[env]!;
  }

  return flag.enabled;
}

/**
 * 모든 Feature Flag 조회
 */
export function getAllFeatureFlags(): Record<string, boolean> {
  const env = getCurrentEnv();
  const result: Record<string, boolean> = {};

  Object.entries(featureFlags).forEach(([key, flag]) => {
    if (flag.overrides?.[env] !== undefined) {
      result[key] = flag.overrides[env]!;
    } else {
      result[key] = flag.enabled;
    }
  });

  return result;
}

/**
 * Feature Flag 정보 조회
 */
export function getFeatureFlagInfo(flagName: string): FeatureFlag | null {
  return featureFlags[flagName] || null;
}

/**
 * React Hook으로 Feature Flag 사용
 * 주의: 런타임 플래그 변경에는 반응하지 않습니다.
 * 플래그가 런타임에 변경될 수 있다면 상태 관리를 추가해야 합니다.
 */
export function useFeatureFlag(flagName: string): boolean {
  return useMemo(() => isFeatureEnabled(flagName), [flagName]);
}

