import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReportResponseDto } from '../types/report.types';
import {
  REPORT_TYPE_DISPLAY_NAMES,
  REPORT_REASON_DISPLAY_NAMES,
} from '../constants/report.constants';
import { formatReportDate } from '../utils/report.utils';
import { ReportStatusBadge } from './ReportStatusBadge';

interface ReportItemProps {
  report: ReportResponseDto;
}

export const ReportItem = memo(function ReportItem({ report }: ReportItemProps) {
  const navigate = useNavigate();

  const isPromptReport = report.report_type === 'PROMPT';
  const canNavigateToPrompt = isPromptReport && report.target_id != null;

  const handleClick = () => {
    if (!canNavigateToPrompt) return;
    navigate(`/prompts/${report.target_id}`);
  };

  const Container: React.ElementType = canNavigateToPrompt ? 'button' : 'div';

  return (
    <Container
      type={canNavigateToPrompt ? 'button' : undefined}
      onClick={canNavigateToPrompt ? handleClick : undefined}
      aria-disabled={!canNavigateToPrompt ? true : undefined}
      className="w-full text-left p-4 border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-neutral-700">
              {REPORT_TYPE_DISPLAY_NAMES[report.report_type]}
            </span>
          </div>
          <div className="text-sm font-medium text-neutral-900 mb-1">
            {REPORT_REASON_DISPLAY_NAMES[report.reason]}
          </div>
          {report.description && (
            <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
              {report.description}
            </p>
          )}
        </div>
        <ReportStatusBadge status={report.status} />
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-100">
        <span>신고일: {formatReportDate(report.created_at)}</span>
        {report.updated_at !== report.created_at && (
          <span>수정일: {formatReportDate(report.updated_at)}</span>
        )}
      </div>
    </Container>
  );
});
