import type { ToneType, ExperienceLevel, StyleType } from '@/features/prompt/types/prompt.types';

// 백엔드 enum의 guidelineKo 정보 (한국어 설명)
export const TONE_GUIDELINES: Record<ToneType, string> = {
  FRIENDLY: '친근하고 따뜻한 어조를 사용하여 사용자가 편안함을 느끼도록 합니다.',
  FORMAL: '격식 있고 정중한 표현을 사용하며 공식 문서에 적합한 어조를 유지합니다.',
  HUMOROUS: '적절한 범위 내에서 가벼운 유머를 사용하되, 무례하거나 부적절하지 않게 합니다.',
  MOTIVATIONAL: '행동을 유도하고 긍정적인 결과를 강조하는 동기부여 어조를 사용합니다.',
  CASUAL: '딱딱하지 않고 자연스러운 일상 대화체를 사용합니다.',
  PROFESSIONAL: '전문 지식과 정확성을 바탕으로 신뢰감 있는 어조를 유지합니다.',
  EMPATHETIC: '사용자의 감정과 상황을 이해하고 공감하는 어조를 사용합니다.',
  SARCASTIC: '상황에 맞는 가벼운 풍자를 사용하되 공격적이지 않도록 주의합니다.',
  POSITIVE: '전체적으로 낙관적이고 긍정적인 어조를 유지합니다.',
  NEGATIVE: '문제점이나 위험 요소를 명확히 전달하되 과도하게 공격적이지 않게 합니다.',
  INSPIRATIONAL: '창의성과 새로운 아이디어를 자극하는 영감을 주는 어조를 사용합니다.',
  NEUTRAL: '감정 개입 없이 객관적이고 중립적인 어조를 유지합니다.',
  ENTHUSIASTIC: '에너지 넘치고 열정적인 어조로 사용자를 격려합니다.',
};

export const EXPERIENCE_GUIDELINES: Record<ExperienceLevel, string> = {
  BEGINNER: '사용자는 초보자입니다. 전문 용어를 최소화하고, 기초부터 차근차근 설명하며, 이해를 돕는 예시를 충분히 제공합니다.',
  INTERMEDIATE: '사용자는 중급 수준입니다. 기본 개념은 알고 있다고 가정하고, 중요한 세부사항과 실용적인 팁에 집중합니다.',
  ADVANCED: '사용자는 고급 수준입니다. 심화된 내용, 최적화 기법, 고급 패턴을 포함하여 전문적인 수준의 정보를 제공합니다.',
  EXPERT: '사용자는 전문가입니다. 최신 연구, 엣지 케이스, 고급 트레이드오프를 논의하며 전문 용어를 자유롭게 사용합니다.',
};

export const STYLE_GUIDELINES: Record<StyleType, string> = {
  NARRATIVE: '이야기 형식으로 전개하며 사건이나 경험을 중심으로 서술합니다.',
  BULLET: '핵심 포인트를 간결한 글머리 목록으로 정리합니다.',
  CONCISE: '불필요한 설명을 제거하고 핵심 정보만 간결하게 전달합니다.',
  FORMATTED: '명확한 구조나 정해진 서식을 따라 작성합니다.',
  DESCRIPTIVE: '감각적이고 시각적인 요소를 강조한 상세한 설명을 제공합니다.',
  INSTRUCTIVE: '작업이나 과정을 단계별로 명확하게 안내합니다.',
  QUESTION_ANSWER: '질문과 답변 형식으로 정보를 전달합니다.',
  STORYTELLING: '스토리텔링 기법으로 정보를 전달하고 감정을 이끌어냅니다.',
  DIALOGUE: '두 사람 이상의 대화 형식으로 내용을 전개합니다.',
  COMPARATIVE: '두 가지 이상의 대상을 비교하여 차이점과 공통점을 강조합니다.',
  ANALYTICAL: '주제를 다양한 관점에서 깊이 있게 분석합니다.',
  CREATIVE: '독창적이고 새로운 아이디어나 접근 방식을 제시합니다.',
  TECHNICAL: '정확한 기술 용어를 사용하여 상세한 기술 설명을 제공합니다.',
  DETAILED: '깊이 있는 이해를 돕기 위해 상세하고 구체적으로 설명합니다.',
};

// 예시 프롬프트 (사용자가 제공한 예시 기반)
export const EXAMPLE_PROMPTS = {
  CREATIVE: {
    title: 'TOP 랭킹 이슈형 영상 자동 생성 프롬프트',
    tone: 'FRIENDLY' as ToneType,
    experience: 'EXPERT' as ExperienceLevel,
    style: 'NARRATIVE' as StyleType,
    language: 'KOREAN',
    description: '이슈킹 스타일의 TOP 랭킹 이슈 영상을 자동 생성하기 위한 프롬프트입니다.',
  },
};

