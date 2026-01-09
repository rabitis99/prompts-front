# 프로젝트 구조 분석 문서

## 📋 프로젝트 개요

- **프로젝트명**: my-app (PromptHub)
- **스택**: React 19.2.0 + TypeScript + Vite
- **상태 관리**: Zustand 5.0.9
- **라우팅**: React Router DOM 7.11.0
- **스타일링**: Tailwind CSS
- **HTTP 클라이언트**: Axios 1.13.2

---

## 🏗️ 프로젝트 아키텍처

### 전체 폴더 구조

```
src/
├── app/              # 앱 진입점 및 전역 스타일
│   ├── App.tsx       # 라우팅 설정
│   └── index.css     # 전역 CSS
│
├── features/         # Feature-based 모듈 구조
│   ├── auth/         # 인증 관련 기능
│   ├── comment/      # 댓글 기능
│   ├── landing/     # 랜딩 페이지 기능
│   ├── like/        # 좋아요 기능
│   └── prompt/      # 프롬프트 기능
│
├── pages/            # 페이지 컴포넌트 (라우트 연결)
│   ├── auth/         # 인증 관련 페이지
│   └── PromptsHub.tsx # 랜딩 페이지
│
├── shared/           # 공통 모듈
│   ├── api/          # API 인스턴스 (axios)
│   ├── components/   # 공통 UI 컴포넌트
│   ├── config/       # 설정 파일
│   ├── layout/       # 레이아웃 컴포넌트
│   └── types/        # 공통 타입
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

### 예시: `auth` feature

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
│   └── useAuthView.ts   # 로그인 페이지 내부 뷰 상태 관리
├── store/
│   └── auth.store.ts    # Zustand 인증 상태 스토어
├── types/
│   └── user.ts          # 사용자 타입
└── ui/
    ├── LoginView.tsx
    ├── ForgotPasswordView.tsx
    └── VerifyEmailView.tsx
```

---

## 🔌 API 레이어 구조

### 중앙화된 API 인스턴스

**위치**: `src/shared/api/axios.ts`

- **기능**:
  - Base URL 설정
  - Request Interceptor: accessToken 자동 첨부
  - Response Interceptor: 401 에러 시 자동 토큰 갱신 및 재시도

### API 호출 패턴

```typescript
// features/{feature}/api/{feature}.api.ts
import { api } from '@/shared/api/axios';

export const {feature}Api = {
  getList: (params) => api.get('/endpoint', { params }),
  create: (data) => api.post('/endpoint', data),
  // ...
};
```

**현재 구현된 API 모듈**:
- `auth.api.ts`: 인증 관련 API
- `prompt.api.ts`: 프롬프트 관련 API
- `comment.api.ts`: 댓글 관련 API
- `like.api.ts`: 좋아요 관련 API

---

## 🗂️ 상태 관리 구조

### Zustand 스토어

**위치**: `src/features/{feature}/store/{feature}.store.ts`

**현재 구현된 스토어**:
- `auth.store.ts`: 인증 토큰 및 인증 상태 관리

**패턴**:
```typescript
import { create } from 'zustand';

interface State {
  // 상태
  setState: (value) => void;
  clear: () => void;
}

export const useStore = create<State>((set) => ({
  // 초기값
  setState: (value) => set({ value }),
  clear: () => set({ /* 초기화 */ }),
}));
```

---

## 🧭 라우팅 구조

### 라우트 정의

**위치**: `src/app/App.tsx`

```typescript
<Routes>
  <Route element={<AppLayout />}>
    <Route path="/" element={<PromptsHub />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/auth/success" element={<OAuthSuccessPage />} />
    <Route path="/auth/bootstrap" element={<AuthBootstrapPage />} />
  </Route>
</Routes>
```

### 페이지 UI 설정

**위치**: `src/shared/config/pageConfig.ts`

- `PAGE_UI_CONFIG`: 페이지별 헤더/푸터/플로팅 버튼 설정
- `PAGE_TITLE_CONFIG`: 페이지별 타이틀 설정
- `HEADER_CONFIG`: 헤더 상세 설정

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

**현재 페이지**:
1. `PromptsHub.tsx` (랜딩 페이지)
2. `auth/LoginPage.tsx` (로그인 페이지)
3. `auth/OAuthSuccessPage.tsx` (OAuth 성공 처리)
4. `auth/AuthBootstrapPage.tsx` (인증 후 부트스트랩)

### 페이지와 View 분리

- **페이지** (`pages/`): 라우트에 직접 연결되는 컴포넌트
- **View** (`features/{feature}/ui/`): 실제 UI 로직을 담은 컴포넌트

**예시**:
- `pages/auth/LoginPage.tsx` → `features/auth/ui/LoginView.tsx` 사용

---

## 🔧 공통 컴포넌트

**위치**: `src/shared/components/`

**현재 구현된 컴포넌트**:
- `Button.tsx`: 공통 버튼 컴포넌트
- `FloatingButton.tsx`: 플로팅 버튼 컴포넌트

---

## 🎯 프로젝트 컨벤션

### 네이밍 규칙

1. **파일명**:
   - 컴포넌트: PascalCase (예: `LoginView.tsx`)
   - 유틸리티/타입: camelCase (예: `auth.types.ts`)
   - API: camelCase (예: `auth.api.ts`)

2. **폴더명**:
   - 소문자 (예: `features/auth/api/`)

3. **컴포넌트 export**:
   - Named export (예: `export function LoginView()`)
   - Default export는 페이지 컴포넌트에만 사용

### Import 경로

- `@/` 별칭 사용 (예: `@/features/auth/hooks/useAuth`)
- 상대 경로는 같은 폴더 내에서만 사용

### 관심사 분리 원칙

1. **API 호출**: `features/{feature}/api/`에만 위치
2. **비즈니스 로직**: `features/{feature}/hooks/` 또는 `model/`
3. **UI 컴포넌트**: `features/{feature}/ui/` 또는 `shared/components/`
4. **상태 관리**: `features/{feature}/store/` (Zustand)
5. **타입 정의**: `features/{feature}/types/` 또는 `model/`

---

## 🔄 현재 페이지 흐름

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
/ (랜딩 페이지) 또는 /onboarding
```

### 페이지 간 연결

- **랜딩 페이지** (`/`): `PromptsHub.tsx`
- **로그인 페이지** (`/login`): `LoginPage.tsx`
- **OAuth 성공** (`/auth/success`): `OAuthSuccessPage.tsx`
- **인증 부트스트랩** (`/auth/bootstrap`): `AuthBootstrapPage.tsx`

---

## ⚠️ 현재 구조의 특징

### ✅ 잘 설계된 부분

1. **Feature-based 구조**: 기능별로 명확히 분리
2. **API 레이어 중앙화**: axios 인스턴스와 인터셉터 통합 관리
3. **관심사 분리**: API, UI, 상태 관리가 명확히 분리
4. **타입 안정성**: TypeScript로 타입 정의
5. **재사용 가능한 컴포넌트**: shared 폴더에 공통 컴포넌트

### 🔍 개선 가능한 부분

1. **페이지 컴포넌트의 역할**: 일부 페이지가 직접 API 호출하거나 비즈니스 로직 포함
2. **에러 처리**: 일관된 에러 처리 패턴 부재
3. **로딩 상태**: 로딩 상태 관리가 페이지별로 다름
4. **타입 정의 위치**: `model/`과 `types/` 폴더가 혼재

---

## 📝 다음 단계

사용자가 제공할 페이지를 분석하여:
1. 페이지의 목적 명확화
2. 관심사 분리 수행
3. 기존 구조와의 통합
4. 개선 제안

이 문서는 프로젝트 구조를 이해한 후, 특정 페이지 리팩토링 시 참고 자료로 사용됩니다.

