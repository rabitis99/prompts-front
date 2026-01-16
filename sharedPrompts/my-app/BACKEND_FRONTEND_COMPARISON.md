# 백엔드-프론트엔드 API 비교 분석

## 📋 개요
백엔드 API와 프론트엔드 구현을 비교하여 실행되지 않은 부분을 찾았습니다.  
백엔드 개선 가이드(`CODE_IMPROVEMENT_GUIDE.md`)와 체크리스트(`docs/11_CHECKLIST.md`)의 내용을 반영하여 최신화되었습니다.

**최종 업데이트**: 2025년  
**백엔드 상태**: AI 호출 안정성 완료, 보안/성능 개선 진행 중, 신규 기능 개발 계획 수립

---

## ✅ 완전히 구현된 기능

### 1. 인증 (Auth)
- ✅ 회원가입 (`POST /auth/signup`)
- ✅ 로그인 (`POST /auth/login`)
- ✅ OAuth 콜백 (`GET /auth/callback`)
- ✅ 토큰 갱신 (`POST /auth/refresh`)
- ✅ 로그아웃 (`POST /auth/logout`)
- ✅ 내 정보 조회 (`GET /auth/me` 또는 `GET /users/me`)

**백엔드 구현 위치**: `AuthController.java`, `UserController.java`  
**프론트엔드 구현 위치**: `src/features/auth/api/auth.api.ts`, `src/features/auth/api/user.api.ts`

### 2. 프롬프트 (Prompt)
- ✅ 프롬프트 생성 (`POST /prompts`)
- ✅ 프롬프트 목록 조회 (`GET /prompts`)
- ✅ 프롬프트 상세 조회 (`GET /prompts/{id}`)
- ✅ 프롬프트 수정 (`PATCH /prompts/{id}`)
- ✅ 프롬프트 삭제 (`DELETE /prompts/{id}`)
- ✅ 내 프롬프트 목록 조회 (`GET /prompts/me`)

**백엔드 구현 위치**: `PromptController.java`  
**프론트엔드 구현 위치**: `src/features/prompt/api/prompt.api.ts`

**참고**: 백엔드에서 `PromptFacade`를 통해 리액티브 → 동기 변환 처리 (Controller Mono 노출 제거 완료)

### 3. 댓글 (Comment)
- ✅ 댓글 생성 (`POST /prompts/{promptId}/comments`)
- ✅ 댓글 목록 조회 (`GET /prompts/{promptId}/comments`)
- ✅ 댓글 수정 (`PATCH /prompts/{promptId}/comments/{commentId}`)
- ✅ 댓글 삭제 (`DELETE /prompts/{promptId}/comments/{commentId}`)

**백엔드 구현 위치**: `CommentController.java`  
**프론트엔드 구현 위치**: `src/features/comment/api/comment.api.ts`

### 4. 좋아요 (Like)
- ✅ 프롬프트 좋아요 (`POST /prompts/{promptId}/likes`)
- ✅ 프롬프트 좋아요 취소 (`DELETE /prompts/{promptId}/likes`)
- ✅ 댓글 좋아요 (`POST /comments/{commentId}/likes`)
- ✅ 댓글 좋아요 취소 (`DELETE /comments/{commentId}/likes`)

**백엔드 구현 위치**: `LikeController.java`  
**프론트엔드 구현 위치**: `src/features/like/api/like.api.ts`

### 5. 사용자 설정 (User Settings)
- ✅ 내 정보 수정 (`PATCH /users/me`)
- ✅ 비밀번호 변경 (`PATCH /users/me/password`)
- ✅ 회원 탈퇴 (`DELETE /users/{id}`)

**백엔드 구현 위치**: `UserController.java`  
**프론트엔드 구현 위치**: `src/features/auth/api/user.api.ts`

---

## 📅 백엔드 계획된 기능 (체크리스트 기준)

### 1. 알림 (Notifications) - 계획됨
**현재 상태**: 
- ❌ 백엔드에 알림 API가 아직 없음
- ⚠️ 프론트엔드에 더미 데이터로 UI만 존재 (`src/pages/NotificationsPage.tsx`)

**백엔드 계획 사항** (체크리스트 5.3):
- [ ] 알림 이벤트 발행 (Spring Events)
- [ ] 알림 저장소 (DB)
- [ ] 댓글 알림
- [ ] 좋아요 알림
- [ ] 실시간 알림 (WebSocket 또는 SSE)
- [ ] 알림 읽음 처리

**예상 API 엔드포인트**:
- `GET /notifications` - 알림 목록 조회
- `GET /notifications/unread-count` - 읽지 않은 알림 개수
- `PATCH /notifications/{id}/read` - 알림 읽음 처리
- `PATCH /notifications/read-all` - 모든 알림 읽음 처리
- `DELETE /notifications/{id}` - 알림 삭제

**프론트엔드 준비사항**:
- 알림 API 모듈 생성 (`src/features/notifications/api/notification.api.ts`)
- 실시간 알림 연동 (WebSocket 또는 SSE 클라이언트)
- 알림 상태 관리 (Zustand 스토어)

### 2. 관리자 페이지 (Admin) - 계획됨
**백엔드 계획 사항** (체크리스트 5.1):
- [ ] 관리자 권한 인증/인가
- [ ] 사용자 관리 (조회, 차단, 권한 변경)
- [ ] 프롬프트 관리 (조회, 삭제, 공개/비공개 전환)
- [ ] 신고 처리 (신고된 콘텐츠 검토, 조치)
- [ ] 통계 대시보드 연동

**예상 API 엔드포인트**:
- `GET /admin/users` - 사용자 목록 조회
- `PATCH /admin/users/{id}/block` - 사용자 차단
- `PATCH /admin/users/{id}/role` - 사용자 권한 변경
- `GET /admin/prompts` - 프롬프트 관리 목록
- `PATCH /admin/prompts/{id}/visibility` - 프롬프트 공개/비공개 전환
- `GET /admin/reports` - 신고 목록 조회
- `PATCH /admin/reports/{id}/resolve` - 신고 처리

**프론트엔드 준비사항**:
- 관리자 페이지 라우트 및 레이아웃
- 관리자 권한 체크 미들웨어
- 관리자 전용 컴포넌트

### 3. 통계 기능 (Statistics) - 계획됨
**백엔드 계획 사항** (체크리스트 5.2):
- [ ] 사용자 통계 (가입 수, 활성 사용자, 신규 가입자 추이)
- [ ] 프롬프트 통계 (생성 수, 조회 수, 좋아요 수, 인기 태그)
- [ ] AI 호출 통계 (호출 횟수, 성공률, 평균 응답 시간)
- [ ] 통계 데이터 집계 (스케줄러 또는 이벤트 기반)
- [ ] 통계 데이터 캐싱 (Redis)
- [ ] 통계 API 엔드포인트

**예상 API 엔드포인트**:
- `GET /statistics/users` - 사용자 통계
- `GET /statistics/prompts` - 프롬프트 통계
- `GET /statistics/ai-calls` - AI 호출 통계
- `GET /statistics/dashboard` - 대시보드 통합 통계

**프론트엔드 준비사항**:
- 통계 대시보드 UI 컴포넌트
- 차트 라이브러리 연동 (Chart.js, Recharts 등)
- 통계 데이터 시각화

### 4. 신고 기능 (Reports) - 계획됨
**백엔드 계획 사항** (체크리스트 5.4):
- [ ] 신고 엔티티 및 저장소
- [ ] 콘텐츠 신고 (프롬프트, 댓글)
- [ ] 신고 사유 선택
- [ ] 신고 API 엔드포인트
- [ ] 신고 처리 워크플로우
- [ ] 관리자 신고 처리 UI 연동

**예상 API 엔드포인트**:
- `POST /prompts/{id}/report` - 프롬프트 신고
- `POST /comments/{id}/report` - 댓글 신고
- `GET /reports/my` - 내가 신고한 내역 조회
- `GET /admin/reports` - 신고 목록 조회 (관리자)
- `PATCH /admin/reports/{id}/resolve` - 신고 처리 (관리자)

**프론트엔드 준비사항**:
- 신고 모달 컴포넌트
- 신고 사유 선택 UI
- 신고 내역 조회 페이지

---

## 🔧 백엔드 개선 진행 상황 (체크리스트 기준)

### ✅ 완료된 개선사항

#### 1. AI 호출 안정성 (100% 완료)
- **CircuitBreaker**: Resilience4j 기반 서킷브레이커 구현 완료
- **Fallback**: 모든 에러 상황에 대한 Fallback 전략 구현 완료
- **Metrics**: Micrometer 기반 메트릭 수집 구현 완료 (provider, model, result, error.type 태깅)
- **Timeout & Retry**: WebFlux 기반 타임아웃 및 재시도 로직 구현 완료

**영향**: 프롬프트 생성 시 AI API 호출의 안정성 향상 (프론트엔드에서 별도 처리 불필요)

#### 2. 아키텍처 개선 (100% 완료)
- **서비스 인터페이스 일관성**: 모든 주요 Service에 인터페이스 분리 완료
- **Controller Mono 노출 제거**: `PromptFacade` 도입으로 MVC 스타일 API와 일관성 확보

**영향**: API 응답 형식이 일관되고 예측 가능 (프론트엔드에서 리액티브 타입 처리 불필요)

### 🟡 진행 중인 개선사항

#### 1. 보안 강화 🔴 **우선순위 1** (진행 중)

**1.1 Rate Limiting**:
- [ ] Resilience4j 또는 Bucket4j 도입
- [ ] 로그인 Rate Limit (5회/분)
- [ ] 회원가입 Rate Limit (3회/분)
- [ ] 프롬프트 생성 Rate Limit (10회/분)
- [ ] Redis 기반 분산 Rate Limiting

**1.2 입력값 Sanitization**:
- [ ] OWASP Java HTML Sanitizer 도입
- [ ] 프롬프트 내용 HTML 태그 필터링
- [ ] 댓글 내용 HTML 태그 필터링
- [ ] 사용자 입력값 검증 강화

**1.3 보안 헤더 추가**:
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security
- [ ] Content-Security-Policy 설정

**1.4 인증/인가 로깅**:
- [ ] 실패한 로그인 시도 로깅
- [ ] 권한 부족 접근 시도 로깅
- [ ] 비정상적인 패턴 탐지

**1.5 토큰 보안 강화**:
- [ ] Refresh Token Rotation 구현
- [ ] HttpOnly Cookie 고려
- [ ] 토큰 탈취 감지 메커니즘

**프론트엔드 영향**:
- Rate Limiting: API 호출 실패 시 429 에러 처리 필요
- 입력값 Sanitization: 백엔드에서 자동 처리되지만 프론트엔드에서도 기본 검증 권장
- 보안 헤더: 브라우저 보안 정책에 영향 (CSP 등)

#### 2. 성능 개선 🟠 **우선순위 2** (진행 중)

**2.1 캐싱 전략 확대**:
- [ ] @Cacheable 어노테이션 도입
- [ ] 프롬프트 목록 캐싱
- [ ] 사용자 정보 캐싱
- [ ] TTL 적절히 설정 (인기 프롬프트 5분, 일반 1분, 사용자 10분)

**2.2 Connection Pool 최적화**:
- [ ] HikariCP 설정 튜닝
- [ ] maximum-pool-size 설정
- [ ] minimum-idle 설정
- [ ] connection-timeout 설정
- [ ] DB 커넥션 모니터링

**2.3 DB 인덱스 최적화**:
- [ ] 쿼리 성능 분석 (EXPLAIN)
- [ ] 복합 인덱스 추가
- [ ] 불필요한 인덱스 제거

**2.4 비동기 처리 범위 확대**:
- [ ] 이메일 발송 비동기화
- [ ] 알림 전송 비동기화
- [ ] @Async 또는 CompletableFuture 활용
- [ ] 스레드 풀 크기 설정

**2.5 쿼리 결과 최적화**:
- [ ] DTO Projection 활용
- [ ] @EntityGraph 활용 범위 확대

**프론트엔드 영향**:
- 캐싱: API 응답 속도 향상 (별도 처리 불필요)
- 성능 개선: 전반적인 API 응답 시간 단축

#### 3. 문서화 🟡 **우선순위 3** (진행 중)
- [ ] README.md 보완
- [ ] API 문서화 (Swagger/Spring REST Docs)
- [ ] JavaDoc 추가
- [ ] ADR (Architecture Decision Records)

**프론트엔드 영향**: API 문서를 통한 개발 효율성 향상

#### 4. 테스트 🟢 **우선순위 4** (진행 중)
- [ ] 단위 테스트 작성 (Service 계층 80% 이상 목표)
- [ ] 통합 테스트 작성 (Repository, Controller)
- [ ] 테스트 커버리지 측정 (JaCoCo)
- [ ] 테스트 데이터 관리

**프론트엔드 영향**: 백엔드 API 안정성 향상으로 프론트엔드 개발 신뢰도 증가

---

## 📊 구현 상태 요약

| 기능 | 백엔드 API | 프론트엔드 API | 프론트엔드 UI | 상태 |
|------|-----------|--------------|--------------|------|
| 회원가입/로그인 | ✅ | ✅ | ✅ | ✅ 완료 |
| 프롬프트 CRUD | ✅ | ✅ | ✅ | ✅ 완료 |
| 댓글 CRUD | ✅ | ✅ | ✅ | ✅ 완료 |
| 좋아요 | ✅ | ✅ | ✅ | ✅ 완료 |
| 사용자 설정 | ✅ | ✅ | ✅ | ✅ 완료 |
| 알림 | 📅 (계획됨) | ❌ | ⚠️ (더미 데이터) | 📅 계획됨 |
| 관리자 페이지 | 📅 (계획됨) | ❌ | ❌ | 📅 계획됨 |
| 통계 기능 | 📅 (계획됨) | ❌ | ❌ | 📅 계획됨 |
| 신고 기능 | 📅 (계획됨) | ❌ | ❌ | 📅 계획됨 |
| AI 호출 안정성 | ✅ (완료) | N/A | N/A | ✅ 완료 |
| 보안 강화 | 🟡 (진행 중) | N/A | N/A | 🟡 진행 중 |
| 성능 개선 | 🟡 (진행 중) | N/A | N/A | 🟡 진행 중 |

**범례**:
- ✅ 완료
- 🟡 진행 중
- 📅 계획됨
- ❌ 미구현

---

## 🔧 우선순위별 수정 권장사항

### 🔴 높은 우선순위 (즉시 대응 필요)

#### 1. Rate Limiting 대응
**백엔드 상태**: 계획됨 (체크리스트 1.1)

**프론트엔드 작업**:
- 429 (Too Many Requests) 에러 처리 추가
- 사용자에게 재시도 안내 메시지 표시
- Rate limit 초과 시 재시도 로직 구현

**구현 예시**:
```typescript
// src/shared/api/axios.ts의 response interceptor에 추가
if (error.response?.status === 429) {
  const retryAfter = error.response.headers['retry-after'];
  // Rate limit 초과 처리 및 재시도 안내
  showErrorToast(`요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.`);
}
```

#### 2. 입력값 검증 강화
**백엔드 상태**: 계획됨 (체크리스트 1.2)

**프론트엔드 작업**:
- 기본적인 HTML 태그 필터링 (백엔드에서도 처리되지만 이중 방어)
- XSS 공격 방지를 위한 입력값 검증
- 프롬프트/댓글 작성 시 HTML 태그 제거

**구현 예시**:
```typescript
// src/shared/utils/sanitize.ts
export function sanitizeInput(input: string): string {
  // HTML 태그 제거
  return input.replace(/<[^>]*>/g, '');
}
```

### 🟠 중간 우선순위

#### 3. 에러 처리 개선
- API 호출 실패 시 사용자 피드백 강화
- 네트워크 오류 처리
- 백엔드 에러 응답 형식(`CustomResponse`)에 맞춘 에러 처리
- 에러 코드별 사용자 친화적 메시지 표시

#### 4. 로딩 상태 관리
- 일관된 로딩 상태 관리 패턴 적용
- API 호출 중 사용자 피드백 개선
- 스켈레톤 UI 또는 로딩 스피너 표준화

### 🟡 낮은 우선순위 (백엔드 구현 대기)

#### 5. 알림 시스템 준비
**백엔드 상태**: 계획됨 (체크리스트 5.3)

**프론트엔드 준비 작업**:
- 알림 API 모듈 구조 설계 (`src/features/notifications/`)
- 실시간 알림 연동 준비 (WebSocket 또는 SSE 클라이언트)
- 알림 상태 관리 (Zustand 스토어)
- 현재 더미 데이터를 실제 API로 교체할 수 있도록 구조화

#### 6. 관리자 페이지 준비
**백엔드 상태**: 계획됨 (체크리스트 5.1)

**프론트엔드 준비 작업**:
- 관리자 권한 체크 미들웨어 설계
- 관리자 페이지 라우트 구조 설계
- 관리자 전용 컴포넌트 구조 설계

#### 7. 통계 대시보드 준비
**백엔드 상태**: 계획됨 (체크리스트 5.2)

**프론트엔드 준비 작업**:
- 차트 라이브러리 선정 및 연동
- 통계 데이터 시각화 컴포넌트 설계
- 대시보드 레이아웃 설계

#### 8. 신고 기능 준비
**백엔드 상태**: 계획됨 (체크리스트 5.4)

**프론트엔드 준비 작업**:
- 신고 모달 컴포넌트 설계
- 신고 사유 선택 UI 설계
- 신고 내역 조회 페이지 설계

---

## 📝 추가 확인 사항

### 1. 에러 처리
- API 호출 실패 시 사용자 피드백
- 네트워크 오류 처리
- 백엔드 에러 응답 형식 (`CustomResponse`) 일관성 확인
- 에러 코드별 처리 로직

### 2. 타입 안정성
- 백엔드 DTO와 프론트엔드 타입 정의 일치 여부 확인
- API 응답 타입 검증
- 신규 API 추가 시 타입 정의 동기화

### 3. 인증/인가
- 토큰 갱신 로직 (`src/shared/api/axios.ts`의 response interceptor)
- 401 에러 시 자동 로그아웃 처리
- 관리자 권한 체크 로직 (신규 기능 대비)

### 4. 성능 최적화
- 백엔드 캐싱 전략에 따른 프론트엔드 캐싱 전략 검토
- 불필요한 API 호출 최소화
- React Query 또는 SWR 도입 검토 (캐싱 및 동기화)

### 5. 실시간 기능 준비
- WebSocket 또는 SSE 클라이언트 라이브러리 선정
- 실시간 알림 연동 구조 설계
- 연결 관리 및 재연결 로직

---

## 🎯 다음 단계

### 즉시 대응 필요 (우선순위 1)
1. ✅ **Rate Limiting 대응** (429 에러 처리)
2. ✅ **입력값 검증 강화** (XSS 방지)

### 단기 계획 (1-2개월)
3. 에러 처리 개선 및 일관성 확보
4. 로딩 상태 관리 패턴 통일
5. 알림 시스템 백엔드 구현 대기 및 프론트엔드 구조 준비

### 중기 계획 (3-6개월)
6. 관리자 페이지 백엔드 구현 대기 및 프론트엔드 구조 준비
7. 통계 기능 백엔드 구현 대기 및 대시보드 UI 준비
8. 신고 기능 백엔드 구현 대기 및 프론트엔드 구조 준비
9. 실시간 알림 연동 (WebSocket 또는 SSE)

### 장기 계획 (6개월 이상)
10. 백엔드 개선사항 (보안, 성능) 완료 후 프론트엔드 최적화
11. 운영 도구 연동 (로깅, 모니터링)
12. CI/CD 파이프라인 구축

---

## 📚 참고 문서

- 백엔드 개선 가이드: `CODE_IMPROVEMENT_GUIDE.md`
- 백엔드 체크리스트: `docs/11_CHECKLIST.md`
- 프로젝트 구조 분석: `PROJECT_STRUCTURE_ANALYSIS.md`
- 백엔드 보안 개선: `docs/04_SECURITY.md`
- 백엔드 성능 개선: `docs/05_PERFORMANCE.md`
- AI 호출 안정성: `docs/09_AI_STABILITY.md`

---

## 📌 주요 변경 이력

- **2025년**: 체크리스트 반영, 신규 기능 개발 계획 추가
- **2025년**: 백엔드 개선 가이드 반영, 보안/성능 개선 진행 상황 추가
