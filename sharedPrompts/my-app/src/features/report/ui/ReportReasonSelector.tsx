import type { ReportReason } from '../types/report.types';
import {
  REPORT_REASON_DISPLAY_NAMES,
  REPORT_REASON_DESCRIPTIONS,
} from '../constants/report.constants';

interface ReportReasonSelectorProps {
  selectedReason: ReportReason | null;
  onSelectReason: (reason: ReportReason) => void;
  error?: string | null;
}

export function ReportReasonSelector({
  selectedReason,
  onSelectReason,
  error,
}: ReportReasonSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900 mb-3">
        신고 사유 <span className="text-red-500">*</span>
      </label>
      <div role="radiogroup" className="space-y-2">
        {(Object.keys(REPORT_REASON_DISPLAY_NAMES) as ReportReason[]).map((reason) => (
          <button
            key={reason}
            role="radio"
            aria-checked={selectedReason === reason}
            tabIndex={selectedReason === reason ? 0 : -1}
            onClick={() => onSelectReason(reason)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedReason === reason
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-semibold text-slate-900 mb-1">
                  {REPORT_REASON_DISPLAY_NAMES[reason]}
                </div>
                <div className="text-xs text-slate-600">
                  {REPORT_REASON_DESCRIPTIONS[reason]}
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedReason === reason
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-slate-300'
                }`}
              >
                {selectedReason === reason && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      {error && !selectedReason && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

