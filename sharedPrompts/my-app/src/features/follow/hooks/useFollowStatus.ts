import { useState, useCallback, useEffect, useRef } from 'react';
import { followApi } from '../api/follow.api';
import type { FollowStatus, FollowResponseDto } from '../types/follow.types';
import { extractErrorMessage } from '../utils/error.utils';
import { FOLLOW_ERROR_MESSAGES } from '../constants/follow.constants';

interface UseFollowStatusOptions {
  userId: number | null;
}

export function useFollowStatus({ userId }: UseFollowStatusOptions) {
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
  const [followData, setFollowData] = useState<FollowResponseDto | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  // userId가 변경되면 상태 초기화
  useEffect(() => {
    setFollowStatus(null);
    setFollowData(null);
    setHasChecked(false);
    setError(null);
  }, [userId]);

  const checkFollowStatus = useCallback(async () => {
    if (!userId) {
      setFollowStatus(null);
      setFollowData(null);
      setHasChecked(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    setIsChecking(true);
    setError(null);
    try {
      const response = await followApi.getFollowStatus(userId);
      const responseData = response?.data?.data;

      if (currentRequestId !== requestIdRef.current) return;

      if (!responseData) {
        throw new Error(FOLLOW_ERROR_MESSAGES.NO_RESPONSE_DATA);
      }

      // 서버는 항상 명확한 상태를 내려줌 (404 없음)
      const validStatuses: FollowStatus[] = ['PENDING', 'FOLLOWING', 'REJECTED', 'CANCELLED', 'BLOCKED'];
      const statusValue = responseData.status;
      const normalizedStatus =
        typeof statusValue === 'string'
          ? statusValue.toUpperCase().trim()
          : null;

      const status: FollowStatus | null =
        normalizedStatus && validStatuses.includes(normalizedStatus as FollowStatus)
          ? (normalizedStatus as FollowStatus)
          : null;

      setFollowStatus(status);
      setFollowData(responseData); // 전체 응답 데이터 저장
      setHasChecked(true);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;

      // 서버는 항상 상태를 내려주므로, 에러 발생 시에만 처리
      const errorMsg = extractErrorMessage(err, FOLLOW_ERROR_MESSAGES.STATUS_CHECK_FAILED);
      setError(errorMsg);
      setFollowStatus(null);
      setFollowData(null);
      setHasChecked(true); // 에러가 발생해도 확인 시도는 완료된 것으로 간주
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsChecking(false);
      }
    }
  }, [userId]);

  // userId가 변경되면 상태 초기화
  const resetStatus = useCallback(() => {
    setFollowStatus(null);
    setFollowData(null);
    setError(null);
    setHasChecked(false);
  }, []);

  return {
    followStatus,
    followData, // 전체 응답 데이터 반환
    isChecking,
    hasChecked,
    error,
    checkFollowStatus,
    resetStatus,
    setError,
  };
}

