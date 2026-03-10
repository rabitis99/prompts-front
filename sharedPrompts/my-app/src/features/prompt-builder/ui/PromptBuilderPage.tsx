import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PromptInputPanel } from './PromptInputPanel';
import { SemanticSettingsPanel } from './SemanticSettingsPanel';
import { PromptResultPanel } from './PromptResultPanel';
import { usePromptRecommendations } from '../model/usePromptRecommendations';
import { generateConfirmedPrompt } from '../api/prompt-builder.api';
import type { UnifiedGeneratePromptResponse } from '../types/prompt-builder.types';
import { ArrowLeft } from 'lucide-react';
import {
  TONE_DISPLAY_NAMES,
  EXPERIENCE_DISPLAY_NAMES,
  STYLE_DISPLAY_NAMES,
  LANGUAGE_DISPLAY_NAMES,
} from '@/features/prompt/model/shared/enumDisplayNames';
import { ActionIntent, PromptCategory } from '@/features/prompt/types/prompt.types';
import { getActionTypesForCategory, getRoleTypesForCategory } from '@/features/prompt/types/category-mapping.types';

import { CreatePromptSuccess } from '@/features/prompt/ui/create/CreatePromptSuccess';

export const PromptBuilderPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [saved, setSaved] = useState(false);

  const handleBack = () => {
    navigate('/feed'); // or navigate(-1)
  };

  const fallbackIntents = Object.values(ActionIntent).filter(i => i !== 'DEBUG' && i !== 'DESIGN' && i !== 'CODE');
  const fallbackRoles = state.category ? (getRoleTypesForCategory(state.category as PromptCategory) || []) : [];
  const fallbackActions = state.category ? (getActionTypesForCategory(state.category as PromptCategory) || []) : [];

  const validIntents = recommendations?.intent_candidates?.filter(Boolean) || [];
  const validRoles = recommendations?.role_candidates?.filter(Boolean) || [];
  const validActions = recommendations?.action_candidates?.filter(Boolean) || [];

  const resolvedIntents = validIntents.length > 0 ? validIntents : fallbackIntents;
  const resolvedRoles = validRoles.length > 0 ? validRoles : fallbackRoles;
  const resolvedActions = validActions.length > 0 ? validActions : fallbackActions;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationResult(null);
    setSaved(false);
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
      setSaved(true);
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

  if (saved) {
    return <CreatePromptSuccess onReset={() => {
      setSaved(false);
      setGenerationResult(null);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <header className="bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="뒤로가기"
              className="p-2 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>
            <h1 className="text-2xl font-bold text-neutral-900">AI Prompt Builder</h1>
            <p className="ml-4 mt-1 text-gray-600">Tell us what you want to create, and we'll automatically suggest the best settings.</p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto max-w-7xl px-4 py-8 h-full">
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
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 text-sm text-amber-700 bg-amber-50 rounded-md border border-amber-200"
              >
                추천을 불러오는 데 실패했습니다. 수동으로 설정을 선택해주세요.
              </div>
            )}

            <SemanticSettingsPanel
              selectedAxes={state.selectedAxes}
              overrides={overrides}
              axisSources={axisSources}
              candidates={{
                intentCandidates: resolvedIntents,
                roleCandidates: resolvedRoles,
                actionCandidates: resolvedActions,
                toneCandidates: Object.keys(TONE_DISPLAY_NAMES),
                styleCandidates: Object.keys(STYLE_DISPLAY_NAMES),
                languageCandidates: Object.keys(LANGUAGE_DISPLAY_NAMES),
                experienceCandidates: Object.keys(EXPERIENCE_DISPLAY_NAMES),
              }}
              onUpdateField={updateField}
              isLoading={isRecommending}
            />
          </div>

          {/* Right Column: Preview & Output */}
          <div className="lg:col-span-5 h-[calc(100vh-12rem)] sticky top-8">
            {generationError && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md border border-red-200"
              >
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
      </main>
    </div>
  );
};
