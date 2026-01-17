import { REPORT_CONSTANTS } from '../constants/report.constants';

interface ReportDescriptionInputProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

export function ReportDescriptionInput({
  description,
  onDescriptionChange,
}: ReportDescriptionInputProps) {
  return (
    <div>
      <label htmlFor="report-description" className="block text-sm font-semibold text-slate-900 mb-2">
        추가 설명 (선택)
      </label>
      <textarea
        id="report-description"
        aria-describedby="report-description-help report-description-count"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="신고 사유에 대한 자세한 설명을 입력해주세요. (최대 1000자)"
        rows={4}
        maxLength={REPORT_CONSTANTS.MAX_DESCRIPTION_LENGTH}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none resize-none transition-all text-sm"
      />
      <div className="flex justify-between items-center mt-2">
        <p id="report-description-help" className="text-xs text-slate-500">
          더 자세한 설명을 제공하시면 검토가 더 빠르게 진행됩니다.
        </p>
        <span id="report-description-count" className="text-xs text-slate-400">
          {description.length}/{REPORT_CONSTANTS.MAX_DESCRIPTION_LENGTH}
        </span>
      </div>
    </div>
  );
}

