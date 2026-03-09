import React, { useState } from 'react';
import { PromptInputPanel } from './PromptInputPanel';
import { SemanticSettingsPanel } from './SemanticSettingsPanel';
import { PromptResultPanel } from './PromptResultPanel';
import { usePromptRecommendations } from '../model/usePromptRecommendations';
import { generateConfirmedPrompt } from '../api/prompt-builder.api';
import type { UnifiedGeneratePromptResponse } from '../types/prompt-builder.types';

export const PromptBuilderPage: React.FC = () => {
  const {
    state,
    overrides,
    axisSources,
    recommendations,
    isLoading: isRecommending,
    isError: isRecommendError,
    updateRawInput,
    updateCategory,
    updateField,
  } = usePromptRecommendations();

  const [generationResult, setGenerationResult] = useState<UnifiedGeneratePromptResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationResult(null);
    try {
      const response = await generateConfirmedPrompt({
        request_mode: 'SIMPLE',
        category: state.category || 'GENERAL', // Backend may require category
        intent: state.selectedAxes.intent.trim(),
        role_type: state.selectedAxes.roleType || undefined,
        action_type: state.selectedAxes.actionType || undefined,
        tone: state.selectedAxes.tone || undefined,
        style: state.selectedAxes.style || undefined,
        language: state.selectedAxes.language || undefined,
        experience: state.selectedAxes.experience || undefined,
        input: state.rawInput.trim(),
      });
      setGenerationResult(response);
    } catch (error) {
      console.error('Failed to generate prompt', error);
      setGenerationError('Failed to generate prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate =
    state.rawInput.trim().length > 0 &&
    state.selectedAxes.intent.trim().length > 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 min-h-screen bg-gray-50/50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Prompt Builder</h1>
        <p className="mt-2 text-gray-600">Tell us what you want to create, and we'll automatically suggest the best settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Left Column: Input & Settings */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <PromptInputPanel
            rawInput={state.rawInput}
            onRawInputChange={updateRawInput}
            category={state.category}
            onCategoryChange={updateCategory}
          />
          
          {isRecommendError && (
            <div className="p-3 text-sm text-amber-700 bg-amber-50 rounded-md border border-amber-200">
              추천을 불러오는 데 실패했습니다. 수동으로 설정을 선택해주세요.
            </div>
          )}

          <SemanticSettingsPanel
            selectedAxes={state.selectedAxes}
            overrides={overrides}
            axisSources={axisSources}
            candidates={{
              intentCandidates: recommendations?.intent_candidates || [],
              roleCandidates: recommendations?.role_candidates || [],
              actionCandidates: recommendations?.action_candidates || [],
            }}
            onUpdateField={updateField}
            isLoading={isRecommending}
          />
        </div>

        {/* Right Column: Preview & Output */}
        <div className="lg:col-span-5 h-[calc(100vh-12rem)] sticky top-8">
          {generationError && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md border border-red-200">
              {generationError}
            </div>
          )}
          <PromptResultPanel
            generationResult={generationResult}
            isLoading={isGenerating}
            onGenerate={handleGenerate}
            canGenerate={canGenerate}
          />
        </div>
      </div>
    </div>
  );
};
