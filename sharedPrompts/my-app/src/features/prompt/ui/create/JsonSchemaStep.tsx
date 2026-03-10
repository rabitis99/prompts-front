import type { CreatePromptFormData } from '@/features/prompt/model/create/useCreatePromptView';

const isValidJson = (str: string): boolean => {
  if (!str.trim()) return true;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

interface JsonSchemaStepProps {
  formData: CreatePromptFormData;
  required: boolean;
  onChangeJsonSchema: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}

export function JsonSchemaStep({
  formData,
  required,
  onChangeJsonSchema,
  onPrev,
  onNext,
  canNext,
}: JsonSchemaStepProps) {
  const isJsonValid = isValidJson(formData.jsonSchema);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">JSON 스키마를 입력하세요</h2>
        <p className="text-neutral-600 text-lg">
          {required
            ? '추출할 데이터의 구조를 JSON Schema 형식으로 정의해주세요 (필수)'
            : '원하면 출력 구조를 JSON Schema로 지정할 수 있어요 (선택)'}
        </p>
      </div>
      <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
        <textarea
          id="prompt-json-schema"
          value={formData.jsonSchema}
          onChange={(e) => onChangeJsonSchema(e.target.value)}
          aria-label="JSON 스키마 입력"
          placeholder='예: { "type": "object", "properties": { "name": { "type": "string" }, "age": { "type": "number" } }, "required": ["name"] }'
          rows={14}
          maxLength={20000}
          className="w-full font-mono text-sm text-neutral-900 outline-none resize-none placeholder:text-neutral-400 leading-relaxed border border-neutral-200 rounded-xl p-4"
        />
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-neutral-100">
          <span
            className={`text-sm font-medium ${
              !isJsonValid
                ? 'text-red-600'
                : required
                ? formData.jsonSchema.trim().length >= 10
                  ? 'text-emerald-600'
                  : 'text-amber-600'
                : 'text-neutral-400'
            }`}
          >
            {!isJsonValid
              ? '유효하지 않은 JSON 형식입니다'
              : required
              ? formData.jsonSchema.trim().length >= 10
                ? '✓ 스키마가 입력되었어요'
                : '최소 10자 이상 입력 (필수)'
              : '선택 항목이에요'}
          </span>
          <span className="text-sm text-neutral-400">{formData.jsonSchema.length}자 / 20,000자</span>
        </div>
      </div>
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <p className="text-sm text-blue-800">
          JSON Schema는 추출 결과의 필드 이름, 타입, 필수 여부 등을 정의합니다. 모르면 예시를 검색해 참고해보세요.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 py-4 bg-white text-neutral-700 rounded-2xl font-semibold hover:bg-neutral-50 transition-all border-2 border-neutral-200"
        >
          이전
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={(required ? !canNext : false) || !isJsonValid}
          className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
  );
}
