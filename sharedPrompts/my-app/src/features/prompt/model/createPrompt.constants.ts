import { Code, TrendingUp, Palette, PenTool, Globe, Sparkles, Zap, Briefcase, GraduationCap, Search, Lightbulb, BookOpen, BarChart3, Mic, Users } from 'lucide-react';
import type { PromptCategory } from '@/features/prompt/types/prompt.types';

export interface DomainOption {
  id: string;
  label: string;
  icon: typeof Code;
  emoji: string;
  category: PromptCategory;
}

export const DOMAINS: DomainOption[] = [
  { id: 'productivity', label: '생산성', icon: Zap, emoji: '⚡', category: 'PRODUCTIVITY' as PromptCategory },
  { id: 'development', label: '개발', icon: Code, emoji: '🔧', category: 'DEVELOPMENT' as PromptCategory },
  { id: 'coding', label: '코딩', icon: Code, emoji: '💻', category: 'CODING' as PromptCategory },
  { id: 'programming', label: '프로그래밍', icon: Code, emoji: '⌨️', category: 'PROGRAMMING' as PromptCategory },
  { id: 'analysis', label: '분석', icon: BarChart3, emoji: '📊', category: 'ANALYSIS' as PromptCategory },
  { id: 'marketing', label: '마케팅', icon: TrendingUp, emoji: '📈', category: 'MARKETING' as PromptCategory },
  { id: 'content', label: '콘텐츠 제작', icon: Mic, emoji: '🎙️', category: 'CONTENT' as PromptCategory },
  { id: 'creative', label: '창작', icon: Lightbulb, emoji: '💡', category: 'CREATIVE' as PromptCategory },
  { id: 'study', label: '학습', icon: BookOpen, emoji: '📚', category: 'STUDY' as PromptCategory },
  { id: 'education', label: '교육', icon: GraduationCap, emoji: '🎓', category: 'EDUCATION' as PromptCategory },
  { id: 'research', label: '연구', icon: Search, emoji: '🔬', category: 'RESEARCH' as PromptCategory },
  { id: 'business', label: '비즈니스', icon: Briefcase, emoji: '💼', category: 'BUSINESS' as PromptCategory },
  { id: 'design', label: '디자인', icon: Palette, emoji: '🎨', category: 'DESIGN' as PromptCategory },
  { id: 'writing', label: '글쓰기', icon: PenTool, emoji: '✍️', category: 'WRITING' as PromptCategory },
  { id: 'translation', label: '번역', icon: Globe, emoji: '🌍', category: 'ETC' as PromptCategory },
  { id: 'etc', label: '기타', icon: Sparkles, emoji: '✨', category: 'ETC' as PromptCategory },
];

export const POPULAR_TAGS: Record<string, string[]> = {
  coding: ['react', 'python', 'api', 'debugging'],
  marketing: ['seo', 'sns', '광고', '브랜딩'],
  design: ['ui', 'ux', 'figma', '컬러'],
  writing: ['블로그', '카피', '이메일'],
  translation: ['영어', '일본어', '기술문서'],
  etc: ['생산성', '요약', '분석'],
};

export interface CategoryExample {
  title: string;
  prompt: string;
  tips: string[];
}

export const CATEGORY_EXAMPLES: Record<string, CategoryExample> = {
  coding: {
    title: 'React 성능 최적화 코드 리뷰',
    prompt: `당신은 10년 경력의 시니어 React 개발자입니다.
다음 코드를 검토하고 성능 최적화 방안을 제시해주세요.

분석해야 할 부분:
1. 불필요한 리렌더링 발생 지점
2. 메모이제이션이 필요한 부분
3. 번들 크기 최적화 방안

각 문제에 대해 개선된 코드 예시를 함께 제공해주세요.`,
    tips: [
      '구체적인 기술 스택을 명시하세요 (React, Vue, Python 등)',
      '코드의 맥락을 제공하면 더 정확한 답변을 받아요',
      '원하는 코드 스타일이나 컨벤션을 지정하세요'
    ]
  },
  marketing: {
    title: 'SNS 콘텐츠 마케팅 전략 수립',
    prompt: `당신은 디지털 마케팅 전문가입니다.
새로운 제품 출시를 위한 SNS 마케팅 전략을 수립해주세요.

제품 정보:
- 타겟: 2030 여성
- 예산: 월 500만원
- 기간: 3개월

다음 내용을 포함해주세요:
1. 플랫폼별 콘텐츠 전략 (인스타그램, 페이스북, 틱톡)
2. 주간 포스팅 스케줄
3. 예상 도달률과 전환율`,
    tips: [
      '타겟 고객의 특성을 상세히 설명하세요',
      '예산과 기간 등 제약 조건을 명시하세요',
      '원하는 결과물 형식을 구체적으로 요청하세요'
    ]
  },
  design: {
    title: 'UI/UX 디자인 시스템 가이드',
    prompt: `당신은 경험 많은 UI/UX 디자이너입니다.
모바일 앱을 위한 디자인 시스템을 설계해주세요.

앱 정보:
- 분야: 금융 서비스
- 타겟: 30-50대
- 플랫폼: iOS, Android

포함할 내용:
1. 컬러 팔레트 (Primary, Secondary, Neutral)
2. 타이포그래피 스케일
3. 주요 컴포넌트 가이드 (버튼, 입력필드, 카드)
4. 간격 시스템

각 항목에 대한 사용 예시와 접근성 고려사항을 포함해주세요.`,
    tips: [
      '브랜드의 개성과 가치를 먼저 설명하세요',
      '참고하고 싶은 디자인 스타일을 언급하세요',
      '접근성, 반응형 등 중요한 요구사항을 명시하세요'
    ]
  },
  writing: {
    title: '블로그 포스트 작성 가이드',
    prompt: `당신은 전문 콘텐츠 작가입니다.
다음 주제로 SEO 최적화된 블로그 글을 작성해주세요.

주제: [여기에 주제 입력]
목표: 검색 상위 노출 및 독자 참여 유도

글 구조:
1. 눈길을 끄는 제목 (3가지 옵션)
2. 도입부 (문제 제기)
3. 본문 (3-5개 소제목)
4. 실용적인 팁 또는 체크리스트
5. 행동 유도 결론

분량: 2000-2500자
톤앤매너: 친근하면서도 전문적인 느낌`,
    tips: [
      '글의 목적과 타겟 독자를 명확히 하세요',
      '원하는 글의 톤(formal, casual 등)을 지정하세요',
      '단어 수나 문단 수 등 구체적인 형식을 요청하세요'
    ]
  },
  translation: {
    title: '기술 문서 한영 번역',
    prompt: `당신은 IT 분야 전문 번역가입니다.
다음 기술 문서를 자연스러운 영어로 번역해주세요.

번역 원칙:
1. 기술 용어는 업계 표준을 따름
2. 문맥에 맞는 자연스러운 표현 사용
3. 원문의 뉘앙스와 톤 유지

추가 요청:
- 주요 기술 용어는 괄호 안에 원문 병기
- 번역이 애매한 부분은 대안 제시
- 문화적 차이가 있는 표현은 현지화

[여기에 번역할 텍스트 입력]`,
    tips: [
      '번역의 목적(문서, 마케팅, 대화 등)을 명시하세요',
      '특정 용어나 스타일 가이드가 있다면 제공하세요',
      '타겟 독자의 배경 지식 수준을 알려주세요'
    ]
  },
  etc: {
    title: '회의록 요약 및 액션 아이템 정리',
    prompt: `당신은 효율적인 업무 보조 AI입니다.
다음 회의록을 분석하고 핵심 내용을 정리해주세요.

정리 형식:
1. 회의 개요 (1-2문장)
2. 주요 결정 사항 (불릿 포인트)
3. 액션 아이템
   - 담당자
   - 마감일
   - 우선순위
4. 다음 회의 안건

[여기에 회의록 입력]

결과물은 팀원들이 빠르게 스캔할 수 있도록 명료하게 작성해주세요.`,
    tips: [
      '프롬프트의 최종 목적을 명확히 하세요',
      '입력 데이터의 형식과 예시를 제공하세요',
      '출력 형식을 구체적으로 지정하세요'
    ]
  }
};

