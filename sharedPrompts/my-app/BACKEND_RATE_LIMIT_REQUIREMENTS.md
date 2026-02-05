# 백엔드 RateLimit 요구사항

프론트엔드에서 RateLimit을 효율적으로 관리하기 위해 백엔드에 요구하는 사항들입니다.

## 목차

1. [HTTP 응답 헤더 (필수)](#1-http-응답-헤더-필수)
2. [엔드포인트별 RateLimit 정보](#2-엔드포인트별-ratelimit-정보-선택-권장)
3. [RateLimit 상태 조회 API](#3-ratelimit-상태-조회-api-선택-권장)
4. [에러 응답 형식 표준화](#4-에러-응답-형식-표준화)
5. [RateLimit 정책 문서화](#5-ratelimit-정책-문서화)
6. [RateLimit 윈도우 타입](#6-ratelimit-윈도우-타입)
7. [우선순위 요청 지원](#7-우선순위-요청-지원-선택)
8. [RateLimit 경고](#8-ratelimit-경고-선택-권장)

---

## 1. HTTP 응답 헤더 (필수)

**모든 API 응답에 다음 헤더를 포함해주세요.**

### 1.1 표준 RateLimit 헤더

모든 성공/실패 응답에 다음 헤더를 포함해야 합니다:

| 헤더 이름 | 설명 | 예시 값 | 필수 여부 |
|---------|------|---------|----------|
| `X-RateLimit-Limit` | 시간 윈도우당 최대 요청 수 | `100` | ✅ 필수 |
| `X-RateLimit-Remaining` | 남은 요청 수 | `95` | ✅ 필수 |
| `X-RateLimit-Reset` | 윈도우 리셋 시간 (Unix timestamp, 초 단위) | `1633024800` | ✅ 필수 |

**구현 가이드:**
- `X-RateLimit-Limit`: 현재 적용된 RateLimit 정책의 최대 요청 수
- `X-RateLimit-Remaining`: 현재 윈도우에서 남은 요청 수 (0 이상)
- `X-RateLimit-Reset`: 다음 윈도우가 시작되는 시점의 Unix timestamp (초 단위)

### 1.2 Retry-After 헤더 (429 에러 시)

429 Too Many Requests 에러 발생 시 반드시 포함해야 합니다:

| 헤더 이름 | 설명 | 형식 | 예시 |
|---------|------|------|------|
| `Retry-After` | 재시도 가능한 시간 | 숫자 (초 단위) **권장** | `60` |
| | | HTTP-date 형식 | `Wed, 21 Oct 2024 07:28:00 GMT` |

**요구사항:**
- ✅ 429 에러 발생 시 반드시 포함
- ✅ 숫자 형식(초 단위) 권장 (파싱이 더 간단함)
- ✅ 정확한 재시도 시간 제공 (남은 윈도우 시간 또는 다음 윈도우 시작까지의 시간)

### 1.3 예시 응답

#### 성공 응답 (200 OK)

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1633024800
Content-Type: application/json

{
  "data": { ... }
}
```

#### RateLimit 초과 응답 (429 Too Many Requests)

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1633024800
Retry-After: 60
Content-Type: application/json

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "요청이 너무 많습니다. 60초 후에 다시 시도해주세요."
  }
}
```

**주의사항:**
- 429 에러 발생 시에도 `X-RateLimit-*` 헤더는 반드시 포함해야 합니다
- `Retry-After` 값은 `X-RateLimit-Reset - 현재시간`으로 계산하는 것을 권장합니다

---

## 2. 엔드포인트별 RateLimit 정보 (선택, 권장)

엔드포인트마다 다른 RateLimit 정책이 있는 경우, 각 응답에 해당 엔드포인트의 정책 정보를 포함해주세요:

| 헤더 이름 | 설명 | 예시 |
|---------|------|------|
| `X-RateLimit-Policy` | 엔드포인트 패턴 | `/prompts` |
| `X-RateLimit-Limit` | 이 엔드포인트의 제한 | `200` |
| `X-RateLimit-Window` | 윈도우 시간 (초) | `60` |

**사용 예시:**
```
X-RateLimit-Policy: /prompts
X-RateLimit-Limit: 200
X-RateLimit-Window: 60
```

**구현 가이드:**
- 전역 RateLimit과 엔드포인트별 RateLimit이 다를 때만 포함
- 프론트엔드에서 어떤 정책이 적용되었는지 명확히 알 수 있음

---

## 3. RateLimit 상태 조회 API (선택, 권장)

현재 사용자의 RateLimit 상태를 조회할 수 있는 API를 제공해주세요:

**엔드포인트:**
```
GET /api/rate-limit/status
```

**인증:** 필요 (사용자별 RateLimit 조회)

**응답 예시:**
```json
{
  "data": {
    "global": {
      "limit": 100,
      "remaining": 95,
      "reset": 1633024800,
      "window": 60
    },
    "endpoints": {
      "/prompts": {
        "limit": 200,
        "remaining": 180,
        "reset": 1633024800,
        "window": 60
      },
      "/auth/login": {
        "limit": 5,
        "remaining": 3,
        "reset": 1633024800,
        "window": 60
      }
    }
  }
}
```

**활용:**
- 프론트엔드에서 앱 시작 시 RateLimit 상태를 미리 조회
- 사용자에게 현재 RateLimit 상태를 표시
- RateLimit에 가까워질 때 사전 경고

---

## 4. 에러 응답 형식 표준화

429 에러 응답 형식을 표준화해주세요. 다음 형식을 따르면 프론트엔드에서 일관되게 처리할 수 있습니다:

**표준 에러 응답 형식:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "요청이 너무 많습니다. 60초 후에 다시 시도해주세요.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset": 1633024800,
      "retryAfter": 60
    }
  }
}
```

**필드 설명:**
- `code`: 에러 코드 (고정값: `RATE_LIMIT_EXCEEDED`)
- `message`: 사용자에게 표시할 메시지 (재시도 시간 포함 권장)
- `details.limit`: 적용된 RateLimit 제한
- `details.remaining`: 남은 요청 수 (보통 0)
- `details.reset`: 윈도우 리셋 시간 (Unix timestamp)
- `details.retryAfter`: 재시도 가능한 시간 (초 단위, `Retry-After` 헤더와 동일)

---

## 5. RateLimit 정책 문서화

다음 정보를 API 문서에 포함해주세요. 프론트엔드 개발자가 RateLimit 정책을 이해하고 적절히 대응할 수 있도록 도와줍니다:

**문서화해야 할 정보:**

| 항목 | 설명 | 예시 |
|------|------|------|
| 전역 RateLimit | 모든 API에 적용되는 기본 제한 | `100 requests / 60 seconds` |
| 엔드포인트별 RateLimit | 특정 엔드포인트에만 적용되는 제한 | `/prompts`: `200 requests / 60 seconds`<br>`/auth/login`: `5 requests / 60 seconds`<br>`/auth/refresh`: `10 requests / 60 seconds` |
| 윈도우 타입 | RateLimit 계산 방식 | `sliding window` 또는 `fixed window` |
| RateLimit 키 | 제한을 적용하는 기준 | 사용자별, IP별, 엔드포인트별 등 |

**예시 문서 구조:**
```markdown
## RateLimit 정책

### 전역 제한
- **제한**: 100 requests / 60 seconds
- **적용 대상**: 모든 API 엔드포인트
- **윈도우 타입**: Fixed Window

### 엔드포인트별 제한
- `/prompts`: 200 requests / 60 seconds
- `/auth/login`: 5 requests / 60 seconds
- `/auth/refresh`: 10 requests / 60 seconds
```

---

## 6. RateLimit 윈도우 타입

RateLimit 윈도우 타입을 명확히 해주세요. 프론트엔드에서 `X-RateLimit-Reset` 헤더를 올바르게 해석할 수 있습니다:

### 6.1 Fixed Window (고정 윈도우)

- **설명**: 정해진 시간(예: 매 분)마다 리셋
- **예시**: 매 정시(00분)마다 리셋
- **특징**: 윈도우 시작 시점이 고정되어 있음

### 6.2 Sliding Window (슬라이딩 윈도우)

- **설명**: 마지막 요청부터 시간 윈도우 계산
- **예시**: 마지막 요청 시점부터 60초 동안
- **특징**: 윈도우가 요청에 따라 이동

**구현 가이드:**
- `X-RateLimit-Reset` 헤더에 다음 윈도우 시작 시간을 정확히 표시
- Fixed Window: 다음 윈도우 시작 시간
- Sliding Window: 현재 윈도우 종료 시간

---

## 7. 우선순위 요청 지원 (선택)

중요한 요청(예: 사용자 액션)에 대해 우선순위를 부여할 수 있는 헤더를 지원해주세요:

**요청 헤더:**
```
X-Request-Priority: high|normal|low
```

**동작:**
- `high`: RateLimit에서 예외 처리하거나 더 높은 제한 적용
- `normal`: 기본 RateLimit 정책 적용 (기본값)
- `low`: 더 낮은 제한 적용 (선택)

**사용 예시:**
- 사용자 클릭 이벤트: `X-Request-Priority: high`
- 배경 데이터 동기화: `X-Request-Priority: low`

---

## 8. RateLimit 경고 (선택, 권장)

RateLimit에 가까워질 때 경고 헤더를 포함해주세요. 프론트엔드에서 사용자에게 사전 알림을 표시할 수 있습니다:

**경고 헤더:**
```
X-RateLimit-Warning: 80%        # 80% 사용 시 경고
```

**구현 가이드:**
- `X-RateLimit-Remaining`이 특정 임계값 이하일 때 포함
- 예: `remaining / limit <= 0.2` (20% 이하)일 때 경고
- 경고 메시지 형식: `"80%"` 또는 `"WARNING: 80% of rate limit used"`

---

## 구현 우선순위

백엔드 구현 시 다음 우선순위를 권장합니다:

### 필수 (P0) - 즉시 구현 필요

프론트엔드가 RateLimit을 제대로 추적하기 위해 반드시 필요합니다:

1. ✅ `X-RateLimit-Limit` 헤더 - 모든 응답에 포함
2. ✅ `X-RateLimit-Remaining` 헤더 - 모든 응답에 포함
3. ✅ `X-RateLimit-Reset` 헤더 - 모든 응답에 포함
4. ✅ `Retry-After` 헤더 - 429 에러 시 반드시 포함

**예상 작업 시간:** 1-2일

### 권장 (P1) - 빠른 시일 내 구현

사용자 경험 향상을 위해 구현을 권장합니다:

5. ✅ 에러 응답 형식 표준화 - 429 에러 응답 구조 통일
6. ✅ RateLimit 정책 문서화 - API 문서에 정책 명시

**예상 작업 시간:** 0.5-1일

### 선택 (P2) - 여유 있을 때 구현

향후 개선을 위한 기능들:

7. ✅ RateLimit 상태 조회 API - `/api/rate-limit/status`
8. ✅ 엔드포인트별 RateLimit 정보 - `X-RateLimit-Policy` 헤더
9. ✅ RateLimit 경고 헤더 - `X-RateLimit-Warning`
10. ✅ 우선순위 요청 지원 - `X-Request-Priority` 헤더

**예상 작업 시간:** 2-3일

---

## 프론트엔드 활용 계획

백엔드에서 위 헤더를 제공하면, 프론트엔드는 다음과 같이 활용할 수 있습니다:

### 주요 기능

1. **정확한 RateLimit 추적**
   - 백엔드의 실제 제한과 남은 요청 수를 정확히 파악
   - 클라이언트 측 RateLimit 추적기와 백엔드 상태 동기화

2. **자동 재시도**
   - `Retry-After` 헤더를 사용하여 정확한 시간에 재시도
   - 불필요한 즉시 재시도 방지로 서버 부하 감소

3. **사용자 알림**
   - `X-RateLimit-Remaining`이 낮을 때 사용자에게 경고
   - RateLimit 상태를 UI에 표시

4. **동적 조정**
   - 백엔드의 실제 제한에 맞춰 프론트엔드 RateLimit 추적기 자동 조정
   - 엔드포인트별 제한 자동 반영

5. **에러 방지**
   - RateLimit 초과 전에 요청을 지연시켜 429 에러 방지
   - 사용자 경험 개선

### 현재 구현 상태

프론트엔드 코드(`src/shared/api/axios.ts`, `src/shared/utils/rateLimit.ts`)는 이미 다음 기능을 지원합니다:

- ✅ `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` 헤더 파싱
- ✅ `Retry-After` 헤더를 사용한 자동 재시도
- ✅ 백엔드 RateLimit 정보와 프론트엔드 추적기 동기화
- ✅ 429 에러 발생 시 동적 버퍼 조정

**💡 백엔드에서 헤더만 제공하면 즉시 활용 가능합니다!**

---

## 참고 자료

### 표준 문서
- [RFC 6585 - Additional HTTP Status Codes](https://tools.ietf.org/html/rfc6585#section-4) - 429 Too Many Requests 상태 코드 정의
- [RFC 7231 - HTTP/1.1 Semantics and Content](https://tools.ietf.org/html/rfc7231) - Retry-After 헤더 정의

### 실제 구현 사례
- [GitHub API Rate Limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting) - GitHub의 RateLimit 헤더 구현
- [Twitter API Rate Limiting](https://developer.twitter.com/en/docs/rate-limits) - Twitter의 RateLimit 정책

### 구현 가이드
- Spring Boot: `@RateLimiter` 어노테이션 또는 `Bucket4j` 라이브러리 사용
- Redis: `INCR` + `EXPIRE` 조합 또는 `Lua` 스크립트 사용

---

## 문의 및 피드백

문서에 대한 질문이나 개선 사항이 있으시면 프론트엔드 팀에 문의해주세요.

