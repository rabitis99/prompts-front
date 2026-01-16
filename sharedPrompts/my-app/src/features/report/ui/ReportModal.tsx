import { Flag, AlertCircle } from 'lucide-react';
import Modal from '@/shared/components/Modal';
import type { ReportType } from '../types/report.types';
import { useReportModal } from '../hooks/useReportModal';
import { ReportReasonSelector } from './ReportReasonSelector';
import { ReportDescriptionInput } from './ReportDescriptionInput';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  targetId: number;
  onSuccess?: () => void;
}

export function ReportModal({
  isOpen,
  onClose,
  reportType,
  targetId,
  onSuccess,
}: ReportModalProps) {
  const {
    reason,
    description,
    isSubmitting,
    error,
    setReason,
    setDescription,
    setError,
    handleSubmit,
    handleClose,
  } = useReportModal({
    reportType,
    targetId,
    onSuccess,
    onClose,
  });

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="신고하기">
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">신고 전 안내사항</p>
            <p className="leading-relaxed">
              허위 신고는 제재를 받을 수 있습니다. 신고 사유를 정확히 선택해주세요.
            </p>
          </div>
        </div>

        {/* 신고 사유 선택 */}
        <ReportReasonSelector
          selectedReason={reason}
          onSelectReason={(r) => {
            setReason(r);
            setError(null);
          }}
          error={error && !reason ? error : null}
        />

        {/* 추가 설명 (선택) */}
        <ReportDescriptionInput
          description={description}
          onDescriptionChange={(value) => {
            setDescription(value);
            setError(null);
          }}
        />

        {/* 에러 메시지 */}
        {error && reason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Flag className="w-4 h-4" />
            {isSubmitting ? '신고 접수 중...' : '신고하기'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

