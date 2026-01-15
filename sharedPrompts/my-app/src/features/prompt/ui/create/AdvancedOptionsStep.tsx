import { useState } from 'react';
import { Info, Check } from 'lucide-react';
import type { CreatePromptFormData } from '@/features/prompt/model/useCreatePromptView';
import { ToneType, ExperienceLevel, StyleType, LanguageType } from '@/features/prompt/types/prompt.types';
import {
  TONE_DISPLAY_NAMES,
  EXPERIENCE_DISPLAY_NAMES,
  STYLE_DISPLAY_NAMES,
  LANGUAGE_DISPLAY_NAMES,
} from '@/features/prompt/model/enumDisplayNames';
import {
  TONE_GUIDELINES,
  EXPERIENCE_GUIDELINES,
  STYLE_GUIDELINES,
} from '@/features/prompt/model/enumGuidelines';

interface AdvancedOptionsStepProps {
  formData: CreatePromptFormData;
  onChangeTone: (tone?: ToneType) => void;
  onChangeExperience: (experience?: ExperienceLevel) => void;
  onChangeStyle: (style?: StyleType) => void;
  onChangeLanguage: (language?: LanguageType) => void;
  onPrev: () => void;
  onNext: () => void;
}

// 백엔드 enum의 모든 값과 displayName 매핑
const TONE_OPTIONS: { value: ToneType; label: string }[] = Object.values(ToneType).map((value) => ({
  value,
  label: TONE_DISPLAY_NAMES[value],
}));

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = Object.values(ExperienceLevel).map((value) => ({
  value,
  label: EXPERIENCE_DISPLAY_NAMES[value],
}));

const STYLE_OPTIONS: { value: StyleType; label: string }[] = Object.values(StyleType).map((value) => ({
  value,
  label: STYLE_DISPLAY_NAMES[value],
}));

const LANGUAGE_OPTIONS: { value: LanguageType; label: string }[] = Object.values(LanguageType).map((value) => ({
  value,
  label: LANGUAGE_DISPLAY_NAMES[value],
}));

interface OptionCardProps<T> {
  value: T;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

function OptionCard<T>({ value, label, description, isSelected, onClick }: OptionCardProps<T>) {
  return (
    <button
      onClick={onClick}
      className={`group relative text-left p-4 rounded-2xl border-2 transition-all hover:shadow-lg ${
        isSelected
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md'
          : 'border-neutral-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={`font-bold text-lg ${isSelected ? 'text-blue-700' : 'text-neutral-900'}`}>
          {label}
        </h4>
        {isSelected && (
          <Check className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2" />
        )}
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
    </button>
  );
}

export function AdvancedOptionsStep({
  formData,
  onChangeTone,
  onChangeExperience,
  onChangeStyle,
  onChangeLanguage,
  onPrev,
  onNext,
}: AdvancedOptionsStepProps) {
  const [expandedSection, setExpandedSection] = useState<'tone' | 'experience' | 'style' | 'language' | null>(null);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">추가 옵션을 선택하세요</h2>
        <p className="text-neutral-600 text-lg">선택사항입니다. 각 옵션을 클릭하면 설명을 확인할 수 있어요</p>
      </div>

      {/* Tone */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span>톤 (Tone)</span>
            <button
              onClick={() => setExpandedSection(expandedSection === 'tone' ? null : 'tone')}
              className="p-1 hover:bg-blue-50 rounded-lg transition-colors"
              title="설명 보기"
            >
              <Info className="w-4 h-4 text-blue-500" />
            </button>
          </h3>
          {formData.tone && (
            <span className="text-sm text-blue-600 font-medium">
              선택됨: {TONE_DISPLAY_NAMES[formData.tone]}
            </span>
          )}
        </div>
        {expandedSection === 'tone' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>톤이란?</strong> AI가 응답할 때 사용할 어조를 의미합니다. 
              예를 들어 "친근한" 톤은 따뜻하고 편안한 느낌을, "전문적인" 톤은 신뢰감 있는 느낌을 줍니다.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TONE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              value={option.value}
              label={option.label}
              description={TONE_GUIDELINES[option.value]}
              isSelected={formData.tone === option.value}
              onClick={() => onChangeTone(formData.tone === option.value ? undefined : option.value)}
            />
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span>경력/난이도 (Experience)</span>
            <button
              onClick={() => setExpandedSection(expandedSection === 'experience' ? null : 'experience')}
              className="p-1 hover:bg-blue-50 rounded-lg transition-colors"
              title="설명 보기"
            >
              <Info className="w-4 h-4 text-blue-500" />
            </button>
          </h3>
          {formData.experience && (
            <span className="text-sm text-blue-600 font-medium">
              선택됨: {EXPERIENCE_DISPLAY_NAMES[formData.experience]}
            </span>
          )}
        </div>
        {expandedSection === 'experience' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>경력/난이도란?</strong> 사용자의 수준에 맞춰 설명의 깊이와 난이도를 조절합니다. 
              초급자는 기초부터, 전문가는 고급 내용까지 다룹니다.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXPERIENCE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              value={option.value}
              label={option.label}
              description={EXPERIENCE_GUIDELINES[option.value]}
              isSelected={formData.experience === option.value}
              onClick={() => onChangeExperience(formData.experience === option.value ? undefined : option.value)}
            />
          ))}
        </div>
      </div>

      {/* Style */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span>스타일 (Style)</span>
            <button
              onClick={() => setExpandedSection(expandedSection === 'style' ? null : 'style')}
              className="p-1 hover:bg-blue-50 rounded-lg transition-colors"
              title="설명 보기"
            >
              <Info className="w-4 h-4 text-blue-500" />
            </button>
          </h3>
          {formData.style && (
            <span className="text-sm text-blue-600 font-medium">
              선택됨: {STYLE_DISPLAY_NAMES[formData.style]}
            </span>
          )}
        </div>
        {expandedSection === 'style' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>스타일이란?</strong> 정보를 전달하는 형식을 의미합니다. 
              예를 들어 "서사형"은 이야기 형식으로, "글머리형"은 목록 형식으로 작성됩니다.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STYLE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              value={option.value}
              label={option.label}
              description={STYLE_GUIDELINES[option.value]}
              isSelected={formData.style === option.value}
              onClick={() => onChangeStyle(formData.style === option.value ? undefined : option.value)}
            />
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span>언어 (Language)</span>
            <button
              onClick={() => setExpandedSection(expandedSection === 'language' ? null : 'language')}
              className="p-1 hover:bg-blue-50 rounded-lg transition-colors"
              title="설명 보기"
            >
              <Info className="w-4 h-4 text-blue-500" />
            </button>
          </h3>
          {formData.language && (
            <span className="text-sm text-blue-600 font-medium">
              선택됨: {LANGUAGE_DISPLAY_NAMES[formData.language]}
            </span>
          )}
        </div>
        {expandedSection === 'language' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>언어란?</strong> AI가 응답할 때 사용할 언어를 선택합니다. 
              프롬프트의 언어와 일치시키는 것이 좋습니다.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChangeLanguage(formData.language === option.value ? undefined : option.value)}
              className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                formData.language === option.value
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md'
                  : 'border-neutral-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className={`text-xl font-bold ${formData.language === option.value ? 'text-blue-700' : 'text-neutral-900'}`}>
                  {option.label}
                </span>
                {formData.language === option.value && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
        <p className="text-sm text-amber-800">
          💡 <strong>선택사항</strong>이에요. 원하는 옵션만 선택하거나 모두 건너뛸 수 있어요!
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
          className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
        >
          다음
        </button>
      </div>
    </div>
  );
}

