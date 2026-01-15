# 워크플로우 모듈 확장 가이드

## 📋 개요

이 문서는 기존 **프롬프트 공유 커뮤니티**에 **워크플로우 기능**을 모듈로 추가하는 방법을 설명합니다.  
기존 `prompt` 모듈과 동일한 패턴을 따라 확장합니다.

**목표**: 프롬프트를 "공유/복사"하는 것에서 → "실무 워크플로우 도구"로 진화

---

## 🎯 워크플로우 모듈의 개념

### 기존 프롬프트 vs 워크플로우

**프롬프트 (기존)**:
- 사용자가 프롬프트를 **보고 복사**해서 직접 사용
- 예: "블로그 글 쓰기 프롬프트" → 복사 → ChatGPT에 붙여넣기

**워크플로우 (신규)**:
- 사용자가 **입력 폼만 채우면** → 내부에서 프롬프트 실행 → 결과물 바로 받기
- 예: "블로그 글 쓰기 워크플로우" → 제품명/타겟 입력 → 결과물 바로 생성

### 워크플로우의 구조

```
워크플로우
├── 기본 정보 (이름, 설명, 도메인)
├── 단계(Step)들
│   ├── 입력 필드들 (text, textarea, select 등)
│   └── 프롬프트 템플릿 (내부적으로 사용, 사용자에게는 안 보임)
└── 실행 결과
```

---

## 🏗️ 모듈 구조 (기존 prompt 모듈 패턴 따름)

워크플로우 모듈도 기존 `prompt` 모듈과 동일한 구조를 따릅니다:

```
src/features/workflow/
├── api/
│   ├── workflow.api.ts      # API 호출 함수
│   └── index.ts
├── model/
│   ├── workflow.constants.ts # 워크플로우 상수 정의 (도메인별 워크플로우 목록)
│   ├── useWorkflowFeedView.ts # 워크플로우 목록 뷰 로직
│   ├── useWorkflowExecution.ts # 워크플로우 실행 로직
│   └── useWorkflowDetail.ts   # 워크플로우 상세 로직
├── types/
│   ├── workflow.types.ts     # 타입 정의
│   └── index.ts
└── ui/
    ├── WorkflowFeedView.tsx   # 워크플로우 목록 화면
    ├── WorkflowExecutionView.tsx # 워크플로우 실행 화면
    └── WorkflowCard.tsx       # 워크플로우 카드 컴포넌트
```

---

## 📦 단계별 구현 가이드

### 1단계: 타입 정의

**위치**: `src/features/workflow/types/workflow.types.ts`

```typescript
import { PromptCategory } from '@/features/prompt/types/prompt.types';

/**
 * 워크플로우 입력 필드 타입
 */
export const WorkflowInputType = {
  TEXT: 'TEXT',
  TEXTAREA: 'TEXTAREA',
  SELECT: 'SELECT',
  MULTI_SELECT: 'MULTI_SELECT',
  NUMBER: 'NUMBER',
} as const;

export type WorkflowInputType = (typeof WorkflowInputType)[keyof typeof WorkflowInputType];

/**
 * 워크플로우 입력 필드 정의
 */
export interface WorkflowInputField {
  id: string;
  label: string;
  type: WorkflowInputType;
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
}

/**
 * 워크플로우 단계 (Step)
 */
export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  inputs: WorkflowInputField[];
  promptTemplate: string; // {{inputId}} 형태로 변수 치환 가능
  outputFormat?: 'text' | 'json' | 'markdown' | 'html';
}

/**
 * 워크플로우 정의
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  domain: PromptCategory;
  icon?: string;
  category?: string;
  estimatedTime?: string;
  tags?: string[];
  steps: WorkflowStep[];
  usageCount?: number;
}

/**
 * 워크플로우 실행 결과
 */
export interface WorkflowResult {
  stepId: string;
  output: string;
  executionTime?: number;
}

/**
 * 워크플로우 실행 상태
 */
export const WorkflowExecutionStatus = {
  IDLE: 'IDLE',
  INPUTTING: 'INPUTTING',
  EXECUTING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
} as const;

export type WorkflowExecutionStatus =
  (typeof WorkflowExecutionStatus)[keyof typeof WorkflowExecutionStatus];

/**
 * 워크플로우 실행 컨텍스트
 */
export interface WorkflowExecution {
  workflowId: string;
  currentStepIndex: number;
  status: WorkflowExecutionStatus;
  inputs: Record<string, unknown>; // stepId.inputId 형태로 저장
  results: WorkflowResult[];
  error?: string;
}

// API 응답 타입 (백엔드 DTO와 일치)
export interface WorkflowResponseDto {
  id: string;
  name: string;
  description: string;
  domain: string;
  steps: WorkflowStep[];
  created_at?: string;
  updated_at?: string;
}

// API 요청 타입
export interface CreateWorkflowRequest {
  name: string;
  description: string;
  domain: PromptCategory;
  steps: WorkflowStep[];
}
```

**타입 export**: `src/features/workflow/types/index.ts`

```typescript
export * from './workflow.types';
```

---

### 2단계: 워크플로우 상수 정의 (도메인별 워크플로우 목록)

**위치**: `src/features/workflow/model/workflow.constants.ts`

이 파일에는 **도메인별로 미리 정의된 워크플로우들**을 하드코딩합니다.  
나중에 백엔드 API가 생기면 이걸 API 호출로 교체하면 됩니다.

```typescript
import type { Workflow } from '../types/workflow.types';
import { PromptCategory } from '@/features/prompt/types/prompt.types';
import { WorkflowInputType } from '../types/workflow.types';

/**
 * 마케팅 도메인 워크플로우들
 */
const MARKETING_WORKFLOWS: Workflow[] = [
  {
    id: 'blog-post-generator',
    name: '블로그 글 작성',
    description: '제품/서비스 정보를 입력하면 SEO 최적화된 블로그 글 초안을 생성합니다.',
    domain: PromptCategory.MARKETING,
    icon: '📝',
    category: '콘텐츠 제작',
    estimatedTime: '3-5분',
    tags: ['블로그', 'SEO', '콘텐츠'],
    steps: [
      {
        id: 'step-1',
        name: '기본 정보 입력',
        description: '블로그 글의 기본 정보를 입력해주세요.',
        inputs: [
          {
            id: 'productName',
            label: '제품/서비스 이름',
            type: WorkflowInputType.TEXT,
            placeholder: '예: AI 프롬프트 관리 도구',
            required: true,
          },
          {
            id: 'targetAudience',
            label: '타겟 고객',
            type: WorkflowInputType.TEXT,
            placeholder: '예: 마케터, 콘텐츠 크리에이터',
            required: true,
          },
          {
            id: 'keyPoints',
            label: '강조할 핵심 포인트 (쉼표로 구분)',
            type: WorkflowInputType.TEXTAREA,
            placeholder: '예: 시간 절약, 정규화된 프롬프트, 재사용 가능',
            required: false,
          },
          {
            id: 'tone',
            label: '톤앤매너',
            type: WorkflowInputType.SELECT,
            required: true,
            defaultValue: 'professional',
            options: [
              { value: 'professional', label: '전문적' },
              { value: 'friendly', label: '친근한' },
              { value: 'casual', label: '캐주얼' },
            ],
          },
          {
            id: 'wordCount',
            label: '목표 글자 수',
            type: WorkflowInputType.SELECT,
            required: true,
            defaultValue: '1500',
            options: [
              { value: '1000', label: '1,000자' },
              { value: '1500', label: '1,500자' },
              { value: '2000', label: '2,000자' },
            ],
          },
        ],
        promptTemplate: `당신은 전문적인 블로그 글 작성 전문가입니다.

다음 정보를 바탕으로 SEO 최적화된 블로그 글을 작성해주세요:

- 제품/서비스 이름: {{productName}}
- 타겟 고객: {{targetAudience}}
- 강조 포인트: {{keyPoints}}
- 톤앤매너: {{tone}}
- 목표 글자 수: {{wordCount}}자

요구사항:
1. 제목은 SEO를 고려한 키워드 포함
2. 소제목(H2, H3)을 활용한 구조화된 글
3. 독자의 문제를 명확히 제시하고 해결책 제시
4. CTA(Call to Action) 포함
5. 읽기 쉽고 흥미로운 내용

블로그 글을 작성해주세요.`,
        outputFormat: 'markdown',
      },
    ],
  },
  {
    id: 'ad-copy-generator',
    name: '광고 카피 생성',
    description: '제품 정보와 타겟을 입력하면 다양한 광고 카피를 생성합니다.',
    domain: PromptCategory.MARKETING,
    icon: '📢',
    category: '광고',
    estimatedTime: '2-3분',
    tags: ['광고', '카피', '마케팅'],
    steps: [
      {
        id: 'step-1',
        name: '광고 정보 입력',
        inputs: [
          {
            id: 'productName',
            label: '제품/서비스 이름',
            type: WorkflowInputType.TEXT,
            required: true,
          },
          {
            id: 'keyBenefit',
            label: '핵심 혜택 (한 문장)',
            type: WorkflowInputType.TEXTAREA,
            placeholder: '예: 10분 안에 전문적인 블로그 글을 작성할 수 있습니다.',
            required: true,
          },
          {
            id: 'targetPlatform',
            label: '광고 플랫폼',
            type: WorkflowInputType.MULTI_SELECT,
            required: true,
            options: [
              { value: 'google', label: '구글 검색 광고' },
              { value: 'facebook', label: '페이스북/인스타그램' },
              { value: 'youtube', label: '유튜브' },
            ],
          },
          {
            id: 'copyCount',
            label: '생성할 카피 개수',
            type: WorkflowInputType.SELECT,
            defaultValue: '5',
            options: [
              { value: '3', label: '3개' },
              { value: '5', label: '5개' },
              { value: '10', label: '10개' },
            ],
          },
        ],
        promptTemplate: `당신은 광고 카피 전문가입니다.

다음 정보를 바탕으로 {{copyCount}}개의 효과적인 광고 카피를 작성해주세요:

- 제품/서비스: {{productName}}
- 핵심 혜택: {{keyBenefit}}
- 광고 플랫폼: {{targetPlatform}}

각 플랫폼의 특성에 맞는 카피를 작성하고, 각 카피에 대해:
1. 헤드라인 (30자 이내)
2. 본문 (100자 이내)
3. CTA (행동 유도 문구)

형식으로 작성해주세요.`,
        outputFormat: 'markdown',
      },
    ],
  },
];

/**
 * 개발 도메인 워크플로우들
 */
const DEVELOPMENT_WORKFLOWS: Workflow[] = [
  {
    id: 'code-review-assistant',
    name: '코드 리뷰 도우미',
    description: '코드를 입력하면 개선점과 버그를 찾아주는 리뷰를 생성합니다.',
    domain: PromptCategory.DEVELOPMENT,
    icon: '🔍',
    category: '코드 리뷰',
    estimatedTime: '2-3분',
    tags: ['코드리뷰', '개발', '품질'],
    steps: [
      {
        id: 'step-1',
        name: '코드 입력',
        inputs: [
          {
            id: 'code',
            label: '리뷰할 코드',
            type: WorkflowInputType.TEXTAREA,
            placeholder: '코드를 붙여넣어주세요',
            required: true,
            description: '함수, 클래스, 또는 파일 단위의 코드를 입력하세요.',
          },
          {
            id: 'language',
            label: '프로그래밍 언어',
            type: WorkflowInputType.SELECT,
            required: true,
            defaultValue: 'typescript',
            options: [
              { value: 'typescript', label: 'TypeScript' },
              { value: 'javascript', label: 'JavaScript' },
              { value: 'python', label: 'Python' },
            ],
          },
          {
            id: 'focusAreas',
            label: '집중 리뷰 영역 (다중 선택)',
            type: WorkflowInputType.MULTI_SELECT,
            options: [
              { value: 'performance', label: '성능' },
              { value: 'security', label: '보안' },
              { value: 'readability', label: '가독성' },
              { value: 'best-practices', label: '베스트 프랙티스' },
            ],
          },
        ],
        promptTemplate: `당신은 {{language}} 코드 리뷰 전문가입니다.

다음 코드를 리뷰하고 개선점을 제시해주세요:

\`\`\`{{language}}
{{code}}
\`\`\`

집중 리뷰 영역: {{focusAreas}}

리뷰 형식:
1. **전체 평가** (한 문단)
2. **발견된 문제점** (각 문제에 대해 심각도와 함께)
3. **개선 제안** (구체적인 코드 예시 포함)
4. **긍정적인 점** (잘된 부분)

명확하고 실행 가능한 피드백을 제공해주세요.`,
        outputFormat: 'markdown',
      },
    ],
  },
];

/**
 * 비즈니스 도메인 워크플로우들
 */
const BUSINESS_WORKFLOWS: Workflow[] = [
  {
    id: 'email-template-generator',
    name: '이메일 템플릿 생성',
    description: '상황과 목적을 입력하면 전문적인 이메일 템플릿을 생성합니다.',
    domain: PromptCategory.BUSINESS,
    icon: '✉️',
    category: '커뮤니케이션',
    estimatedTime: '2분',
    tags: ['이메일', '비즈니스', '템플릿'],
    steps: [
      {
        id: 'step-1',
        name: '이메일 정보 입력',
        inputs: [
          {
            id: 'purpose',
            label: '이메일 목적',
            type: WorkflowInputType.SELECT,
            required: true,
            options: [
              { value: 'meeting-request', label: '미팅 요청' },
              { value: 'follow-up', label: '후속 연락' },
              { value: 'proposal', label: '제안서 전달' },
              { value: 'thank-you', label: '감사 인사' },
            ],
          },
          {
            id: 'recipient',
            label: '수신자 (예: 고객, 파트너, 팀원)',
            type: WorkflowInputType.TEXT,
            placeholder: '예: 잠재 고객',
            required: true,
          },
          {
            id: 'keyPoints',
            label: '포함할 핵심 내용',
            type: WorkflowInputType.TEXTAREA,
            placeholder: '예: 제품 데모 일정, 특별 할인 혜택',
            required: false,
          },
        ],
        promptTemplate: `{{purpose}} 목적의 전문적인 이메일을 작성해주세요.

- 수신자: {{recipient}}
- 포함할 내용: {{keyPoints}}

요구사항:
1. 명확하고 간결한 제목
2. 인사말
3. 본문 (핵심 내용 포함)
4. 마무리 인사 및 서명

전문적이고 효과적인 이메일을 작성해주세요.`,
        outputFormat: 'text',
      },
    ],
  },
];

/**
 * 모든 워크플로우를 도메인별로 그룹화
 */
export const WORKFLOWS_BY_DOMAIN: Record<PromptCategory, Workflow[]> = {
  [PromptCategory.MARKETING]: MARKETING_WORKFLOWS,
  [PromptCategory.DEVELOPMENT]: DEVELOPMENT_WORKFLOWS,
  [PromptCategory.CODING]: DEVELOPMENT_WORKFLOWS,
  [PromptCategory.PROGRAMMING]: DEVELOPMENT_WORKFLOWS,
  [PromptCategory.BUSINESS]: BUSINESS_WORKFLOWS,
  [PromptCategory.CONTENT]: [],
  [PromptCategory.PRODUCTIVITY]: [],
  [PromptCategory.ANALYSIS]: [],
  [PromptCategory.CREATIVE]: [],
  [PromptCategory.STUDY]: [],
  [PromptCategory.EDUCATION]: [],
  [PromptCategory.RESEARCH]: [],
  [PromptCategory.DESIGN]: [],
  [PromptCategory.WRITING]: [],
  [PromptCategory.ETC]: [],
};

/**
 * 모든 워크플로우를 하나의 배열로
 */
export const ALL_WORKFLOWS: Workflow[] = Object.values(WORKFLOWS_BY_DOMAIN).flat();

/**
 * 워크플로우 ID로 찾기
 */
export function getWorkflowById(id: string): Workflow | undefined {
  return ALL_WORKFLOWS.find((w) => w.id === id);
}

/**
 * 도메인별 워크플로우 가져오기
 */
export function getWorkflowsByDomain(domain: PromptCategory): Workflow[] {
  return WORKFLOWS_BY_DOMAIN[domain] || [];
}
```

---

### 3단계: API 레이어 (선택사항 - 나중에 백엔드 API 생기면 추가)

**위치**: `src/features/workflow/api/workflow.api.ts`

**지금은 백엔드 API가 없으므로, 이 파일은 나중에 추가하면 됩니다.**  
지금은 `workflow.constants.ts`의 하드코딩된 데이터를 사용합니다.

```typescript
// 나중에 백엔드 API가 생기면 이렇게 구현

import { api } from '@/shared/api/axios';
import type { 
  WorkflowResponseDto, 
  CreateWorkflowRequest 
} from '../types/workflow.types';
import type { CustomResponse } from '@/features/auth/types/user';

export const workflowApi = {
  // 워크플로우 목록 조회
  getWorkflows: async (domain?: string) => {
    const params = domain ? { domain } : {};
    const response = await api.get<CustomResponse<WorkflowResponseDto[]>>(
      '/workflows',
      { params }
    );
    return response.data;
  },

  // 워크플로우 실행
  executeWorkflow: async (id: string, inputs: Record<string, unknown>) => {
    const response = await api.post<CustomResponse<{ result: string }>>(
      `/workflows/${id}/execute`,
      { inputs }
    );
    return response.data;
  },
};
```

---

### 4단계: 비즈니스 로직 (워크플로우 목록 뷰)

**위치**: `src/features/workflow/model/useWorkflowFeedView.ts`

기존 `useHomeFeedView.ts`와 유사한 패턴입니다.

```typescript
import { useState, useMemo } from 'react';
import { PromptCategory } from '@/features/prompt/types/prompt.types';
import { getWorkflowsByDomain, ALL_WORKFLOWS } from './workflow.constants';
import type { Workflow } from '../types/workflow.types';

export function useWorkflowFeedView() {
  const [selectedDomain, setSelectedDomain] = useState<PromptCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 선택된 도메인의 워크플로우 가져오기
  const workflows = useMemo(() => {
    if (selectedDomain === 'all') {
      return ALL_WORKFLOWS;
    }
    return getWorkflowsByDomain(selectedDomain);
  }, [selectedDomain]);

  // 검색 필터링
  const filteredWorkflows = useMemo(() => {
    if (!searchQuery) {
      return workflows;
    }

    const query = searchQuery.toLowerCase();
    return workflows.filter((w) => {
      return (
        w.name.toLowerCase().includes(query) ||
        w.description.toLowerCase().includes(query) ||
        w.tags?.some((t) => t.toLowerCase().includes(query)) ||
        w.category?.toLowerCase().includes(query)
      );
    });
  }, [workflows, searchQuery]);

  return {
    selectedDomain,
    setSelectedDomain,
    searchQuery,
    setSearchQuery,
    workflows: filteredWorkflows,
    totalCount: filteredWorkflows.length,
  };
}
```

---

### 5단계: 비즈니스 로직 (워크플로우 실행)

**위치**: `src/features/workflow/model/useWorkflowExecution.ts`

워크플로우 실행 상태와 입력값을 관리합니다.

```typescript
import { useState } from 'react';
import {
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowResult,
} from '../types/workflow.types';
import type { Workflow, WorkflowStep } from '../types/workflow.types';

export function useWorkflowExecution(workflow: Workflow) {
  const [execution, setExecution] = useState<WorkflowExecution>({
    workflowId: workflow.id,
    currentStepIndex: 0,
    status: WorkflowExecutionStatus.IDLE,
    inputs: {},
    results: [],
  });

  const currentStep: WorkflowStep | undefined = workflow.steps[execution.currentStepIndex];

  // 입력값 업데이트
  const updateInput = (stepId: string, inputId: string, value: unknown) => {
    setExecution((prev) => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        [`${stepId}.${inputId}`]: value,
      },
    }));
  };

  // 현재 단계의 입력값 가져오기
  const getCurrentStepInputs = (): Record<string, unknown> => {
    if (!currentStep) return {};
    const stepInputs: Record<string, unknown> = {};
    currentStep.inputs.forEach((input) => {
      const key = `${currentStep.id}.${input.id}`;
      stepInputs[input.id] = execution.inputs[key] ?? input.defaultValue ?? '';
    });
    return stepInputs;
  };

  // 필수 입력값 검증
  const isCurrentStepValid = (): boolean => {
    if (!currentStep) return false;
    return currentStep.inputs.every((input) => {
      if (!input.required) return true;
      const key = `${currentStep.id}.${input.id}`;
      const value = execution.inputs[key];
      return value !== undefined && value !== null && value !== '';
    });
  };

  // 프롬프트 템플릿에 입력값 치환
  const renderPromptTemplate = (template: string, inputs: Record<string, unknown>): string => {
    let rendered = template;
    Object.entries(inputs).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue = Array.isArray(value) ? value.join(', ') : String(value ?? '');
      rendered = rendered.replace(new RegExp(placeholder, 'g'), stringValue);
    });
    return rendered;
  };

  // 워크플로우 실행 (LLM API 호출)
  const executeStep = async (): Promise<void> => {
    if (!currentStep) return;
    if (!isCurrentStepValid()) {
      throw new Error('필수 입력값을 모두 입력해주세요.');
    }

    setExecution((prev) => ({
      ...prev,
      status: WorkflowExecutionStatus.EXECUTING,
    }));

    try {
      const stepInputs = getCurrentStepInputs();
      const prompt = renderPromptTemplate(currentStep.promptTemplate, stepInputs);

      // TODO: 실제 LLM API 호출로 교체
      // 지금은 시뮬레이션 (나중에 백엔드 API로 교체)
      const response = await simulateLLMCall(prompt);

      const result: WorkflowResult = {
        stepId: currentStep.id,
        output: response,
        executionTime: 1500,
      };

      setExecution((prev) => ({
        ...prev,
        results: [...prev.results, result],
        status: WorkflowExecutionStatus.COMPLETED,
      }));
    } catch (error) {
      setExecution((prev) => ({
        ...prev,
        status: WorkflowExecutionStatus.ERROR,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      }));
    }
  };

  // 다음 단계로 이동
  const goToNextStep = () => {
    if (execution.currentStepIndex < workflow.steps.length - 1) {
      setExecution((prev) => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
        status: WorkflowExecutionStatus.IDLE,
      }));
    }
  };

  // 이전 단계로 이동
  const goToPreviousStep = () => {
    if (execution.currentStepIndex > 0) {
      setExecution((prev) => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex - 1,
        status: WorkflowExecutionStatus.IDLE,
      }));
    }
  };

  // 워크플로우 초기화
  const reset = () => {
    setExecution({
      workflowId: workflow.id,
      currentStepIndex: 0,
      status: WorkflowExecutionStatus.IDLE,
      inputs: {},
      results: [],
    });
  };

  const isCompleted = execution.results.length === workflow.steps.length;

  return {
    execution,
    currentStep,
    currentStepInputs: getCurrentStepInputs(),
    isCurrentStepValid: isCurrentStepValid(),
    isCompleted,
    updateInput,
    executeStep,
    goToNextStep,
    goToPreviousStep,
    reset,
  };
}

// LLM API 호출 시뮬레이션 (실제 API로 교체 필요)
async function simulateLLMCall(prompt: string): Promise<string> {
  // 실제로는 백엔드 API를 호출해야 함
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return `[시뮬레이션 결과]\n\n입력된 프롬프트:\n${prompt}\n\n실제 구현 시 백엔드 API를 호출하여 결과를 반환합니다.`;
}
```

---

### 6단계: UI 컴포넌트 (워크플로우 목록)

**위치**: `src/features/workflow/ui/WorkflowFeedView.tsx`

기존 `HomeFeedView.tsx`와 유사한 패턴입니다.

```typescript
import { Search, X } from 'lucide-react';
import { useWorkflowFeedView } from '../model/useWorkflowFeedView';
import { DOMAIN_OPTIONS } from '@/features/prompt/model/homeFeed.constants';
import { PromptCategory } from '@/features/prompt/types/prompt.types';
import { useNavigate } from 'react-router-dom';
import { WorkflowCard } from './WorkflowCard';

export function WorkflowFeedView() {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    selectedDomain,
    setSelectedDomain,
    workflows,
    totalCount,
  } = useWorkflowFeedView();

  const handleDomainChange = (domainId: string) => {
    if (domainId === 'all') {
      setSelectedDomain('all');
    } else {
      setSelectedDomain(domainId.toUpperCase() as PromptCategory);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 검색 */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="워크플로우 검색..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 도메인 탭 */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {DOMAIN_OPTIONS.map((domain) => {
              const Icon = domain.icon;
              const isActive = 
                (domain.id === 'all' && selectedDomain === 'all') ||
                (domain.id !== 'all' && selectedDomain === domain.category);
              return (
                <button
                  key={domain.id}
                  onClick={() => handleDomainChange(domain.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {domain.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 워크플로우 개수 */}
        <div className="mb-6">
          <span className="text-sm font-medium text-slate-600">
            {totalCount}개의 워크플로우
          </span>
        </div>

        {/* 워크플로우 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onClick={() => navigate(`/workflows/${workflow.id}`)}
            />
          ))}
        </div>

        {/* 빈 상태 */}
        {workflows.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              워크플로우가 없습니다
            </h3>
            <p className="text-sm text-slate-500">
              다른 도메인을 선택하거나 검색어를 변경해보세요
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
```

---

### 7단계: UI 컴포넌트 (워크플로우 카드)

**위치**: `src/features/workflow/ui/WorkflowCard.tsx`

```typescript
import { Clock, ArrowRight } from 'lucide-react';
import type { Workflow } from '../types/workflow.types';

interface WorkflowCardProps {
  workflow: Workflow;
  onClick: () => void;
}

export function WorkflowCard({ workflow, onClick }: WorkflowCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-6 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer"
    >
      {/* 아이콘 및 카테고리 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {workflow.icon && <span className="text-2xl">{workflow.icon}</span>}
          {workflow.category && (
            <span className="px-3 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-lg">
              {workflow.category}
            </span>
          )}
        </div>
      </div>

      {/* 제목 */}
      <h3 className="font-bold text-slate-900 text-lg mb-3 leading-tight">
        {workflow.name}
      </h3>

      {/* 설명 */}
      <p className="text-slate-600 text-sm leading-relaxed mb-5">
        {workflow.description}
      </p>

      {/* 태그 */}
      {workflow.tags && workflow.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap pb-5 border-b border-slate-100">
          {workflow.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 푸터 */}
      <div className="flex items-center justify-between">
        {workflow.estimatedTime && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{workflow.estimatedTime}</span>
          </div>
        )}
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}
```

---

### 8단계: UI 컴포넌트 (워크플로우 실행)

**위치**: `src/features/workflow/ui/WorkflowExecutionView.tsx`

워크플로우 실행 화면입니다. 입력 폼 → 실행 → 결과 표시까지 처리합니다.

```typescript
import { ArrowLeft, ArrowRight, Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWorkflowExecution } from '../model/useWorkflowExecution';
import type { Workflow } from '../types/workflow.types';
import { WorkflowInputType } from '../types/workflow.types';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface WorkflowExecutionViewProps {
  workflow: Workflow;
}

export function WorkflowExecutionView({ workflow }: WorkflowExecutionViewProps) {
  const navigate = useNavigate();
  const {
    execution,
    currentStep,
    currentStepInputs,
    isCurrentStepValid,
    isCompleted,
    updateInput,
    executeStep,
    goToNextStep,
    goToPreviousStep,
    reset,
  } = useWorkflowExecution(workflow);

  const [isExecuting, setIsExecuting] = useState(false);

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">워크플로우를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await executeStep();
    } finally {
      setIsExecuting(false);
    }
  };

  const handleInputChange = (inputId: string, value: unknown) => {
    updateInput(currentStep.id, inputId, value);
  };

  const currentResult = execution.results.find((r) => r.stepId === currentStep.id);
  const hasResult = !!currentResult;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">돌아가기</span>
              </button>
              <h1 className="text-2xl font-bold text-slate-900">{workflow.name}</h1>
              <p className="text-sm text-slate-600 mt-1">{workflow.description}</p>
            </div>
            {workflow.estimatedTime && (
              <div className="text-right">
                <div className="text-xs text-slate-500">예상 소요 시간</div>
                <div className="text-sm font-semibold text-slate-700">{workflow.estimatedTime}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              단계 {execution.currentStepIndex + 1} / {workflow.steps.length}
            </span>
            <span className="text-sm text-slate-500">{currentStep.name}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-violet-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((execution.currentStepIndex + 1) / workflow.steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">{currentStep.name}</h2>
          {currentStep.description && (
            <p className="text-sm text-slate-600 mb-6">{currentStep.description}</p>
          )}

          {/* Input Fields */}
          {!hasResult && (
            <div className="space-y-6">
              {currentStep.inputs.map((input) => {
                const value = currentStepInputs[input.id] ?? input.defaultValue ?? '';

                return (
                  <div key={input.id}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {input.label}
                      {input.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {input.description && (
                      <p className="text-xs text-slate-500 mb-2">{input.description}</p>
                    )}

                    {input.type === WorkflowInputType.TEXT && (
                      <input
                        type="text"
                        value={String(value)}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        placeholder={input.placeholder}
                        required={input.required}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      />
                    )}

                    {input.type === WorkflowInputType.TEXTAREA && (
                      <textarea
                        value={String(value)}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        placeholder={input.placeholder}
                        required={input.required}
                        rows={4}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
                      />
                    )}

                    {input.type === WorkflowInputType.SELECT && (
                      <select
                        value={String(value)}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        required={input.required}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                      >
                        {input.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {input.type === WorkflowInputType.MULTI_SELECT && (
                      <div className="space-y-2">
                        {input.options?.map((option) => {
                          const selectedValues = Array.isArray(value) ? value : [];
                          const isSelected = selectedValues.includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const newValues = e.target.checked
                                    ? [...selectedValues, option.value]
                                    : selectedValues.filter((v) => v !== option.value);
                                  handleInputChange(input.id, newValues);
                                }}
                                className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                              />
                              <span className="text-sm text-slate-700">{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Result Display */}
          {hasResult && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">실행 완료</span>
                {currentResult.executionTime && (
                  <span className="text-xs text-slate-500 ml-auto">
                    {currentResult.executionTime}ms 소요
                  </span>
                )}
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                  {currentResult.output}
                </pre>
              </div>
            </div>
          )}

          {/* Error Display */}
          {execution.status === WorkflowExecutionStatus.ERROR && execution.error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-red-700 mb-1">오류 발생</div>
                <div className="text-sm text-red-600">{execution.error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {execution.currentStepIndex > 0 && (
              <button
                onClick={goToPreviousStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                이전 단계
              </button>
            )}
            {hasResult && execution.currentStepIndex < workflow.steps.length - 1 && (
              <button
                onClick={goToNextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
              >
                다음 단계
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {!hasResult && (
              <button
                onClick={handleExecute}
                disabled={!isCurrentStepValid || isExecuting}
                className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    실행 중...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    실행하기
                  </>
                )}
              </button>
            )}
            {isCompleted && (
              <button
                onClick={reset}
                className="px-5 py-2.5 bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300 transition-colors"
              >
                다시 시작
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

### 9단계: 페이지 컴포넌트

**위치**: `src/pages/WorkflowFeedPage.tsx`

```typescript
import { WorkflowFeedView } from '@/features/workflow/ui/WorkflowFeedView';

export default function WorkflowFeedPage() {
  return <WorkflowFeedView />;
}
```

**위치**: `src/pages/WorkflowExecutionPage.tsx`

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { WorkflowExecutionView } from '@/features/workflow/ui/WorkflowExecutionView';
import { getWorkflowById } from '@/features/workflow/model/workflow.constants';

export default function WorkflowExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return <div>워크플로우 ID가 필요합니다.</div>;
  }

  const workflow = getWorkflowById(id);

  if (!workflow) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600 mb-4">워크플로우를 찾을 수 없습니다.</div>
          <button
            onClick={() => navigate('/workflows')}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg"
          >
            워크플로우 목록으로
          </button>
        </div>
      </div>
    );
  }

  return <WorkflowExecutionView workflow={workflow} />;
}
```

---

### 10단계: 라우팅 추가

**위치**: `src/app/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WorkflowFeedPage from '@/pages/WorkflowFeedPage';
import WorkflowExecutionPage from '@/pages/WorkflowExecutionPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기존 라우트들 */}
        <Route path="/" element={<HomeFeedPage />} />
        <Route path="/prompts/:id" element={<PromptDetailPage />} />
        
        {/* 워크플로우 라우트 추가 */}
        <Route path="/workflows" element={<WorkflowFeedPage />} />
        <Route path="/workflows/:id" element={<WorkflowExecutionPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🔗 기존 프롬프트 모듈과의 통합

### 홈 화면에 워크플로우 탭 추가 (선택사항)

기존 홈 피드에 "프롬프트" / "워크플로우" 탭을 추가할 수 있습니다:

```typescript
// src/pages/HomeFeedPage.tsx 수정 예시

import { useState } from 'react';
import { HomeFeedView } from '@/features/prompt/ui/HomeFeedView';
import { WorkflowFeedView } from '@/features/workflow/ui/WorkflowFeedView';

export default function HomeFeedPage() {
  const [activeTab, setActiveTab] = useState<'prompts' | 'workflows'>('prompts');

  return (
    <div>
      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('prompts')}
          className={activeTab === 'prompts' ? 'active' : ''}
        >
          프롬프트
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={activeTab === 'workflows' ? 'active' : ''}
        >
          워크플로우
        </button>
      </div>

      {/* 콘텐츠 */}
      {activeTab === 'prompts' ? <HomeFeedView /> : <WorkflowFeedView />}
    </div>
  );
}
```

---

## 📝 체크리스트

워크플로우 모듈 추가 시 확인사항:

- [ ] 타입 정의 완료 (`types/workflow.types.ts`)
- [ ] 워크플로우 상수 정의 완료 (`model/workflow.constants.ts`)
- [ ] 워크플로우 목록 뷰 로직 완료 (`model/useWorkflowFeedView.ts`)
- [ ] 워크플로우 실행 로직 완료 (`model/useWorkflowExecution.ts`)
- [ ] 워크플로우 목록 UI 완료 (`ui/WorkflowFeedView.tsx`)
- [ ] 워크플로우 카드 UI 완료 (`ui/WorkflowCard.tsx`)
- [ ] 워크플로우 실행 UI 완료 (`ui/WorkflowExecutionView.tsx`)
- [ ] 페이지 컴포넌트 생성 (`pages/WorkflowFeedPage.tsx`, `WorkflowExecutionPage.tsx`)
- [ ] 라우팅 추가 (`app/App.tsx`)
- [ ] 입력 필드 타입별 렌더링 확인 (TEXT, TEXTAREA, SELECT, MULTI_SELECT)
- [ ] 프롬프트 템플릿 변수 치환 로직 확인
- [ ] 에러 처리 구현
- [ ] 로딩 상태 처리

---

## 🚀 다음 단계

워크플로우 모듈 추가 후:

1. **백엔드 API 연동** (나중에):
   - `workflow.api.ts` 구현
   - `useWorkflowExecution.ts`의 `simulateLLMCall`을 실제 API 호출로 교체

2. **워크플로우 추가**:
   - `workflow.constants.ts`에 새로운 워크플로우 추가
   - 각 도메인별로 실무 워크플로우 확장

3. **UI 개선**:
   - 결과물 다운로드 기능
   - 실행 히스토리 저장
   - 즐겨찾기 기능

---

## 📚 참고

- 기존 프롬프트 모듈 구조: `src/features/prompt/`
- 프로젝트 구조: `PROJECT_STRUCTURE_ANALYSIS.md`
- API 비교: `BACKEND_FRONTEND_COMPARISON.md`
