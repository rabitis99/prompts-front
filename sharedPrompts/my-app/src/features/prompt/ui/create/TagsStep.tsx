import type { CreatePromptFormData } from '@/features/prompt/model/useCreatePromptView';

interface TagsStepProps {
  formData: CreatePromptFormData;
  tagInput: string;
  popularTags: string[];
  isSaving: boolean;
  canSubmit: boolean;
  onChangeTagInput: (value: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onPrev: () => void;
  onSubmit: () => void;
}

export function TagsStep({
  formData,
  tagInput,
  popularTags,
  isSaving,
  canSubmit,
  onChangeTagInput,
  onAddTag,
  onRemoveTag,
  onPrev,
  onSubmit,
}: TagsStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">태그를 추가하세요</h2>
        <p className="text-neutral-600 text-lg">검색하기 쉽도록 관련 키워드를 추가해주세요</p>
      </div>
      <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
        <div className="flex flex-wrap gap-2 mb-6">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 text-blue-700 text-sm font-semibold"
            >
              #{tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="hover:text-blue-900"
              >
                ✕
              </button>
            </span>
          ))}
          {formData.tags.length < 5 && (
            <input
              type="text"
              value={tagInput}
              onChange={(e) => onChangeTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddTag(tagInput);
                }
              }}
              placeholder="태그 입력 후 Enter"
              className="flex-1 min-w-[150px] px-4 py-2 rounded-xl border-2 border-dashed border-blue-200 outline-none text-sm focus:border-blue-400"
            />
          )}
        </div>
        {popularTags.length > 0 && (
          <div>
            <p className="text-sm text-neutral-500 mb-3 font-medium">추천 태그:</p>
            <div className="flex flex-wrap gap-2">
              {popularTags
                .filter((t) => !formData.tags.includes(t))
                .map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onAddTag(tag)}
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
        <p className="text-sm text-amber-800">
          💡 <strong>선택사항</strong>이에요. 태그 없이도 바로 등록할 수 있어요!
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
          onClick={onSubmit}
          disabled={isSaving || !canSubmit}
          className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? '저장 중...' : '완료하기'}
        </button>
      </div>
    </div>
  );
}


