import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { promptApi } from '@/features/prompt/api/prompt.api';
import type { ToneType, ExperienceLevel, StyleType, LanguageType, RequestTypeValue } from '@/features/prompt/types/prompt.types';
import { ActionIntent } from '@/features/prompt/types/prompt.types';
import type { EngineMode } from '@/features/prompt/types/prompt.types';
import type { ActionType, RoleType } from '@/features/prompt/types';
import { DOMAINS, CATEGORY_EXAMPLES } from './createPrompt.constants';

export type CreatePromptRequestType = RequestTypeValue;

export type StepId =
  | 'type'
  | 'domain'
  | 'title'
  | 'body'
  | 'input'
  | 'jsonSchema'
  | 'description'
  | 'language'
  | 'advanced'
  | 'public'
  | 'tags';

const SIMPLE_STEPS: StepId[] = ['domain', 'title', 'body', 'input', 'advanced', 'public', 'tags'];
const EXTRACTION_STEPS: StepId[] = ['input', 'jsonSchema', 'title', 'description', 'language', 'public', 'tags'];
const ADVANCED_STEPS: StepId[] = ['domain', 'title', 'body', 'input', 'jsonSchema', 'advanced', 'public', 'tags'];

export function getStepsForRequestType(requestType: CreatePromptRequestType | null): StepId[] {
  if (!requestType) return [];
  if (requestType === 'SIMPLE') return SIMPLE_STEPS;
  if (requestType === 'EXTRACTION') return EXTRACTION_STEPS;
  return ADVANCED_STEPS;
}

export function getTotalStepCount(requestType: CreatePromptRequestType | null): number {
  if (!requestType) return 1;
  return 1 + getStepsForRequestType(requestType).length;
}

export function getCurrentStepId(requestType: CreatePromptRequestType | null, stepIndex: number): StepId | null {
  if (stepIndex === 0) return 'type';
  const steps = getStepsForRequestType(requestType);
  return steps[stepIndex - 1] ?? null;
}

export interface CreatePromptFormData {
  requestType: CreatePromptRequestType | null;
  title: string;
  promptBody: string;
  input: string;
  domain: string;
  tags: string[];
  isPublic: boolean;
  jsonSchema: string;
  engineMode?: string;
  disableQualityPipeline?: boolean;
  coreRole?: string;
  domainRole?: string;
  actionType?: ActionType;
  roleType?: RoleType;
  tone?: ToneType;
  experience?: ExperienceLevel;
  style?: StyleType;
  language?: LanguageType;
}

const INITIAL_FORM_DATA: CreatePromptFormData = {
  requestType: null,
  title: '',
  promptBody: '',
  input: '',
  domain: '',
  tags: [],
  isPublic: true,
  jsonSchema: '',
  engineMode: undefined,
  disableQualityPipeline: false,
  coreRole: undefined,
  domainRole: undefined,
  actionType: undefined,
  roleType: undefined,
  tone: undefined,
  experience: undefined,
  style: undefined,
  language: undefined,
};

export function useCreatePromptView() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreatePromptFormData>(INITIAL_FORM_DATA);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) return;
    if (formData.tags.includes(trimmed)) {
      // toast.warn('이미 추가된 태그입니다.');
      return;
    }
    if (trimmed.length > 50) {
      // toast.warn('태그는 50자 이내로 입력해주세요.');
      return;
    }
    if (formData.tags.length >= 20) {
      // toast.warn('태그는 최대 20개까지 추가할 수 있습니다.');
      return;
    }
    setFormData({ ...formData, tags: [...formData.tags, trimmed] });
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async () => {
    if (!formData.requestType || !canGoNext()) return;

    setIsSaving(true);
    try {
      if (formData.requestType === 'SIMPLE') {
        const selectedDomain = DOMAINS.find(d => d.id === formData.domain);
        if (!selectedDomain) {
          throw new Error('도메인을 선택해주세요');
        }
        const res = await promptApi.generatePrompt({
          request_type: 'SIMPLE',
          category: selectedDomain.category,
          intent: ActionIntent.GENERATE,
          variant: undefined,
          input: formData.input,
          tone: formData.tone,
          style: formData.style,
          language: formData.language,
          experience: formData.experience,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
          title: formData.title || undefined,
          description: formData.promptBody || undefined,
        });
        const created = res.data?.data;
        if (created?.id != null) {
          await promptApi.updatePrompt(created.id, { is_public: formData.isPublic });
        }
        setSaved(true);
        return;
      }

      if (formData.requestType === 'EXTRACTION') {
        const res = await promptApi.generatePrompt({
          request_type: 'EXTRACTION',
          input: formData.input,
          json_schema: formData.jsonSchema,
          language: formData.language,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
          title: formData.title || undefined,
          description: formData.promptBody || undefined,
        });
        const created = res.data?.data;
        if (created?.id != null) {
          await promptApi.updatePrompt(created.id, { is_public: formData.isPublic });
        }
        setSaved(true);
        return;
      }

      if (formData.requestType === 'ADVANCED') {
        const selectedDomain = DOMAINS.find(d => d.id === formData.domain);
        if (!selectedDomain) {
          throw new Error('도메인을 선택해주세요');
        }
        const res = await promptApi.generatePrompt({
          request_type: 'ADVANCED',
          category: selectedDomain.category,
          intent: ActionIntent.GENERATE,
          variant: undefined,
          input: formData.input,
          json_schema: formData.jsonSchema || undefined,
          engine_mode: formData.engineMode as EngineMode | undefined,
          tone: formData.tone,
          style: formData.style,
          language: formData.language,
          experience: formData.experience,
          disable_quality_pipeline: formData.disableQualityPipeline,
          action_type: formData.actionType,
          role_type: formData.roleType,
          core_role: formData.coreRole,
          domain_role: formData.domainRole,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
          title: formData.title || undefined,
          description: formData.promptBody || undefined,
        });
        const created = res.data?.data;
        if (created?.id != null) {
          await promptApi.updatePrompt(created.id, { is_public: formData.isPublic });
        }
        setSaved(true);
        return;
      }
    } catch (error) {
      console.error('프롬프트 생성 실패:', error);
      alert('프롬프트 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSaved(false);
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(0);
    setTagInput('');
  };

  const handleChangeTone = (tone?: ToneType) => {
    setFormData({ ...formData, tone });
  };

  const handleChangeExperience = (experience?: ExperienceLevel) => {
    setFormData({ ...formData, experience });
  };

  const handleChangeStyle = (style?: StyleType) => {
    setFormData({ ...formData, style });
  };

  const handleChangeLanguage = (language?: LanguageType) => {
    setFormData({ ...formData, language });
  };

  const handleChangeActionType = (actionType?: ActionType) => {
    setFormData({ ...formData, actionType });
  };

  const handleChangeRoleType = (roleType?: RoleType) => {
    setFormData({ ...formData, roleType });
  };

  const handleChangePublic = (isPublic: boolean) => {
    setFormData({ ...formData, isPublic });
  };

  const handleBack = () => {
    navigate('/feed');
  };

  const canGoNext = (): boolean => {
    const stepId = getCurrentStepId(formData.requestType, currentStep);
    if (stepId === 'type') return !!formData.requestType;
    if (stepId === 'domain') return !!formData.domain;
    if (stepId === 'title') return formData.title.length >= 5;
    if (stepId === 'body') return formData.promptBody.length >= 10;
    if (stepId === 'input') return formData.input.length >= 10;
    if (stepId === 'jsonSchema') {
      const isJsonValid = (() => {
        if (!formData.jsonSchema.trim()) return true;
        try {
          JSON.parse(formData.jsonSchema);
          return true;
        } catch {
          return false;
        }
      })();

      if (formData.requestType === 'EXTRACTION') {
        return formData.jsonSchema.trim().length >= 10 && isJsonValid;
      }
      return isJsonValid; // ADVANCED는 선택이지만, 값이 있다면 유효한 JSON이어야 함
    }
    if (stepId === 'description') return formData.promptBody.length >= 10;
    return true;
  };

  const handleDomainSelect = (domainId: string) => {
    setFormData({ ...formData, domain: domainId, actionType: undefined, roleType: undefined });
    setCurrentStep(s => s + 1);
  };

  const handleRequestTypeSelect = (requestType: CreatePromptRequestType) => {
    setFormData({ ...formData, requestType });
    setCurrentStep(1);
  };

  const handleLoadExample = () => {
    const example = CATEGORY_EXAMPLES[formData.domain];
    if (example) {
      setFormData({ ...formData, promptBody: example.prompt });
    }
  };

  return {
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
  };
}
