import { Globe, Lock } from 'lucide-react';
import type { CreatePromptFormData } from '@/features/prompt/model/useCreatePromptView';

interface PublicStepProps {
  formData: CreatePromptFormData;
  onChangePublic: (isPublic: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function PublicStep({ formData, onChangePublic, onPrev, onNext }: PublicStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">공개 설정</h2>
        <p className="text-neutral-600 text-lg">프롬프트를 공개할지 비공개로 유지할지 선택하세요</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Public Option */}
        <button
          onClick={() => onChangePublic(true)}
          className={`p-8 rounded-3xl border-2 transition-all hover:scale-105 ${
            formData.isPublic
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl'
              : 'border-neutral-200 bg-white hover:border-blue-200 hover:shadow-lg'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              formData.isPublic ? 'bg-blue-500' : 'bg-neutral-200'
            }`}>
              <Globe className={`w-8 h-8 ${formData.isPublic ? 'text-white' : 'text-neutral-400'}`} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">공개</h3>
            <p className="text-sm text-neutral-600 text-center">
              모든 사용자가 검색하고 사용할 수 있습니다
            </p>
          </div>
        </button>

        {/* Private Option */}
        <button
          onClick={() => onChangePublic(false)}
          className={`p-8 rounded-3xl border-2 transition-all hover:scale-105 ${
            !formData.isPublic
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl'
              : 'border-neutral-200 bg-white hover:border-blue-200 hover:shadow-lg'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              !formData.isPublic ? 'bg-blue-500' : 'bg-neutral-200'
            }`}>
              <Lock className={`w-8 h-8 ${!formData.isPublic ? 'text-white' : 'text-neutral-400'}`} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">비공개</h3>
            <p className="text-sm text-neutral-600 text-center">
              나만 볼 수 있습니다
            </p>
          </div>
        </button>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          💡 공개 설정 안내
        </h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• 공개: 다른 사용자들이 검색하고 좋아요, 댓글을 남길 수 있습니다</li>
          <li>• 비공개: 나만 볼 수 있으며, 나중에 언제든지 공개로 변경할 수 있습니다</li>
        </ul>
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

