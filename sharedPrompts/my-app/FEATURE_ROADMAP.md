# 기능 개발 로드맵

## 📋 개요

이 문서는 **프롬프트 공유 커뮤니티** 프로젝트의 앞으로 추가할 기능들을 우선순위, 의존성, 시기별로 정리한 실전 로드맵입니다.  
백엔드-프론트엔드 비교 분석, 워크플로우 확장 가이드, 프로젝트 구조 분석 문서를 기반으로 작성되었습니다.

**최종 업데이트**: 2025년  
**프로젝트 상태**: 핵심 기능 완료, 보안/성능 개선 진행 중, 신규 기능 개발 계획 수립

---

## 🎯 개발 전략

### 작업 분류 기준

1. **백엔드 독립 작업**: 백엔드 API 없이도 프론트엔드에서 완전히 구현 가능
2. **백엔드 의존 작업**: 백엔드 API가 필요하지만 구조 설계는 선행 가능
3. **백엔드 필수 작업**: 백엔드 API 완료 후에만 구현 가능

### 우선순위 결정 기준

- 🔴 **P0 (Critical)**: 보안/안정성 관련, 즉시 대응 필요
- 🟠 **P1 (High)**: 사용자 경험 개선, 단기 내 완료 필요
- 🟡 **P2 (Medium)**: 신규 기능, 중기 계획
- 🟢 **P3 (Low)**: 최적화/운영 도구, 장기 계획

---

## 📅 단계별 개발 계획

### Phase 1: 기반 구축 (1-2주) 🔴 P0

**목표**: 보안 강화 및 개발 환경 개선

#### Week 1: 보안 및 안정성

**1.1 Rate Limiting 대응** (2일)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 Rate Limiting 구현 후 테스트 필요
- **작업 내용**:
  - [ ] `src/shared/api/axios.ts` response interceptor에 429 에러 처리 추가
  - [ ] `src/shared/utils/errorHandler.ts` 생성 및 Rate Limit 에러 핸들러 구현
  - [ ] `Retry-After` 헤더 파싱 및 재시도 안내 로직
  - [ ] Toast 알림 컴포넌트 연동 (또는 기존 알림 시스템 활용)
  - [ ] Rate limit 초과 시 사용자 친화적 메시지 표시
- **구현 위치**:
  - `src/shared/api/axios.ts` (response interceptor)
  - `src/shared/utils/errorHandler.ts` (신규)
- **테스트**: 백엔드 Rate Limiting 활성화 후 429 에러 시나리오 테스트

**1.2 입력값 검증 강화 (XSS 방지)** (2일)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ✅ 독립 작업 (백엔드에서도 처리되지만 이중 방어)
- **작업 내용**:
  - [ ] `src/shared/utils/sanitize.ts` 생성
    - [ ] HTML 태그 제거 함수
    - [ ] 특수 문자 이스케이프 함수
    - [ ] URL 검증 함수
  - [ ] 프롬프트 생성/수정 시 sanitization 적용
    - [ ] `src/features/prompt/ui/CreatePromptView.tsx`
    - [ ] `src/features/prompt/ui/EditPromptModal.tsx`
  - [ ] 댓글 작성 시 sanitization 적용
    - [ ] `src/features/comment/` 관련 컴포넌트
  - [ ] 사용자 프로필 수정 시 sanitization 적용
    - [ ] `src/features/settings/ui/ProfileTab.tsx`
- **구현 위치**:
  - `src/shared/utils/sanitize.ts` (신규)
  - 각 입력 컴포넌트
- **테스트**: XSS 공격 시나리오 테스트 (스크립트 태그, 이벤트 핸들러 등)

**1.3 에러 처리 개선** (3일)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 `CustomResponse` 형식 확인 필요
- **작업 내용**:
  - [ ] `src/shared/utils/errorHandler.ts` 확장
    - [ ] 백엔드 `CustomResponse` 형식 파싱
    - [ ] 에러 코드별 메시지 매핑 테이블
    - [ ] 네트워크 오류 처리
    - [ ] 타임아웃 에러 처리
  - [ ] `src/shared/api/axios.ts` response interceptor 개선
    - [ ] 에러 핸들러 통합
    - [ ] 에러 로깅 추가
  - [ ] 에러 바운더리 컴포넌트 생성 (`src/shared/components/ErrorBoundary.tsx`)
  - [ ] 각 feature의 API 모듈에 에러 처리 적용
- **구현 위치**:
  - `src/shared/utils/errorHandler.ts` (확장)
  - `src/shared/api/axios.ts` (개선)
  - `src/shared/components/ErrorBoundary.tsx` (신규)
- **테스트**: 다양한 에러 시나리오 테스트 (400, 401, 403, 404, 500, 네트워크 오류)

---

#### Week 2: 개발 환경 개선

**2.1 로딩 상태 관리 패턴 통일** (2일)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ✅ 독립 작업
- **작업 내용**:
  - [ ] `src/shared/components/LoadingSpinner.tsx` 생성 (표준화된 스피너)
  - [ ] `src/shared/components/Skeleton.tsx` 생성 (스켈레톤 UI 컴포넌트)
    - [ ] 텍스트 스켈레톤
    - [ ] 카드 스켈레톤
    - [ ] 리스트 스켈레톤
  - [ ] 로딩 상태 관리 패턴 문서화
  - [ ] 주요 페이지에 일관된 로딩 상태 적용
    - [ ] `src/features/prompt/ui/HomeFeedView.tsx`
    - [ ] `src/features/prompt/ui/PromptDetailView.tsx`
    - [ ] `src/pages/NotificationsPage.tsx`
- **구현 위치**:
  - `src/shared/components/LoadingSpinner.tsx` (신규)
  - `src/shared/components/Skeleton.tsx` (신규)
  - 각 View 컴포넌트
- **테스트**: 로딩 상태 UI 일관성 확인

**2.2 타입 안정성 강화** (3일)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 DTO 구조 확인 필요
- **작업 내용**:
  - [ ] 백엔드 DTO와 프론트엔드 타입 정의 일치 여부 점검
  - [ ] 타입 불일치 항목 수정
  - [ ] API 응답 타입 검증 유틸리티 생성 (`src/shared/utils/typeValidator.ts`)
  - [ ] 신규 API 추가 시 타입 정의 동기화 가이드 작성
- **구현 위치**:
  - 각 feature의 `types/` 폴더
  - `src/shared/utils/typeValidator.ts` (신규)
- **테스트**: TypeScript 컴파일 에러 확인, 런타임 타입 검증

---

### Phase 2: 신규 기능 개발 (3-8주) 🟡 P2

#### Week 3-4: 워크플로우 모듈 (백엔드 독립)

**3.1 워크플로우 모듈 기본 구조** (1주)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ✅ 독립 작업 (초기에는 하드코딩된 데이터 사용)
- **작업 내용**:
  - [ ] `src/features/workflow/types/workflow.types.ts` 타입 정의
  - [ ] `src/features/workflow/model/workflow.constants.ts` 워크플로우 상수 정의
    - [ ] 마케팅 도메인 워크플로우 (블로그 글 작성, 광고 카피 생성)
    - [ ] 개발 도메인 워크플로우 (코드 리뷰 도우미)
    - [ ] 비즈니스 도메인 워크플로우 (이메일 템플릿 생성)
  - [ ] `src/features/workflow/model/useWorkflowFeedView.ts` 목록 뷰 로직
  - [ ] `src/features/workflow/model/useWorkflowExecution.ts` 실행 로직
- **구현 위치**:
  - `src/features/workflow/` (신규 모듈)
- **참고**: `MODULE_EXTENSION_GUIDE.md` 64-797줄

**3.2 워크플로우 UI 컴포넌트** (1주)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ✅ 독립 작업
- **작업 내용**:
  - [ ] `src/features/workflow/ui/WorkflowFeedView.tsx` 목록 화면
  - [ ] `src/features/workflow/ui/WorkflowCard.tsx` 카드 컴포넌트
  - [ ] `src/features/workflow/ui/WorkflowExecutionView.tsx` 실행 화면
    - [ ] 입력 필드 렌더링 (TEXT, TEXTAREA, SELECT, MULTI_SELECT)
    - [ ] 프롬프트 템플릿 변수 치환
    - [ ] 실행 결과 표시
    - [ ] 단계별 진행 표시
  - [ ] `src/pages/WorkflowFeedPage.tsx` 페이지 컴포넌트
  - [ ] `src/pages/WorkflowExecutionPage.tsx` 페이지 컴포넌트
  - [ ] `src/app/App.tsx` 라우팅 추가
- **구현 위치**:
  - `src/features/workflow/ui/` (신규)
  - `src/pages/` (신규)
  - `src/app/App.tsx` (수정)
- **테스트**: 워크플로우 목록 조회, 실행 플로우, 입력값 검증

**3.3 워크플로우 백엔드 연동 (선택사항, 나중에)**
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 API 필요
- **작업 내용**:
  - [ ] `src/features/workflow/api/workflow.api.ts` 생성
  - [ ] `useWorkflowExecution.ts`의 `simulateLLMCall`을 실제 API 호출로 교체
  - [ ] 워크플로우 목록을 API에서 가져오도록 변경
- **구현 위치**:
  - `src/features/workflow/api/workflow.api.ts` (신규)
  - `src/features/workflow/model/useWorkflowExecution.ts` (수정)

---

#### Week 5-7: 알림 시스템 (백엔드 의존)

**4.1 알림 시스템 구조 설계** (1주)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 API 설계 확인 필요
- **작업 내용**:
  - [ ] `src/features/notifications/types/notification.types.ts` 타입 정의
  - [ ] `src/features/notifications/api/notification.api.ts` API 모듈 생성
    - [ ] 알림 목록 조회
    - [ ] 읽지 않은 알림 개수 조회
    - [ ] 알림 읽음 처리
    - [ ] 알림 삭제
  - [ ] `src/features/notifications/store/notification.store.ts` Zustand 스토어 생성
  - [ ] 현재 더미 데이터를 실제 API로 교체할 수 있도록 구조화
- **구현 위치**:
  - `src/features/notifications/` (신규 모듈)
- **예상 API 엔드포인트**:
  - `GET /notifications` - 알림 목록 조회
  - `GET /notifications/unread-count` - 읽지 않은 알림 개수
  - `PATCH /notifications/{id}/read` - 알림 읽음 처리
  - `PATCH /notifications/read-all` - 모든 알림 읽음 처리
  - `DELETE /notifications/{id}` - 알림 삭제

**4.2 알림 UI 구현** (1주)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 API 필요
- **작업 내용**:
  - [ ] `src/features/notifications/ui/NotificationListView.tsx` 알림 목록 화면
  - [ ] `src/features/notifications/ui/NotificationItem.tsx` 알림 아이템 컴포넌트
  - [ ] `src/pages/NotificationsPage.tsx` 더미 데이터를 실제 API로 교체
  - [ ] 헤더에 알림 아이콘 및 읽지 않은 알림 개수 표시
- **구현 위치**:
  - `src/features/notifications/ui/` (신규)
  - `src/pages/NotificationsPage.tsx` (수정)
  - `src/shared/layout/Header.tsx` (수정)

**4.3 실시간 알림 연동** (1주)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 WebSocket/SSE 구현 필요
- **작업 내용**:
  - [ ] WebSocket 또는 SSE 클라이언트 라이브러리 선정
  - [ ] `src/shared/api/websocket.ts` 또는 `src/shared/api/sse.ts` 생성
  - [ ] 연결 관리 및 재연결 로직 구현
  - [ ] 알림 수신 시 Zustand 스토어 업데이트
  - [ ] 알림 수신 시 Toast 알림 표시
- **구현 위치**:
  - `src/shared/api/websocket.ts` 또는 `src/shared/api/sse.ts` (신규)
  - `src/features/notifications/store/notification.store.ts` (수정)

---

#### Week 8-9: 신고 기능 (백엔드 의존)

**5.1 신고 기능 구조 설계** (3일)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 API 설계 확인 필요
- **작업 내용**:
  - [ ] `src/features/report/types/report.types.ts` 타입 정의
  - [ ] `src/features/report/api/report.api.ts` API 모듈 생성
  - [ ] 신고 사유 상수 정의
- **구현 위치**:
  - `src/features/report/` (신규 모듈)
- **예상 API 엔드포인트**:
  - `POST /prompts/{id}/report` - 프롬프트 신고
  - `POST /comments/{id}/report` - 댓글 신고
  - `GET /reports/my` - 내가 신고한 내역 조회

**5.2 신고 UI 구현** (4일)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 API 필요
- **작업 내용**:
  - [ ] `src/shared/components/ReportModal.tsx` 신고 모달 컴포넌트
    - [ ] 신고 사유 선택 UI
    - [ ] 추가 설명 입력 필드
  - [ ] 프롬프트 상세 페이지에 신고 버튼 추가
    - [ ] `src/features/prompt/ui/PromptDetailView.tsx`
  - [ ] 댓글에 신고 버튼 추가
    - [ ] `src/features/comment/` 관련 컴포넌트
  - [ ] `src/pages/ReportHistoryPage.tsx` 신고 내역 조회 페이지
- **구현 위치**:
  - `src/shared/components/ReportModal.tsx` (신규)
  - `src/features/prompt/ui/` (수정)
  - `src/features/comment/` (수정)
  - `src/pages/ReportHistoryPage.tsx` (신규)

---

#### Week 10-12: 관리자 페이지 (백엔드 의존)

**6.1 관리자 권한 체크** (2일)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 권한 시스템 확인 필요
- **작업 내용**:
  - [ ] `src/shared/middleware/adminAuth.ts` 관리자 권한 체크 미들웨어
  - [ ] 관리자 라우트 보호 로직
  - [ ] 권한 부족 시 접근 차단 및 리다이렉트
- **구현 위치**:
  - `src/shared/middleware/adminAuth.ts` (신규)
  - `src/app/App.tsx` (라우트 보호 추가)

**6.2 관리자 페이지 구조** (1주)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 API 설계 확인 필요
- **작업 내용**:
  - [ ] `src/features/admin/types/admin.types.ts` 타입 정의
  - [ ] `src/features/admin/api/admin.api.ts` API 모듈 생성
  - [ ] 관리자 페이지 레이아웃 설계
- **구현 위치**:
  - `src/features/admin/` (신규 모듈)
- **예상 API 엔드포인트**:
  - `GET /admin/users` - 사용자 목록 조회
  - `PATCH /admin/users/{id}/block` - 사용자 차단
  - `PATCH /admin/users/{id}/role` - 사용자 권한 변경
  - `GET /admin/prompts` - 프롬프트 관리 목록
  - `PATCH /admin/prompts/{id}/visibility` - 프롬프트 공개/비공개 전환
  - `GET /admin/reports` - 신고 목록 조회
  - `PATCH /admin/reports/{id}/resolve` - 신고 처리

**6.3 관리자 UI 구현** (1주)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 API 필요
- **작업 내용**:
  - [ ] `src/pages/admin/AdminDashboardPage.tsx` 관리자 대시보드
  - [ ] `src/features/admin/ui/UserManagementView.tsx` 사용자 관리
  - [ ] `src/features/admin/ui/PromptManagementView.tsx` 프롬프트 관리
  - [ ] `src/features/admin/ui/ReportManagementView.tsx` 신고 처리
- **구현 위치**:
  - `src/pages/admin/` (신규)
  - `src/features/admin/ui/` (신규)

---

#### Week 13-15: 통계 기능 (백엔드 의존)

**7.1 통계 시스템 구조 설계** (3일)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 API 설계 확인 필요
- **작업 내용**:
  - [ ] 차트 라이브러리 선정 (Chart.js, Recharts 등)
  - [ ] `src/features/statistics/types/statistics.types.ts` 타입 정의
  - [ ] `src/features/statistics/api/statistics.api.ts` API 모듈 생성
- **구현 위치**:
  - `src/features/statistics/` (신규 모듈)
- **예상 API 엔드포인트**:
  - `GET /statistics/users` - 사용자 통계
  - `GET /statistics/prompts` - 프롬프트 통계
  - `GET /statistics/ai-calls` - AI 호출 통계
  - `GET /statistics/dashboard` - 대시보드 통합 통계

**7.2 통계 UI 구현** (2주)
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 API 필요
- **작업 내용**:
  - [ ] `src/shared/components/charts/` 차트 컴포넌트 생성
    - [ ] 라인 차트
    - [ ] 바 차트
    - [ ] 파이 차트
  - [ ] `src/features/statistics/ui/StatisticsDashboardView.tsx` 통계 대시보드
  - [ ] `src/pages/StatisticsPage.tsx` 통계 페이지
- **구현 위치**:
  - `src/shared/components/charts/` (신규)
  - `src/features/statistics/ui/` (신규)
  - `src/pages/StatisticsPage.tsx` (신규)

---

### Phase 3: 최적화 및 운영 (지속적) 🟢 P3

#### 성능 최적화 (지속적)

**8.1 캐싱 전략 도입**
- **상태**: 📅 계획됨
- **백엔드 의존성**: ⚠️ 백엔드 캐싱 전략 확인 필요
- **작업 내용**:
  - [ ] React Query 또는 SWR 도입 검토
  - [ ] `src/shared/hooks/useQuery.ts` 래퍼 생성
  - [ ] 주요 API 호출에 캐싱 적용
  - [ ] 불필요한 API 호출 최소화
- **구현 위치**:
  - `src/shared/hooks/useQuery.ts` (신규)
  - 각 feature의 API 모듈

**8.2 코드 최적화**
- **상태**: 📅 계획됨
- **백엔드 의존성**: ✅ 독립 작업
- **작업 내용**:
  - [ ] 이미지 최적화
  - [ ] 코드 스플리팅 (React.lazy, Suspense)
  - [ ] 번들 크기 최적화
  - [ ] 불필요한 리렌더링 최소화

---

#### 운영 도구 연동

**9.1 로깅 및 모니터링**
- **상태**: 📅 계획됨
- **백엔드 의존성**: ✅ 독립 작업
- **작업 내용**:
  - [ ] `src/shared/utils/logger.ts` 로깅 유틸리티 생성
  - [ ] Sentry 또는 유사 도구 연동
  - [ ] 에러 모니터링 설정
  - [ ] 성능 모니터링 설정
- **구현 위치**:
  - `src/shared/utils/logger.ts` (신규)
  - `src/shared/api/axios.ts` (에러 로깅 추가)

**9.2 CI/CD 파이프라인**
- **상태**: 📅 계획됨
- **백엔드 의존성**: ✅ 독립 작업
- **작업 내용**:
  - [ ] GitHub Actions 워크플로우 설정
  - [ ] 자동 빌드 및 테스트
  - [ ] 자동 배포 설정 (Vercel 연동)
- **구현 위치**:
  - `.github/workflows/` (신규)

---

## 📊 기능별 구현 상태 요약

| 기능 | 우선순위 | Phase | 상태 | 예상 기간 | 백엔드 의존성 |
|------|---------|-------|------|----------|--------------|
| Rate Limiting 대응 | 🔴 P0 | Phase 1 | 📅 계획됨 | 2일 | ⚠️ 테스트 필요 |
| 입력값 검증 강화 | 🔴 P0 | Phase 1 | 📅 계획됨 | 2일 | ✅ 독립 작업 |
| 에러 처리 개선 | 🔴 P0 | Phase 1 | 📅 계획됨 | 3일 | ⚠️ 형식 확인 필요 |
| 로딩 상태 관리 통일 | 🟠 P1 | Phase 1 | 📅 계획됨 | 2일 | ✅ 독립 작업 |
| 타입 안정성 강화 | 🟠 P1 | Phase 1 | 📅 계획됨 | 3일 | ⚠️ DTO 확인 필요 |
| 워크플로우 모듈 | 🟡 P2 | Phase 2 | 📅 계획됨 | 2주 | ✅ 독립 작업 |
| 알림 시스템 | 🟡 P2 | Phase 2 | 📅 계획됨 | 3주 | ⚠️ API 필요 |
| 신고 기능 | 🟡 P2 | Phase 2 | 📅 계획됨 | 1주 | ⚠️ API 필요 |
| 관리자 페이지 | 🟡 P2 | Phase 2 | 📅 계획됨 | 3주 | ⚠️ API 필요 |
| 통계 기능 | 🟡 P2 | Phase 2 | 📅 계획됨 | 3주 | ⚠️ API 필요 |
| 성능 최적화 | 🟢 P3 | Phase 3 | 📅 계획됨 | 지속적 | ⚠️ 전략 확인 필요 |
| 운영 도구 연동 | 🟢 P3 | Phase 3 | 📅 계획됨 | 2주 | ✅ 독립 작업 |
| CI/CD 파이프라인 | 🟢 P3 | Phase 3 | 📅 계획됨 | 1주 | ✅ 독립 작업 |

**범례**:
- 🔴 P0: Critical (즉시 대응)
- 🟠 P1: High (단기 계획)
- 🟡 P2: Medium (중기 계획)
- 🟢 P3: Low (장기 계획)
- ✅ 독립 작업: 백엔드 없이 구현 가능
- ⚠️ 백엔드 의존: 백엔드 API/설정 필요

---

## 🎯 마일스톤

### Milestone 1: 기반 구축 완료 (2주)
- ✅ 보안 강화 완료 (Rate Limiting, XSS 방지)
- ✅ 에러 처리 일관성 확보
- ✅ 개발 환경 개선 (로딩 상태, 타입 안정성)

### Milestone 2: 신규 기능 1차 완료 (8주)
- ✅ 워크플로우 모듈 완료
- ✅ 알림 시스템 완료
- ✅ 신고 기능 완료

### Milestone 3: 신규 기능 2차 완료 (12주)
- ✅ 관리자 페이지 완료
- ✅ 통계 기능 완료

### Milestone 4: 최적화 완료 (지속적)
- ✅ 성능 최적화
- ✅ 운영 도구 연동
- ✅ CI/CD 파이프라인 구축

---

## 📝 구현 시 참고사항

### 1. 프로젝트 구조 준수

모든 신규 기능은 기존 프로젝트 구조를 따라야 합니다:

```
src/features/{feature-name}/
├── api/              # API 호출 함수
├── model/            # 비즈니스 로직
├── store/            # Zustand 스토어 (필요시)
├── types/            # 타입 정의
└── ui/               # 프레젠테이션 컴포넌트
```

**참고**: `PROJECT_STRUCTURE_ANALYSIS.md` 전체

---

### 2. Import 경로 규칙

모든 `src` 내부 파일은 반드시 `@/` 별칭을 사용해야 합니다:

```typescript
// ✅ 올바른 사용
import { LoginView } from '@/features/auth/ui/LoginView';
import { api } from '@/shared/api/axios';

// ❌ 잘못된 사용
import { LoginView } from '../../../features/auth/ui/LoginView';
```

**참고**: `PROJECT_STRUCTURE_ANALYSIS.md` 478-528줄

---

### 3. API 호출 패턴

모든 API 호출은 `@/shared/api/axios`의 `api` 인스턴스를 사용해야 합니다:

```typescript
import { api } from '@/shared/api/axios';

export const featureApi = {
  getList: (params: ParamsType) => 
    api.get<ResponseType>('/endpoint', { params }),
  create: (data: CreateType) => 
    api.post<ResponseType>('/endpoint', data),
};
```

**참고**: `PROJECT_STRUCTURE_ANALYSIS.md` 225-256줄

---

### 4. 백엔드 의존성 관리

백엔드 API가 필요한 작업의 경우:
1. **구조 설계 단계**: 백엔드 API 설계 확인 및 타입 정의
2. **모킹 단계**: 임시로 모킹 데이터 사용하여 UI 구현
3. **연동 단계**: 백엔드 API 완료 후 실제 API로 교체

---

## 🔗 관련 문서

- **백엔드-프론트엔드 비교**: `BACKEND_FRONTEND_COMPARISON.md`
- **무료 배포 가이드**: `FREE_DEPLOYMENT_GUIDE.md`
- **워크플로우 확장 가이드**: `MODULE_EXTENSION_GUIDE.md`
- **프로젝트 구조 분석**: `PROJECT_STRUCTURE_ANALYSIS.md`

---

## 📌 주요 변경 이력

- **2025년**: 기능 개발 로드맵 초안 작성
- **2025년**: 우선순위별 기능 목록 정리
- **2025년**: 시기별 개발 계획 수립
- **2025년**: 단계별 개발 계획으로 재작성 (Phase 기반, 의존성 명시, 구체적 작업 단위)
