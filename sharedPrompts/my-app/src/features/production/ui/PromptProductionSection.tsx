import { useState } from 'react';
import { Loader2, PlayCircle, Wand2 } from 'lucide-react';
import { productionApi } from '@/features/production/api';
import type { ProductionJobResponseDto } from '@/features/production/types/production.types';

interface PromptProductionSectionProps {
  promptId: number;
}

export function PromptProductionSection({ promptId }: PromptProductionSectionProps) {
  const [userInput, setUserInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastJob, setLastJob] = useState<ProductionJobResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProduceText = async () => {
    const normalizedInput = userInput.trim();

    if (!normalizedInput) {
      setError('생성에 사용할 추가 설명을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await productionApi.produceText(promptId, { userInput: normalizedInput });
      setLastJob(res.data.data);
    } catch (e) {
      console.error('Failed to request text production', e);
      setError('텍스트 생성 요청에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 space-y-4 mt-4">
      <div className="flex items-center gap-2">
        <Wand2 className="w-5 h-5 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-900">이 프롬프트로 바로 텍스트 만들기 (베타)</h2>
      </div>

      <p className="text-sm text-slate-500">
        아래에 원하는 톤이나 상황을 간단히 적어 주시면, 이 프롬프트를 기반으로 백엔드에서 텍스트를 비동기로 생성해 드려요.
      </p>

      <label htmlFor="production-user-input" className="sr-only">
        생성에 사용할 추가 설명
      </label>
      <textarea
        id="production-user-input"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        aria-label="생성에 사용할 추가 설명"
        placeholder="예: 이 프롬프트로 블로그 초안 만들어줘 / 마케팅 카피 버전으로 다시 써줘 등"
        rows={3}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none resize-none text-sm"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleProduceText}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:from-violet-700 hover:to-indigo-700 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              텍스트 생성 중...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              텍스트 생성하기
            </>
          )}
        </button>

        {lastJob && (
          <div className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">최근 작업:</span>{' '}
            <span className="font-mono">
              #{lastJob.job_id} / 상태: {lastJob.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

