import { ArrowLeft } from 'lucide-react';
import { useCreatePromptView } from '@/features/prompt/model/useCreatePromptView';
import { DOMAINS, POPULAR_TAGS, CATEGORY_EXAMPLES } from '@/features/prompt/model/createPrompt.constants';
import { CreatePromptSuccess } from '@/features/prompt/ui/create/CreatePromptSuccess';
import { DomainStep } from '@/features/prompt/ui/create/DomainStep';
import { TitleStep } from '@/features/prompt/ui/create/TitleStep';
import { BodyStep } from '@/features/prompt/ui/create/BodyStep';
import { InputStep } from '@/features/prompt/ui/create/InputStep';
import { AdvancedOptionsStep } from '@/features/prompt/ui/create/AdvancedOptionsStep';
import { PublicStep } from '@/features/prompt/ui/create/PublicStep';
import { TagsStep } from '@/features/prompt/ui/create/TagsStep';

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
    handleLoadExample,
    canGoNext,
  } = useCreatePromptView();

  if (saved) {
    return <CreatePromptSuccess onReset={handleReset} />;
  }

  const selectedDomain = DOMAINS.find((d) => d.id === formData.domain);
  const categoryExample = formData.domain ? CATEGORY_EXAMPLES[formData.domain] : null;
  const popularTagsForDomain =
    formData.domain && POPULAR_TAGS[formData.domain] ? POPULAR_TAGS[formData.domain] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-blue-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
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
            {[1, 2, 3, 4, 5, 6, 7].map(step => (
              <div key={step} className="flex items-center flex-shrink-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all text-sm ${
                  currentStep >= step 
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg' 
                    : 'bg-white text-neutral-400 border-2 border-neutral-200'
                }`}>
                  {step}
                </div>
                {step < 7 && (
                  <div className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 rounded-full transition-all ${
                    currentStep > step ? 'bg-blue-500' : 'bg-neutral-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-500 font-medium">
              {currentStep === 1 && '어떤 분야의 프롬프트인가요?'}
              {currentStep === 2 && '프롬프트 제목을 입력하세요'}
              {currentStep === 3 && '프롬프트 내용을 작성하세요'}
              {currentStep === 4 && '입력값을 입력하세요'}
              {currentStep === 5 && '추가 옵션을 선택하세요 (선택)'}
              {currentStep === 6 && '공개 설정을 선택하세요'}
              {currentStep === 7 && '태그를 추가하세요 (선택)'}
            </p>
          </div>
        </div>

        {/* Step 1: Domain */}
        {currentStep === 1 && (
          <DomainStep formData={formData} onSelectDomain={handleDomainSelect} />
        )}

        {/* Step 2: Title */}
        {currentStep === 2 && (
          <TitleStep
            formData={formData}
            currentDomain={selectedDomain}
            example={categoryExample}
            onChangeTitle={(title) => setFormData({ ...formData, title })}
            onPrev={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
            canNext={canGoNext()}
          />
        )}

        {/* Step 3: Prompt Body */}
        {currentStep === 3 && (
          <BodyStep
            formData={formData}
            currentDomain={selectedDomain}
            example={categoryExample}
            onChangeBody={(body) => setFormData({ ...formData, promptBody: body })}
            onPrev={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
            onLoadExample={handleLoadExample}
            canNext={canGoNext()}
          />
        )}

        {/* Step 4: Input */}
        {currentStep === 4 && (
          <InputStep
            formData={formData}
            onChangeInput={(input) => setFormData({ ...formData, input })}
            onPrev={() => setCurrentStep(3)}
            onNext={() => setCurrentStep(5)}
            canNext={canGoNext()}
          />
        )}

        {/* Step 5: Advanced Options */}
        {currentStep === 5 && (
          <AdvancedOptionsStep
            formData={formData}
            onChangeTone={(tone) => setFormData({ ...formData, tone })}
            onChangeExperience={(experience) => setFormData({ ...formData, experience })}
            onChangeStyle={(style) => setFormData({ ...formData, style })}
            onChangeLanguage={(language) => setFormData({ ...formData, language })}
            onPrev={() => setCurrentStep(4)}
            onNext={() => setCurrentStep(6)}
          />
        )}

        {/* Step 6: Public Setting */}
        {currentStep === 6 && (
          <PublicStep
            formData={formData}
            onChangePublic={(isPublic) => setFormData({ ...formData, isPublic })}
            onPrev={() => setCurrentStep(5)}
            onNext={() => setCurrentStep(7)}
          />
        )}

        {/* Step 7: Tags */}
        {currentStep === 7 && (
          <TagsStep
            formData={formData}
            tagInput={tagInput}
            popularTags={popularTagsForDomain}
            isSaving={isSaving}
            canSubmit={canGoNext()}
            onChangeTagInput={setTagInput}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onPrev={() => setCurrentStep(6)}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  );
}

