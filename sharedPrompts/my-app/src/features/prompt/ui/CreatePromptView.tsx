import { ArrowLeft } from 'lucide-react';
import { useCreatePromptView, getCurrentStepId, getTotalStepCount } from '@/features/prompt/model/useCreatePromptView';
import { DOMAINS, POPULAR_TAGS, CATEGORY_EXAMPLES } from '@/features/prompt/model/createPrompt.constants';
import { CreatePromptSuccess } from '@/features/prompt/ui/create/CreatePromptSuccess';
import { RequestTypeStep } from '@/features/prompt/ui/create/RequestTypeStep';
import { DomainStep } from '@/features/prompt/ui/create/DomainStep';
import { TitleStep } from '@/features/prompt/ui/create/TitleStep';
import { BodyStep } from '@/features/prompt/ui/create/BodyStep';
import { InputStep } from '@/features/prompt/ui/create/InputStep';
import { JsonSchemaStep } from '@/features/prompt/ui/create/JsonSchemaStep';
import { LanguageStep } from '@/features/prompt/ui/create/LanguageStep';
import { AdvancedOptionsStep } from '@/features/prompt/ui/create/AdvancedOptionsStep';
import { PublicStep } from '@/features/prompt/ui/create/PublicStep';
import { TagsStep } from '@/features/prompt/ui/create/TagsStep';

const STEP_LABELS: Record<string, string> = {
  type: '생성 타입',
  domain: '분야',
  title: '제목',
  body: '내용',
  input: '입력값',
  jsonSchema: 'JSON 스키마',
  description: '설명',
  language: '언어',
  advanced: '추가 옵션',
  public: '공개 설정',
  tags: '태그',
};

export function CreatePromptView() {
  const {
    formData,
    tagInput,
    isSaving,
    saved,
    currentStep,
    setFormData,
    setTagInput,
    setCurrentStep,
    handleAddTag,
    handleRemoveTag,
    handleSubmit,
    handleReset,
    handleBack,
    handleDomainSelect,
    handleRequestTypeSelect,
    handleLoadExample,
    handleChangeTone,
    handleChangeExperience,
    handleChangeStyle,
    handleChangeLanguage,
    handleChangeActionType,
    handleChangeRoleType,
    handleChangePublic,
    canGoNext,
  } = useCreatePromptView();

  if (saved) {
    return <CreatePromptSuccess onReset={handleReset} />;
  }

  const stepId = getCurrentStepId(formData.requestType, currentStep);
  const totalSteps = getTotalStepCount(formData.requestType);
  const selectedDomain = DOMAINS.find((d) => d.id === formData.domain);
  const categoryExample = formData.domain ? CATEGORY_EXAMPLES[formData.domain] : null;
  const popularTagsForDomain =
    formData.domain && POPULAR_TAGS[formData.domain] ? POPULAR_TAGS[formData.domain] : [];

  const goPrev = () => setCurrentStep((s) => Math.max(0, s - 1));
  const goNext = () =>
    setCurrentStep((s) => Math.min(s + 1, Math.max(0, totalSteps - 1)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <header className="bg-white border-b border-blue-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="뒤로가기"
              className="p-2 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>
            <h1 className="text-2xl font-bold text-neutral-900">프롬프트 만들기</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center flex-shrink-0">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all text-sm ${
                    currentStep >= i
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white text-neutral-400 border-2 border-neutral-200'
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 rounded-full transition-all ${
                      currentStep > i ? 'bg-blue-500' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-500 font-medium">
              {stepId ? STEP_LABELS[stepId] ?? stepId : '생성 타입을 선택하세요'}
            </p>
          </div>
        </div>

        {/* Step 0: 타입 선택 */}
        {stepId === 'type' && (
          <RequestTypeStep
            selectedType={formData.requestType}
            onSelect={handleRequestTypeSelect}
            onNext={goNext}
          />
        )}

        {/* SIMPLE / ADVANCED: Domain */}
        {stepId === 'domain' && (
          <DomainStep
            formData={formData}
            onSelectDomain={handleDomainSelect}
            onPrev={goPrev}
          />
        )}

        {/* Title (SIMPLE, EXTRACTION, ADVANCED) */}
        {stepId === 'title' && (
          <TitleStep
            formData={formData}
            currentDomain={selectedDomain}
            example={categoryExample}
            onChangeTitle={(title) => setFormData((prev) => ({ ...prev, title }))}
            onPrev={goPrev}
            onNext={goNext}
            canNext={canGoNext()}
          />
        )}

        {/* Body (SIMPLE, ADVANCED) / Description (EXTRACTION) */}
        {stepId === 'body' && (
          <BodyStep
            variant="body"
            formData={formData}
            currentDomain={selectedDomain}
            example={categoryExample}
            onChangeBody={(body) => setFormData((prev) => ({ ...prev, promptBody: body }))}
            onPrev={goPrev}
            onNext={goNext}
            onLoadExample={handleLoadExample}
            canNext={canGoNext()}
          />
        )}

        {stepId === 'description' && (
          <BodyStep
            variant="description"
            formData={formData}
            currentDomain={undefined}
            example={null}
            onChangeBody={(body) => setFormData((prev) => ({ ...prev, promptBody: body }))}
            onPrev={goPrev}
            onNext={goNext}
            onLoadExample={() => {}}
            canNext={canGoNext()}
          />
        )}

        {/* Input */}
        {stepId === 'input' && (
          <InputStep
            formData={formData}
            onChangeInput={(input) => setFormData((prev) => ({ ...prev, input }))}
            onPrev={goPrev}
            onNext={goNext}
            canNext={canGoNext()}
          />
        )}

        {/* JSON Schema (EXTRACTION 필수, ADVANCED 선택) */}
        {stepId === 'jsonSchema' && (
          <JsonSchemaStep
            formData={formData}
            required={formData.requestType === 'EXTRACTION'}
            onChangeJsonSchema={(v) => setFormData((prev) => ({ ...prev, jsonSchema: v }))}
            onPrev={goPrev}
            onNext={goNext}
            canNext={canGoNext()}
          />
        )}

        {/* EXTRACTION: Language만 */}
        {stepId === 'language' && formData.requestType === 'EXTRACTION' && (
          <LanguageStep
            formData={formData}
            onChangeLanguage={handleChangeLanguage}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}

        {/* SIMPLE: 톤/스타일/언어/경력만 | ADVANCED: 전체 */}
        {stepId === 'advanced' && (
          <AdvancedOptionsStep
            formData={formData}
            variant={formData.requestType === 'SIMPLE' ? 'simple' : 'advanced'}
            onChangeTone={handleChangeTone}
            onChangeExperience={handleChangeExperience}
            onChangeStyle={handleChangeStyle}
            onChangeLanguage={handleChangeLanguage}
            onChangeActionType={handleChangeActionType}
            onChangeRoleType={handleChangeRoleType}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}

        {/* Public */}
        {stepId === 'public' && (
          <PublicStep
            formData={formData}
            onChangePublic={handleChangePublic}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}

        {/* Tags */}
        {stepId === 'tags' && (
          <TagsStep
            formData={formData}
            tagInput={tagInput}
            popularTags={popularTagsForDomain}
            isSaving={isSaving}
            canSubmit={canGoNext()}
            onChangeTagInput={setTagInput}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onPrev={goPrev}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  );
}
