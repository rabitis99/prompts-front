import { Check } from 'lucide-react';
import type { CreatePromptFormData } from '@/features/prompt/model/useCreatePromptView';
import { LanguageType } from '@/features/prompt/types/prompt.types';
import { LANGUAGE_DISPLAY_NAMES } from '@/features/prompt/model/enumDisplayNames';

interface LanguageStepProps {
  formData: CreatePromptFormData;
  onChangeLanguage: (language?: LanguageType) => void;
  onPrev: () => void;
  onNext: () => void;
}

const LANGUAGE_OPTIONS: { value: LanguageType; label: string }[] = Object.values(LanguageType).map((value) => ({
  value,
  label: LANGUAGE_DISPLAY_NAMES[value],
}));

export function LanguageStep({ formData, onChangeLanguage, onPrev, onNext }: LanguageStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">출력 언어를 선택하세요</h2>
        <p className="text-neutral-600 text-lg">선택사항이에요. 추출 결과의 언어를 지정할 수 있어요</p>
      </div>
      <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChangeLanguage(formData.language === option.value ? undefined : option.value)}
              className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                formData.language === option.value
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md'
                  : 'border-neutral-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`text-xl font-bold ${
                    formData.language === option.value ? 'text-blue-700' : 'text-neutral-900'
                  }`}
                >
                  {option.label}
                </span>
                {formData.language === option.value && <Check className="w-5 h-5 text-blue-500" />}
              </div>
            </button>
          ))}
        </div>
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
          className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
        >
          다음
        </button>
      </div>
    </div>
  );
}
