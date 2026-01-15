import type { CreatePromptFormData } from '@/features/prompt/model/useCreatePromptView';
import { DOMAINS } from '@/features/prompt/model/createPrompt.constants';

interface DomainStepProps {
  formData: CreatePromptFormData;
  onSelectDomain: (domainId: string) => void;
}

export function DomainStep({ formData, onSelectDomain }: DomainStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">어떤 분야인가요?</h2>
        <p className="text-neutral-600 text-lg">카테고리를 선택해주세요</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {DOMAINS.map((domain) => (
          <button
            key={domain.id}
            onClick={() => onSelectDomain(domain.id)}
            className={`group p-8 rounded-3xl border-2 transition-all hover:scale-105 ${
              formData.domain === domain.id
                ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl'
                : 'border-neutral-200 bg-white hover:border-blue-200 hover:shadow-lg'
            }`}
          >
            <div className="text-5xl mb-4">{domain.emoji}</div>
            <div className="text-xl font-bold text-neutral-900">{domain.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}


