import React from 'react';
import type { PromptBuilderState, UserOverrides } from '../types/prompt-builder.types';
import {
  TONE_DISPLAY_NAMES,
  EXPERIENCE_DISPLAY_NAMES,
  STYLE_DISPLAY_NAMES,
  LANGUAGE_DISPLAY_NAMES,
} from '@/features/prompt/model/shared/enumDisplayNames';
import { ACTION_TYPE_DISPLAY_NAMES_KO, ROLE_TYPE_DISPLAY_NAMES_KO } from '@/features/prompt/model/shared/actionRoleDisplayNames';

interface SemanticSettingsPanelProps {
  selectedAxes: PromptBuilderState['selectedAxes'];
  overrides: UserOverrides;
  axisSources: Record<string, string>;
  candidates?: {
    intentCandidates?: string[];
    roleCandidates?: string[];
    actionCandidates?: string[];
    toneCandidates?: string[];
    styleCandidates?: string[];
    languageCandidates?: string[];
    experienceCandidates?: string[];
  };
  onUpdateField: (field: keyof PromptBuilderState['selectedAxes'], value: string) => void;
  isLoading: boolean;
}

const AXIS_CONFIG = [
  { id: 'intent', label: 'Intent', type: 'select', candidatesKey: 'intentCandidates' },
  { id: 'roleType', label: 'Role', type: 'select', candidatesKey: 'roleCandidates' },
  { id: 'actionType', label: 'Action', type: 'select', candidatesKey: 'actionCandidates' },
  { id: 'tone', label: 'Tone', type: 'chips', candidatesKey: 'toneCandidates' },
  { id: 'style', label: 'Style', type: 'chips', candidatesKey: 'styleCandidates' },
  { id: 'language', label: 'Language', type: 'select', candidatesKey: 'languageCandidates' },
  { id: 'experience', label: 'Experience', type: 'select', candidatesKey: 'experienceCandidates' },
] as const;

const INTENT_DISPLAY_NAMES_KO: Record<string, string> = {
  CREATE: '생성/창작',
  GENERATE: '생성',
  BRAINSTORM: '브레인스토밍',
  REWRITE: '재작성',
  EDIT: '수정',
  REFINE: '다듬기',
  IMPROVE: '개선',
  ANALYZE: '분석',
  EVALUATE: '평가',
  COMPARE: '비교',
  CRITIQUE: '비평',
  DIAGNOSE: '진단',
  EXPLAIN: '설명',
  TEACH: '교육',
  SIMPLIFY: '단순화',
  SUMMARIZE: '요약',
  OUTLINE: '개요 작성',
  PLAN: '계획',
  STRATEGIZE: '전략 수립',
  PROPOSE: '제안',
  ORGANIZE: '정리',
  RECOMMEND: '추천',
  OPTIMIZE: '최적화',
  DECIDE: '결정',
  INVESTIGATE: '조사',
  SYNTHESIZE: '종합',
  EXPLORE: '탐색',
  EXTRACT: '추출',
  CLASSIFY: '분류',
  // Deprecated Fallbacks
  DEBUG: '디버깅',
  DESIGN: '디자인',
  CODE: '코드',
};

const getDisplayLabel = (id: string, opt: string) => {
  if (id === 'intent') return INTENT_DISPLAY_NAMES_KO[opt] || opt;
  if (id === 'actionType') return (ACTION_TYPE_DISPLAY_NAMES_KO as any)[opt] || opt;
  if (id === 'roleType') return (ROLE_TYPE_DISPLAY_NAMES_KO as any)[opt] || opt;
  if (id === 'tone') return (TONE_DISPLAY_NAMES as any)[opt] || opt;
  if (id === 'style') return (STYLE_DISPLAY_NAMES as any)[opt] || opt;
  if (id === 'language') return (LANGUAGE_DISPLAY_NAMES as any)[opt] || opt;
  if (id === 'experience') return (EXPERIENCE_DISPLAY_NAMES as any)[opt] || opt;
  return opt;
};

export const SemanticSettingsPanel: React.FC<SemanticSettingsPanelProps> = ({
  selectedAxes,
  axisSources,
  candidates = {},
  onUpdateField,
  isLoading,
}) => {
  const getSourceBadgeColor = (source?: string) => {
    if (!source) return 'bg-gray-100 text-gray-500 border-gray-200';
    
    // Backend returns enum-like strings, map them visually
    const s = source.toUpperCase();
    if (s.includes('AI') || s.includes('RECOMMENDED')) {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (s.includes('USER')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (s.includes('FALLBACK') || s.includes('DEFAULT')) {
      return 'bg-orange-100 text-orange-700 border-orange-200';
    }
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  const getSourceLabel = (source?: string) => {
    if (!source) return '';
    const s = source.toUpperCase();
    if (s.includes('AI') || s.includes('RECOMMENDED')) return 'AI Suggested';
    if (s.includes('USER')) return 'User Selected';
    if (s.includes('FALLBACK') || s.includes('DEFAULT')) return 'Fallback Applied';
    return source;
  };

  return (
    <div className="flex flex-col gap-6 p-4 border rounded-lg bg-white shadow-sm mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Semantic Settings</h3>
        {isLoading && (
          <span className="text-sm text-gray-500 animate-pulse">Fetching recommendations...</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AXIS_CONFIG.map(({ id, label, type, candidatesKey }) => {
          const value = selectedAxes[id as keyof PromptBuilderState['selectedAxes']];
          // Backend map may use snake_case or specific axis names.
          // Fallback to exact id or snake_case version of id
          const backendKey = id === 'roleType' ? 'role' : id === 'actionType' ? 'action' : id;
          const sourceRaw = axisSources[backendKey];
          
          const options: string[] = (candidates as any)[candidatesKey] || [];

          return (
            <div key={id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                {sourceRaw && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${getSourceBadgeColor(
                      sourceRaw
                    )}`}
                  >
                    {getSourceLabel(sourceRaw)}
                  </span>
                )}
              </div>

              {type === 'select' ? (
                <select
                  value={value as string}
                  onChange={(e) => onUpdateField(id as keyof PromptBuilderState['selectedAxes'], e.target.value)}
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select {label}</option>
                  {options.length > 0 ? (
                    options.map((opt) => (
                      <option key={opt} value={opt}>
                        {getDisplayLabel(id, opt)}
                      </option>
                    ))
                  ) : (
                    // Fallback to show current value if no candidates
                    value && <option value={value as string}>{getDisplayLabel(id, value as string)}</option>
                  )}
                </select>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {options.length > 0 ? (
                    options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => onUpdateField(id as keyof PromptBuilderState['selectedAxes'], opt)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          value === opt
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {getDisplayLabel(id, opt)}
                      </button>
                    ))
                  ) : (
                    <input 
                      type="text" 
                      value={value as string}
                      onChange={(e) => onUpdateField(id as keyof PromptBuilderState['selectedAxes'], e.target.value)}
                      placeholder={`Enter ${label}`}
                      className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
