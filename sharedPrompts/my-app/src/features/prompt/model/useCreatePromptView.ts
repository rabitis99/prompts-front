import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { promptApi } from '@/features/prompt/api/prompt.api';
import type { PromptCategory, ToneType, ExperienceLevel, StyleType, LanguageType } from '@/features/prompt/types/prompt.types';
import { DOMAINS, CATEGORY_EXAMPLES } from './createPrompt.constants';

export interface CreatePromptFormData {
  title: string;
  promptBody: string;
  input: string;
  domain: string;
  tags: string[];
  isPublic: boolean;
  tone?: ToneType;
  experience?: ExperienceLevel;
  style?: StyleType;
  language?: LanguageType;
}

const INITIAL_FORM_DATA: CreatePromptFormData = {
  title: '',
  promptBody: '',
  input: '',
  domain: '',
  tags: [],
  isPublic: true,
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
  const [currentStep, setCurrentStep] = useState(1);

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !formData.tags.includes(trimmed) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, trimmed] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async () => {
    if (!canGoNext()) return;

    setIsSaving(true);
    try {
      const selectedDomain = DOMAINS.find(d => d.id === formData.domain);
      if (!selectedDomain) {
        throw new Error('도메인을 선택해주세요');
      }

      await promptApi.createPrompt({
        title: formData.title,
        // 백엔드 스펙상 description 필드만 존재하고 content 필드는 없습니다.
        // 현재 Step 3에서 작성한 프롬프트 본문을 description으로 전송합니다.
        description: formData.promptBody,
        prompt_category: selectedDomain.category,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        input: formData.input,
        is_public: formData.isPublic,
        tone: formData.tone,
        experience: formData.experience,
        style: formData.style,
        language: formData.language,
      });

      setSaved(true);
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
    setCurrentStep(1);
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

  const handleChangePublic = (isPublic: boolean) => {
    setFormData({ ...formData, isPublic });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const canGoNext = (): boolean => {
    if (currentStep === 1) return !!formData.domain;
    if (currentStep === 2) return formData.title.length >= 5;
    if (currentStep === 3) return formData.promptBody.length >= 10;
    if (currentStep === 4) return formData.input.length >= 10;
    return true;
  };

  const handleDomainSelect = (domainId: string) => {
    setFormData({ ...formData, domain: domainId });
    setTimeout(() => setCurrentStep(2), 300);
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
    handleLoadExample,
    handleChangeTone,
    handleChangeExperience,
    handleChangeStyle,
    handleChangeLanguage,
    handleChangePublic,
    canGoNext,
  };
}

