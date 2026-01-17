import { useState, useEffect } from 'react';
import { reportApi } from '../api/report.api';
import type { ReportType, ReportReason } from '../types/report.types';

interface UseReportModalProps {
  reportType: ReportType;
  targetId: number;
  onSuccess?: () => void;
  onClose: () => void;
}

export function useReportModal({
  reportType,
  targetId,
  onSuccess,
  onClose,
}: UseReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달이 닫힐 때 상태 초기화
  const resetState = () => {
    setReason(null);
    setDescription('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!reason) {
      setError('신고 사유를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reportApi.createReport({
        report_type: reportType,
        target_id: targetId,
        reason,
        description: description.trim() || undefined,
      });

      resetState();
      onSuccess?.();
      onClose();
      // TODO: toast로 변경 필요
      alert('신고가 접수되었습니다. 검토 후 처리하겠습니다.');
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      setError(
        err.response?.data?.message || '신고 접수에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetState();
    onClose();
  };

  return {
    reason,
    description,
    isSubmitting,
    error,
    setReason,
    setDescription,
    setError,
    handleSubmit,
    handleClose,
  };
}

