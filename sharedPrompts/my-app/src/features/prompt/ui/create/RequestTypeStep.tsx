import { Sparkles, Database, Settings2 } from 'lucide-react';
import type { CreatePromptRequestType } from '@/features/prompt/model/useCreatePromptView';
import { RequestType } from '@/features/prompt/types/prompt.types';

interface RequestTypeStepProps {
  selectedType: CreatePromptRequestType | null;
  onSelect: (type: CreatePromptRequestType) => void;
  onNext?: () => void;
}

const OPTIONS: { type: CreatePromptRequestType; label: string; description: string; icon: typeof Sparkles }[] = [
  {
    type: RequestType.SIMPLE,
    label: '간단 생성',
    description: '도메인·제목·내용·입력값만으로 빠르게 프롬프트를 만듭니다. 톤·스타일 등 기본 옵션만 선택해요.',
    icon: Sparkles,
  },
  {
    type: RequestType.EXTRACTION,
    label: '데이터 추출',
    description: '텍스트에서 구조화된 데이터를 뽑을 때 사용합니다. JSON 스키마를 필수로 입력하고, 제목·설명을 붙일 수 있어요.',
    icon: Database,
  },
  {
    type: RequestType.ADVANCED,
    label: '고급',
    description: '액션/역할 타입, 엔진 모드, 품질 파이프라인 등 세밀한 옵션을 쓰고 싶을 때 선택하세요.',
    icon: Settings2,
  },
];

export function RequestTypeStep({ selectedType, onSelect, onNext }: RequestTypeStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">어떤 방식으로 만들까요?</h2>
        <p className="text-neutral-600 text-lg">생성 타입에 따라 입력 단계와 옵션이 달라져요</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {OPTIONS.map(({ type, label, description, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            aria-pressed={selectedType === type}
            className={`text-left p-8 rounded-3xl border-2 transition-all hover:shadow-xl ${
              selectedType === type
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
                : 'border-neutral-200 bg-white hover:border-blue-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-2xl ${selectedType === type ? 'bg-blue-100' : 'bg-neutral-100'}`}>
                <Icon className={`w-8 h-8 ${selectedType === type ? 'text-blue-600' : 'text-neutral-600'}`} />
              </div>
              <span className="text-xl font-bold text-neutral-900">{label}</span>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
          </button>
        ))}
      </div>
      {selectedType && onNext && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onNext}
            className="py-4 px-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 shadow-lg"
          >
            다음 단계로 →
          </button>
        </div>
      )}
    </div>
  );
}
