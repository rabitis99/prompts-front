import type { CreatePromptFormData } from '@/features/prompt/model/create/useCreatePromptView';
import type { DomainOption, CategoryExample } from '@/features/prompt/model/create/createPrompt.constants';

interface TitleStepProps {
  formData: CreatePromptFormData;
  currentDomain?: DomainOption;
  example?: CategoryExample | null;
  onChangeTitle: (title: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

export function TitleStep({
  formData,
  currentDomain,
  example,
  onChangeTitle,
  onPrev,
  onNext,
  canNext,
}: TitleStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{currentDomain?.emoji}</div>
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">제목을 입력하세요</h2>
        <p className="text-neutral-600 text-lg">간단하고 명확하게 작성해주세요</p>
      </div>
      <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder={example?.title || '예: React 성능 최적화 가이드'}
          maxLength={100}
          autoFocus
          className="w-full text-2xl font-semibold text-neutral-900 outline-none placeholder:text-neutral-300"
        />
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`text-sm font-medium ${
              formData.title.length >= 5 ? 'text-emerald-600' : 'text-neutral-400'
            }`}
          >
            {formData.title.length >= 5 ? '✓ 좋아요!' : '최소 5자 이상'}
          </span>
          <span className="text-sm text-neutral-400">{formData.title.length}/100</span>
        </div>
      </div>
      {example && (
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">💡 예시 제목</h3>
          <p className="text-sm text-blue-800">"{example.title}"</p>
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={onPrev}
          className="flex-1 py-4 bg-white text-neutral-700 rounded-2xl font-semibold hover:bg-neutral-50 transition-all border-2 border-neutral-200"
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
  );
}


