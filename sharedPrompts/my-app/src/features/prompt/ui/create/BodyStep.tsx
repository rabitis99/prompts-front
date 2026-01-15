import type { CreatePromptFormData } from '@/features/prompt/model/useCreatePromptView';
import type { DomainOption, CategoryExample } from '@/features/prompt/model/createPrompt.constants';

interface BodyStepProps {
  formData: CreatePromptFormData;
  currentDomain?: DomainOption;
  example?: CategoryExample | null;
  onChangeBody: (body: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onLoadExample: () => void;
  canNext: boolean;
}

export function BodyStep({
  formData,
  currentDomain,
  example,
  onChangeBody,
  onPrev,
  onNext,
  onLoadExample,
  canNext,
}: BodyStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">프롬프트 설명을 작성하세요</h2>
        <p className="text-neutral-600 text-lg">
          이 프롬프트가 어떤 상황에서, 어떤 용도로 쓰이는지 나중에 다시 봐도 이해될 정도로만 간단히 적어주세요
        </p>
      </div>
      <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
        <textarea
          value={formData.promptBody}
          onChange={(e) => onChangeBody(e.target.value)}
          placeholder={example?.prompt || '프롬프트를 입력하세요...'}
          rows={12}
          autoFocus
          className="w-full text-lg text-neutral-900 outline-none resize-none placeholder:text-neutral-300 leading-relaxed"
        />
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-neutral-100">
          <span
            className={`text-sm font-medium ${
              formData.promptBody.length >= 10 ? 'text-emerald-600' : 'text-neutral-400'
            }`}
          >
            {formData.promptBody.length >= 10 ? '✓ 좋아요!' : '최소 10자 이상'}
          </span>
          <span className="text-sm text-neutral-400">{formData.promptBody.length}자</span>
        </div>
      </div>
      {example && (
        <>
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              💡 {currentDomain?.label} 작성 팁
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              {example.tips.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={onLoadExample}
            className="w-full py-3 bg-white text-blue-600 rounded-2xl font-medium hover:bg-blue-50 transition-all border-2 border-blue-200"
          >
            📋 예시 프롬프트 불러오기
          </button>
        </>
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


