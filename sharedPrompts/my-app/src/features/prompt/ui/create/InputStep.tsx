import type { CreatePromptFormData } from '@/features/prompt/model/useCreatePromptView';

interface InputStepProps {
  formData: CreatePromptFormData;
  onChangeInput: (input: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

export function InputStep({ formData, onChangeInput, onPrev, onNext, canNext }: InputStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">입력값을 입력하세요</h2>
        <p className="text-neutral-600 text-lg">
          이 프롬프트가 이번에 처리해야 할 대상이나 상황을 짧게 적어주세요
        </p>
      </div>
      <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
        <textarea
          value={formData.input}
          onChange={(e) => onChangeInput(e.target.value)}
          placeholder="예: 다룰 주제, 상황 설명, 참고해야 할 문장들 등을 한두 문장으로 적어주세요..."
          rows={12}
          autoFocus
          className="w-full text-lg text-neutral-900 outline-none resize-none placeholder:text-neutral-300 leading-relaxed"
        />
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-neutral-100">
          <span className={`text-sm font-medium ${formData.input.length >= 10 ? 'text-emerald-600' : 'text-neutral-400'}`}>
            {formData.input.length >= 10 ? '✓ 좋아요!' : '최소 10자 이상'}
          </span>
          <span className="text-sm text-neutral-400">{formData.input.length}자</span>
        </div>
      </div>
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          💡 입력값이란?
        </h3>
        <p className="text-sm text-blue-800">
          프롬프트에 실제로 넣을 짧은 설명이나 재료입니다. 예를 들어 이번에 다룰 주제, 상황 한두 줄 요약,
          참고하고 싶은 텍스트 일부 등을 가볍게 적어주시면 됩니다.
        </p>
      </div>
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

