import type { PointType } from '../types/payment.types';

/**
 * PointType 정규화
 * 백엔드에서 'USE'와 'USED'를 모두 반환할 수 있으므로, UI 일관성을 위해 'USE'를 'USED'로 정규화합니다.
 * 
 * @param type 원본 PointType
 * @returns 정규화된 PointType ('USE' -> 'USED')
 */
export function normalizePointType(type: PointType): Exclude<PointType, 'USE'> {
  return type === 'USE' ? 'USED' : type;
}

