# 프로젝트 구조 분석 문서

## 📋 프로젝트 개요

- **프로젝트명**: my-app (PromptHub)
- **스택**: React 19.2.0 + TypeScript + Vite
- **상태 관리**: Zustand 5.0.9
- **라우팅**: React Router DOM 7.11.0
- **스타일링**: Tailwind CSS
- **HTTP 클라이언트**: Axios 1.13.2
- **추가 라이브러리**: 
  - `classnames`: 클래스명 조건부 적용
  - `lucide-react`: 아이콘 라이브러리
  - `pretendard`: 웹폰트

---

## 🏗️ 프로젝트 아키텍처

### 전체 폴더 구조

```
src/
├── app/              # 앱 진입점 및 전역 스타일
│   ├── App.tsx       # 라우팅 설정
│   ├── App.css       # 앱 전역 CSS
│   └── index.css     # 전역 CSS
│
├── assets/           # 정적 자산
│   └── react.svg
│
├── features/         # Feature-based 모듈 구조
│   ├── auth/         # 인증 관련 기능
│   ├── comment/      # 댓글 기능
│   ├── landing/      # 랜딩 페이지 기능
│   ├── like/         # 좋아요 기능
│   ├── prompt/       # 프롬프트 기능
│   └── settings/     # 설정 기능
│
├── pages/            # 페이지 컴포넌트 (라우트 연결)
│   ├── auth/         # 인증 관련 페이지
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── OAuthSuccessPage.tsx
│   │   ├── OAuthFailurePage.tsx
│   │   └── AuthBootstrapPage.tsx
│   ├── PromptsHub.tsx        # 랜딩 페이지
│   ├── HomeFeedPage.tsx      # 홈 피드 페이지
│   ├── CreatePromptPage.tsx  # 프롬프트 생성 페이지
│   ├── PromptDetailPage.tsx  # 프롬프트 상세 페이지
│   ├── SettingsPage.tsx      # 설정 페이지
│   └── NotificationsPage.tsx # 알림 페이지
│
├── shared/           # 공통 모듈
│   ├── api/          # API 인스턴스 (axios)
│   ├── components/    # 공통 UI 컴포넌트
│   ├── config/        # 설정 파일
│   ├── hooks/         # 공통 커스텀 훅
│   ├── layout/        # 레이아웃 컴포넌트
│   └── types/         # 공통 타입
│
└── theme/            # 테마 설정
    └── colors.ts
```

---

## 📦 Feature 모듈 구조 패턴

각 feature는 다음과 같은 표준 구조를 따릅니다:

```
features/{feature-name}/
├── api/              # API 호출 함수
│   ├── {feature}.api.ts
│   └── index.ts      # export 통합
├── hooks/            # 커스텀 훅 (비즈니스 로직)
├── model/            # 비즈니스 로직, 상태 관리 로직
├── store/            # Zustand 스토어 (전역 상태)
├── types/            # 타입 정의
└── ui/               # 프레젠테이션 컴포넌트
```

### 구현된 Feature 모듈

#### 1. `auth` - 인증 기능

```
features/auth/
├── api/
│   ├── auth.api.ts      # 로그인, 로그아웃, OAuth 등
│   ├── oauth.ts         # OAuth 로그인 URL 생성
│   └── user.api.ts      # 사용자 정보 조회
├── hooks/
│   └── useAuth.ts       # 인증 관련 커스텀 훅
├── model/
│   ├── auth.types.ts    # 인증 관련 타입
│   ├── signup.constants.ts  # 회원가입 상수
│   ├── signup.utils.ts      # 회원가입 유틸리티
│   ├── useAuthView.ts   # 로그인 페이지 내부 뷰 상태 관리
│   └── useSignupView.ts # 회원가입 페이지 상태 관리
├── store/
│   └── auth.store.ts    # Zustand 인증 상태 스토어
├── types/
│   ├── signup.types.ts  # 회원가입 타입
│   └── user.ts          # 사용자 타입
└── ui/
    ├── LoginView.tsx
    ├── SignupView.tsx
    ├── ForgotPasswordView.tsx
    ├── VerifyEmailView.tsx
    └── signup/          # 회원가입 단계별 컴포넌트
        ├── SignupProgress.tsx
        ├── SignupStep1.tsx
        ├── SignupStep2.tsx
        ├── SignupStep3.tsx
        ├── SignupStep4.tsx
        └── SignupStep5.tsx
```

#### 2. `landing` - 랜딩 페이지

```
features/landing/
├── model/
│   ├── useHeaderScroll.ts  # 헤더 스크롤 처리
│   └── useLandingView.ts   # 랜딩 페이지 상태 관리
├── types/
│   └── landing.types.ts    # 랜딩 페이지 타입
└── ui/
    ├── LandingView.tsx      # 메인 랜딩 뷰
    ├── LandingHeader.tsx    # 랜딩 헤더
    ├── LandingHero.tsx     # 히어로 섹션
    └── LandingFooter.tsx   # 랜딩 푸터
```

#### 3. `prompt` - 프롬프트 기능

```
features/prompt/
├── api/
│   ├── prompt.api.ts
│   └── index.ts
├── model/
│   ├── createPrompt.constants.ts
│   ├── enumDisplayNames.ts
│   ├── enumGuidelines.ts
│   ├── homeFeed.constants.ts
│   ├── useComments.ts
│   ├── useCreatePromptView.ts
│   ├── useHomeFeedView.ts
│   ├── usePromptActions.ts
│   ├── usePromptDetail.ts
│   ├── usePromptDetailView.ts
│   └── useRelatedPrompts.ts
├── types/
│   ├── prompt.types.ts
│   └── index.ts
└── ui/
    ├── AuthorCard.tsx
    ├── CommentsSection.tsx
    ├── CreatePromptView.tsx
    ├── DeletePromptModal.tsx
    ├── EditPromptModal.tsx
    ├── HomeFeedView.tsx
    ├── PromptDetailCard.tsx
    ├── PromptDetailHeader.tsx
    ├── PromptDetailView.tsx
    ├── RelatedPrompts.tsx
    ├── utils.ts
    └── create/              # 프롬프트 생성 단계별 컴포넌트
        ├── AdvancedOptionsStep.tsx
        ├── BodyStep.tsx
        ├── CreatePromptSuccess.tsx
        ├── DomainStep.tsx
        ├── InputStep.tsx
        ├── PublicStep.tsx
        ├── TagsStep.tsx
        └── TitleStep.tsx
```

#### 4. `comment` - 댓글 기능

```
features/comment/
├── api/
│   ├── comment.api.ts
│   └── index.ts
└── types/
    ├── comment.types.ts
    └── index.ts
```

#### 5. `like` - 좋아요 기능

```
features/like/
├── api/
│   ├── like.api.ts
│   └── index.ts
```

#### 6. `settings` - 설정 기능

```
features/settings/
├── constants/
│   └── settings.constants.ts
├── model/
│   └── useSettingsPage.ts
├── types/
│   └── settings.types.ts
└── ui/
    ├── SettingsView.tsx
    ├── AppearanceTab.tsx
    ├── DeleteUserModal.tsx
    ├── LogoutModal.tsx
    ├── NotificationsTab.tsx
    ├── ProfileTab.tsx
    └── SecurityTab.tsx
```

---

## 🔌 API 레이어 구조

### 중앙화된 API 인스턴스

**위치**: `src/shared/api/axios.ts`

**기능**:
- Base URL 설정
- Request Interceptor: accessToken 자동 첨부
- Response Interceptor: 401 에러 시 자동 토큰 갱신 및 재시도

### API 호출 패턴

```typescript
// features/{feature}/api/{feature}.api.ts
import { api } from '@/shared/api/axios';
import type { ResponseType } from '@/features/{feature}/types/{feature}.types';

export const {feature}Api = {
  getList: (params: ParamsType) => 
    api.get<ResponseType>('/endpoint', { params }),
  create: (data: CreateType) => 
    api.post<ResponseType>('/endpoint', data),
  // ...
};
```

**패턴 규칙**:
- `@/shared/api/axios`의 `api` 인스턴스만 사용
- 타입은 `@/features/{feature}/types/` 또는 `model/`에서 import
- 비즈니스 로직 포함 금지
- 데이터 변환은 최소화

**구현된 API 모듈**:
- `auth.api.ts`: 인증 관련 API (login, logout 등)
- `oauth.ts`: OAuth 로그인 URL 생성
- `user.api.ts`: 사용자 정보 조회
- `prompt.api.ts`: 프롬프트 관련 API
- `comment.api.ts`: 댓글 관련 API
- `like.api.ts`: 좋아요 관련 API

---

## 🗂️ 상태 관리 구조

### Zustand 스토어

**위치**: `src/features/{feature}/store/{feature}.store.ts`

**구현된 스토어**:
- `auth.store.ts`: 인증 토큰 및 인증 상태 관리

**패턴**:
```typescript
// features/{feature}/store/{feature}.store.ts
import { create } from 'zustand';
import type { StateType } from '@/features/{feature}/types/{feature}.types';

interface State {
  data: StateType | null;
  setData: (value: StateType) => void;
  clear: () => void;
}

export const useStore = create<State>((set) => ({
  data: null,
  setData: (value) => set({ data: value }),
  clear: () => set({ data: null }),
}));
```

**규칙**:
- 타입은 `@/features/{feature}/types/`에서 import
- 전역에서 공유해야 하는 상태만 저장
- 로컬 상태는 컴포넌트나 `model/`의 커스텀 훅에서 관리

---

## 🧭 라우팅 구조

### 라우트 정의

**위치**: `src/app/App.tsx`

```typescript
<Routes>
  <Route element={<AppLayout />}>
    <Route path="/" element={<PromptsHub />} />
    <Route path="/feed" element={<HomeFeedPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/auth/success" element={<OAuthSuccessPage />} />
    <Route path="/auth/bootstrap" element={<BootstrapPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
    <Route path="/prompts/create" element={<CreatePromptPage />} />
    <Route path="/prompts/:id" element={<PromptDetailPage />} />
  </Route>
</Routes>
```

**참고**: `OAuthFailurePage`는 현재 라우트에 등록되어 있지 않지만, OAuth 실패 시 리다이렉트를 위해 준비되어 있습니다.

### 페이지 UI 설정

**위치**: `src/shared/config/`

- `pageConfig.ts`: 
  - `PAGE_UI_CONFIG`: 페이지별 헤더/푸터/플로팅 버튼 설정
  - `HEADER_CONFIG`: 헤더 상세 설정
  - `OAUTH2_CONFIG`: OAuth2 리다이렉트 URL 설정
- `PAGE_TITLE_CONFIG.ts`: 페이지별 타이틀 설정 (별도 파일로 분리)
- `env.ts`: 환경 변수 설정 (`VITE_*` 변수 관리)

**사용처**: `AppLayout.tsx`에서 현재 경로에 맞는 설정을 동적으로 적용

---

## 🎨 레이아웃 시스템

### AppLayout 컴포넌트

**위치**: `src/shared/layout/AppLayout.tsx`

**기능**:
- 현재 경로에 따라 헤더/푸터 표시 여부 결정
- 페이지 타이틀 자동 설정
- 플로팅 버튼 관리
- 사이드바 관리

**하위 컴포넌트**:
- `Header.tsx`: 상단 헤더
- `Sidebar.tsx`: 사이드바
- `FloatingButtonManager.tsx`: 플로팅 버튼 관리

---

## 📄 페이지 구조

### 페이지 컴포넌트 위치

**위치**: `src/pages/`

**구현된 페이지**:
1. `PromptsHub.tsx` → `features/landing/ui/LandingView.tsx` (랜딩 페이지)
2. `HomeFeedPage.tsx` → `features/prompt/ui/HomeFeedView.tsx` (홈 피드)
3. `auth/LoginPage.tsx` → `features/auth/ui/LoginView.tsx` (로그인)
4. `auth/SignupPage.tsx` → `features/auth/ui/SignupView.tsx` (회원가입)
5. `auth/OAuthSuccessPage.tsx` (OAuth 성공 처리)
6. `auth/OAuthFailurePage.tsx` (OAuth 실패 처리, 라우트 미등록)
7. `auth/AuthBootstrapPage.tsx` (인증 후 부트스트랩)
8. `CreatePromptPage.tsx` → `features/prompt/ui/CreatePromptView.tsx` (프롬프트 생성)
9. `PromptDetailPage.tsx` → `features/prompt/ui/PromptDetailView.tsx` (프롬프트 상세)
10. `SettingsPage.tsx` → `features/settings/ui/SettingsView.tsx` (설정)
11. `NotificationsPage.tsx` (알림)

### 페이지와 View 분리 원칙

- **페이지** (`pages/`): 라우트에 직접 연결되는 얇은 래퍼 컴포넌트
  - 역할: 라우트 연결만 담당
  - 패턴: View 컴포넌트를 import하여 렌더링
  - 예시:
    ```typescript
    // pages/auth/LoginPage.tsx
    import { LoginView } from '@/features/auth/ui/LoginView';
    
    export default function LoginPage() {
      return <LoginView />;
    }
    ```

- **View** (`features/{feature}/ui/`): 실제 UI 로직과 프레젠테이션을 담은 컴포넌트
  - 역할: UI 렌더링, 사용자 인터랙션 처리, 내부 상태 관리
  - 패턴: API 호출은 feature의 `api/` 또는 `hooks/`에서 가져와 사용

---

## 🔧 공통 컴포넌트

**위치**: `src/shared/components/`

**구현된 컴포넌트**:
- `Button.tsx`: 공통 버튼 컴포넌트
- `FloatingButton.tsx`: 플로팅 버튼 컴포넌트
- `Modal.tsx`: 공통 모달 컴포넌트 (기본 모달)
- `TermsModal.tsx`: 이용약관/개인정보처리방침 모달 컴포넌트

---

## 🪝 공통 훅

**위치**: `src/shared/hooks/`

**구현된 훅**:
- `useTermsModal.ts`: 이용약관 모달 상태 관리 훅

---

## 🎯 프로젝트 컨벤션

### 네이밍 규칙

1. **파일명**:
   - 컴포넌트: PascalCase (예: `LoginView.tsx`)
   - 유틸리티/타입: camelCase (예: `auth.types.ts`)
   - API: camelCase (예: `auth.api.ts`)
   - 훅: camelCase (예: `useAuth.ts`, `useAuthView.ts`)

2. **폴더명**: 소문자 (예: `features/auth/api/`)

3. **컴포넌트 export**:
   - Named export (예: `export function LoginView()`)
   - Default export는 페이지 컴포넌트(`pages/`)에만 사용

### 파일 분리 규칙

#### 1. 페이지(Pages) vs 뷰(View) 분리

- **페이지** (`src/pages/`): 라우트에 직접 연결되는 얇은 래퍼 컴포넌트
- **뷰** (`src/features/{feature}/ui/`): 실제 UI 로직과 프레젠테이션을 담은 컴포넌트

#### 2. API 분리

- **위치**: `src/features/{feature}/api/`
- **역할**: 서버와의 통신만 담당
- **규칙**:
  - `shared/api/axios.ts`의 `api` 인스턴스를 사용
  - 비즈니스 로직 포함 금지
  - 데이터 변환 최소화

#### 3. 훅(Hooks) vs 모델(Model) 분리

- **훅** (`src/features/{feature}/hooks/`): 재사용 가능한 비즈니스 로직 훅
  - 역할: 여러 컴포넌트에서 공유되는 로직
  - 예시: `useAuth.ts` - 인증 관련 전역 로직

- **모델** (`src/features/{feature}/model/`): 특정 View나 페이지에 종속된 상태 관리 로직
  - 역할: 특정 UI 컨텍스트의 상태 관리
  - 예시: `useAuthView.ts` - 로그인 페이지의 view 전환 로직, `useSignupView.ts` - 회원가입 단계 관리

#### 4. 타입(Types) 분리

- **위치**: `src/features/{feature}/types/` 또는 `model/`
- **구분**:
  - `types/`: 도메인 엔티티 타입 (예: `user.ts`, `signup.types.ts`)
  - `model/`: 특정 기능에서만 사용하는 타입 (예: `auth.types.ts`)

#### 5. 스토어(Store) 분리

- **위치**: `src/features/{feature}/store/`
- **역할**: Zustand를 사용한 전역 상태 관리
- **규칙**: API 호출 결과나 여러 컴포넌트에서 공유해야 하는 상태만 저장

### Import 경로 규칙

**⚠️ 중요: 모든 `src` 내부 파일은 반드시 `@/` 별칭을 사용해야 합니다.**

#### @ 별칭 사용 (필수)

- **규칙**: `src` 폴더 내의 모든 파일은 `@/` 별칭을 사용하여 import
- **형식**: `@/{src 하위 경로}`
- **예시**:
  ```typescript
  // ✅ 올바른 사용
  import { LoginView } from '@/features/auth/ui/LoginView';
  import { authApi } from '@/features/auth/api/auth.api';
  import { useAuthStore } from '@/features/auth/store/auth.store';
  import { api } from '@/shared/api/axios';
  import { Button } from '@/shared/components/Button';
  ```

#### 상대 경로 사용 (제한적)

- **규칙**: 같은 폴더 내의 파일만 상대 경로 허용
- **예시**:
  ```typescript
  // ✅ 같은 폴더 내에서는 허용
  // features/auth/ui/signup/SignupStep1.tsx
  import { SignupStep2 } from './SignupStep2';
  
  ```

#### @ 별칭 설정

- **Vite 설정** (`vite.config.ts`):
  ```typescript
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
  ```

- **TypeScript 설정** (`tsconfig.json`, `tsconfig.app.json`):
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"]
      }
    }
  }
  ```

### 관심사 분리 원칙

1. **API 호출**: `features/{feature}/api/`에만 위치
   - 서버 통신 로직만 포함
   - 비즈니스 로직 포함 금지

2. **비즈니스 로직**: 
   - 재사용 가능한 로직: `features/{feature}/hooks/`
   - View별 로직: `features/{feature}/model/`

3. **UI 컴포넌트**: 
   - Feature별 UI: `features/{feature}/ui/`
   - 공통 UI: `shared/components/`

4. **상태 관리**: 
   - 전역 상태: `features/{feature}/store/` (Zustand)
   - 로컬 상태: 컴포넌트 내부 또는 `model/`의 커스텀 훅

5. **타입 정의**: 
   - 도메인 타입: `features/{feature}/types/`
   - 기능별 타입: `features/{feature}/model/`
   - 공통 API 타입: `shared/types/api.ts`

### Import 예시

```typescript
// ✅ 페이지 컴포넌트
// pages/auth/LoginPage.tsx
import { LoginView } from '@/features/auth/ui/LoginView';

// ✅ View 컴포넌트
// features/auth/ui/LoginView.tsx
import { authApi } from '@/features/auth/api/auth.api';
import { oauthLogin } from '@/features/auth/api/oauth';
import { useAuthStore } from '@/features/auth/store/auth.store';

// ✅ API 모듈
// features/auth/api/auth.api.ts
import { api } from '@/shared/api/axios';
import type { TokenResponse } from '@/features/auth/model/auth.types';

// ✅ 공통 컴포넌트
// shared/layout/AppLayout.tsx
import Header from '@/shared/layout/Header';
import { PAGE_UI_CONFIG } from '@/shared/config/pageConfig';
```

---

## 🔄 페이지 흐름

### 인증 플로우

```
/login
  ↓ (OAuth 로그인 클릭)
외부 OAuth 제공자
  ↓ (성공 시)
/auth/success?key=xxx&state=yyy
  ↓ (토큰 저장 후)
/auth/bootstrap
  ↓ (사용자 정보 확인)
/ (랜딩 페이지) 또는 /feed
```

### 페이지 간 연결

- **랜딩 페이지** (`/`): `PromptsHub.tsx` → `features/landing/ui/LandingView.tsx`
- **홈 피드** (`/feed`): `HomeFeedPage.tsx` → `features/prompt/ui/HomeFeedView.tsx`
- **로그인 페이지** (`/login`): `LoginPage.tsx` → `features/auth/ui/LoginView.tsx`
- **회원가입 페이지** (`/signup`): `SignupPage.tsx` → `features/auth/ui/SignupView.tsx`
- **OAuth 성공** (`/auth/success`): `OAuthSuccessPage.tsx`
- **OAuth 실패**: `OAuthFailurePage.tsx` (준비됨, 라우트 미등록)
- **인증 부트스트랩** (`/auth/bootstrap`): `AuthBootstrapPage.tsx`
- **프롬프트 생성** (`/prompts/create`): `CreatePromptPage.tsx` → `features/prompt/ui/CreatePromptView.tsx`
- **프롬프트 상세** (`/prompts/:id`): `PromptDetailPage.tsx` → `features/prompt/ui/PromptDetailView.tsx`
- **설정** (`/settings`): `SettingsPage.tsx` → `features/settings/ui/SettingsView.tsx`
- **알림** (`/notifications`): `NotificationsPage.tsx`

---

## ⚠️ 현재 구조의 특징

### ✅ 잘 설계된 부분

1. **Feature-based 구조**: 기능별로 명확히 분리
2. **API 레이어 중앙화**: axios 인스턴스와 인터셉터 통합 관리
3. **관심사 분리**: API, UI, 상태 관리가 명확히 분리
4. **타입 안정성**: TypeScript로 타입 정의
5. **재사용 가능한 컴포넌트**: shared 폴더에 공통 컴포넌트
6. **모듈화된 회원가입/프롬프트 생성**: 단계별 컴포넌트로 분리하여 유지보수성 향상
7. **환경 변수 관리**: `env.ts`를 통한 중앙화된 환경 변수 관리
8. **페이지-View 분리**: 라우트 연결과 UI 로직의 명확한 분리

### 🔍 개선 가능한 부분

1. **에러 처리**: 일관된 에러 처리 패턴 부재
2. **로딩 상태**: 로딩 상태 관리가 페이지별로 다름
3. **타입 정의 위치**: `model/`과 `types/` 폴더의 사용 기준 명확화 필요
4. **설정 파일 분리**: `PAGE_TITLE_CONFIG`가 `pageConfig.ts`와 별도 파일에 존재 (통합 고려)

---

## 📝 다음 단계

사용자가 제공할 페이지를 분석하여:
1. 페이지의 목적 명확화
2. 관심사 분리 수행
3. 기존 구조와의 통합
4. 개선 제안

이 문서는 프로젝트 구조를 이해한 후, 특정 페이지 리팩토링 시 참고 자료로 사용됩니다.
