import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { recommendPrompts } from '../api/prompt-builder.api';
import type { PromptBuilderState, UserOverrides } from '../types/prompt-builder.types';

const INITIAL_STATE: PromptBuilderState = {
  rawInput: '',
  category: '',
  selectedAxes: {
    intent: '',
    roleType: '',
    actionType: '',
    tone: '',
    style: '',
    language: '',
    experience: '',
  }
};

const INITIAL_OVERRIDES: UserOverrides = {
  intent: false,
  roleType: false,
  actionType: false,
  tone: false,
  style: false,
  language: false,
  experience: false,
};

export function usePromptRecommendations() {
  const [state, setState] = useState<PromptBuilderState>(INITIAL_STATE);
  const [overrides, setOverrides] = useState<UserOverrides>(INITIAL_OVERRIDES);
  const [axisSources, setAxisSources] = useState<Record<string, string>>({});
  
  const debouncedRawInput = useDebounce(state.rawInput, 500);

  const { data: recommendations, isLoading, isError } = useQuery({
    queryKey: ['promptRecommendations', debouncedRawInput, state.category],
    queryFn: () => 
      recommendPrompts({
        request_mode: 'SIMPLE',
        category: state.category || undefined,
        raw_input: debouncedRawInput,
      }),
    enabled: debouncedRawInput.length > 2,
    staleTime: 1000 * 60 * 5,
  });

  // Apply recommendations automatically for fields not overridden by the user
  useEffect(() => {
    if (recommendations) {
      setState(prev => {
        const nextState = { ...prev, selectedAxes: { ...prev.selectedAxes } };
        let hasChanges = false;

        const updateField = (
          field: keyof PromptBuilderState['selectedAxes'],
          recommendedValue?: string
        ) => {
          if (!overrides[field] && recommendedValue && prev.selectedAxes[field] !== recommendedValue) {
            nextState.selectedAxes[field] = recommendedValue;
            hasChanges = true;
          }
        };

        updateField('intent', recommendations.recommended_intent);
        updateField('roleType', recommendations.recommended_role);
        updateField('actionType', recommendations.recommended_action);
        updateField('tone', recommendations.recommended_tone);
        updateField('style', recommendations.recommended_style);
        
        // The backend doesn't seem to actively recommend language/experience in RecommendPromptResponse
        // But if it did, we would apply them here.

        return hasChanges ? nextState : prev;
      });

      if (recommendations.axis_sources) {
        setAxisSources(prev => {
          const userSelected = Object.fromEntries(
            Object.entries(prev).filter(([_, val]) => val === 'USER_SELECTED')
          );
          return {
            ...recommendations.axis_sources,
            ...userSelected,
          };
        });
      }
    }
  }, [recommendations, overrides]);

  const updateRawInput = useCallback((text: string) => {
    setState(prev => ({ ...prev, rawInput: text }));
  }, []);

  const updateCategory = useCallback((category: string) => {
    setState(prev => ({ ...prev, category }));
  }, []);

  const updateField = useCallback((field: keyof PromptBuilderState['selectedAxes'], value: string) => {
    setState(prev => ({
      ...prev,
      selectedAxes: { ...prev.selectedAxes, [field]: value }
    }));
    setOverrides(prev => ({ ...prev, [field]: true }));
    // Optimistically mark as User Selected, matching backend's potential terminology
    const backendKey = field === 'roleType' ? 'role' : field === 'actionType' ? 'action' : field;
    setAxisSources(prev => ({ ...prev, [backendKey]: 'USER_SELECTED' }));
  }, []);

  const resetBuilder = useCallback(() => {
    setState(INITIAL_STATE);
    setOverrides(INITIAL_OVERRIDES);
    setAxisSources({});
  }, []);

  return {
    state,
    overrides,
    axisSources,
    recommendations,
    isLoading,
    isError,
    updateRawInput,
    updateCategory,
    updateField,
    resetBuilder,
  };
}
