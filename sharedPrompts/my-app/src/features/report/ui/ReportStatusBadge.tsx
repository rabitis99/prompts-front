import type { ReportStatus } from '../types/report.types';
import { REPORT_STATUS_DISPLAY_NAMES } from '../constants/report.constants';
import {
  getReportStatusIcon,
  getReportStatusColorClasses,
} from '../utils/report.utils';

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const Icon = getReportStatusIcon(status);
  const colorClasses = getReportStatusColorClasses(status);
  const isProcessing = status === 'PROCESSING';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${colorClasses}`}
    >
      <Icon
        className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`}
      />
      {REPORT_STATUS_DISPLAY_NAMES[status]}
    </div>
  );
}

