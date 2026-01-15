import { Check } from 'lucide-react';

interface CreatePromptSuccessProps {
  onReset: () => void;
}

export function CreatePromptSuccess({ onReset }: CreatePromptSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-12 text-center max-w-md w-full shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-3">완료!</h1>
        <p className="text-neutral-500 text-lg mb-8">프롬프트가 등록되었어요</p>
        <button
          onClick={onReset}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
        >
          새 프롬프트 작성하기
        </button>
      </div>
    </div>
  );
}


