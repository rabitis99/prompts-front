# SharedPrompts 무료 배포 가이드 (2025)

## 📋 개요

이 문서는 **SharedPrompts 프로젝트**를 무료로 배포하는 방법을 설명합니다.  
프로젝트는 **React (Vite) 프론트엔드 + Spring Boot 백엔드** 구조이며, 각각 별도 저장소로 분리 배포됩니다.

**예상 월 비용**: **$0 ~ $10** (트래픽이 적을 경우)

---

## 🏗️ 프로젝트 구조

- **백엔드**: `backend/sharedPrompts` (Spring Boot 3.5.8, Java 17)
- **프론트엔드**: `front/sharedPrompts/my-app` (React 19, TypeScript, Vite 7)

**주요 기술 스택**:
- **백엔드**: Spring Boot, MySQL, Redis, RabbitMQ, Spring AI (OpenAI/Gemini), OAuth2 (Google/Naver/Kakao), JWT
- **프론트엔드**: React 19, TypeScript, Vite, React Router, Zustand, Axios, Tailwind CSS

---

## 🎯 배포 전략

### 옵션 1: 완전 무료 (권장) ⭐

- **프론트엔드**: Vercel (무료)
- **백엔드**: Railway (무료 티어)
- **데이터베이스**: Railway MySQL (무료 티어) 또는 PlanetScale (무료)
- **Redis**: Railway Redis (무료 티어)
- **RabbitMQ**: Railway RabbitMQ (무료 티어) 또는 생략 가능
- **총 비용**: **$0/월**

### 옵션 2: 초저비용 (더 안정적)

- **프론트엔드**: Vercel (무료)
- **백엔드**: Railway ($5/월)
- **데이터베이스**: Railway MySQL (포함)
- **Redis**: Railway Redis (포함)
- **RabbitMQ**: Railway RabbitMQ (포함)
- **총 비용**: **$5/월**

### 옵션 3: 최대 안정성 (유료)

- **프론트엔드**: Vercel Pro
- **백엔드**: Railway Pro 또는 AWS/GCP
- **데이터베이스**: 전용 MySQL
- **Redis**: 전용 Redis
- **RabbitMQ**: 전용 RabbitMQ
- **총 비용**: **$20-50/월**

---

## 🚀 프론트엔드 배포: Vercel (무료)

### 1. 프로젝트 준비

```bash
cd front/sharedPrompts/my-app

# 빌드 테스트
npm install
npm run build
```

### 2. Vercel 계정 생성 및 연결

1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "Add New Project" 클릭
4. GitHub 저장소 선택 (프론트엔드 저장소)
5. 설정:
   - **Framework Preset**: Vite (자동 감지됨)
   - **Root Directory**: `.` (루트)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. 환경 변수 설정

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:

**Production, Preview, Development 각각 설정**:

```
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_OAUTH2_REDIRECT_FRONT_URL=https://your-frontend.vercel.app
VITE_OAUTH2_FAILURE_REDIRECT_URL=https://your-frontend.vercel.app/auth/oauth-failure
```

**중요**:
- 백엔드 URL은 `/api` 경로 포함 (context-path 설정)
- OAuth2 리다이렉트 URL은 프론트엔드 배포 URL 사용
- 배포 후 백엔드 OAuth2 설정에서도 동일한 URL 사용

### 4. 배포 완료

- **자동 배포**: GitHub push 시 자동 배포
- **프리뷰 배포**: Pull Request마다 프리뷰 URL 생성
- **도메인**: `your-project.vercel.app` 자동 제공
- **HTTPS**: 자동 SSL 인증서

**무료 플랜 제한**:
- ✅ 무제한 배포
- ✅ 무제한 대역폭 (합리적 사용)
- ✅ 6000분 빌드 시간/월
- ✅ 커스텀 도메인 지원

---

## 🔧 백엔드 배포: Railway (권장) ⭐

### 1. 프로젝트 준비

```bash
cd backend/sharedPrompts

# 빌드 테스트
./gradlew clean build
```

### 2. Railway 계정 생성

1. [Railway](https://railway.app) 접속
2. GitHub 계정으로 로그인
3. 무료 플랜 선택 (Hobby 플랜)

### 3. 프로젝트 생성 및 배포

**방법 1: GitHub 연동 (권장)**

1. Railway 대시보드 → "New Project" → "Deploy from GitHub repo"
2. 백엔드 저장소 선택
3. 자동으로 빌드 및 배포 시작

**방법 2: Railway CLI**

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
cd backend/sharedPrompts
railway init

# 배포
railway up
```

### 4. 서비스 추가

Railway 대시보드에서 다음 서비스를 추가합니다:

#### 4.1 MySQL 데이터베이스

1. 프로젝트 → "New" → "Database" → "Add MySQL"
2. 자동으로 환경 변수 설정됨:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_URL` (전체 연결 문자열)

#### 4.2 Redis

1. 프로젝트 → "New" → "Database" → "Add Redis"
2. 자동으로 환경 변수 설정됨:
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_URL`

#### 4.3 RabbitMQ (선택적)

RabbitMQ는 Railway에서 직접 지원하지 않으므로 다음 옵션을 사용:

**옵션 A: RabbitMQ 생략 (권장)**
- 알림 기능만 사용하는 경우, RabbitMQ 없이도 동작 가능하도록 코드 수정
- 또는 동기식 처리로 변경

**옵션 B: CloudAMQP (무료 티어)**
1. [CloudAMQP](https://www.cloudamqp.com) 계정 생성
2. "Create Instance" → "Lemur" 플랜 선택 (무료)
3. 연결 정보 복사
4. Railway 환경 변수에 추가

**옵션 C: Railway Plugin**
- Railway에서 RabbitMQ 플러그인 사용 (유료 가능)

### 5. 환경 변수 설정

Railway 대시보드 → 프로젝트 → Variables:

#### 필수 환경 변수

```bash
# Spring Profile
SPRING_PROFILES_ACTIVE=production

# 서버 포트 (Railway가 자동 제공)
PORT=8080
SERVER_PORT=${PORT}

# 데이터베이스 (MySQL)
SPRING_DATASOURCE_URL=${MYSQL_URL}
SPRING_DATASOURCE_USERNAME=${MYSQL_USER}
SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}

# Redis
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}

# RabbitMQ (CloudAMQP 사용 시)
RABBITMQ_HOST=your-rabbitmq-host.cloudamqp.com
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=your-username
RABBITMQ_PASSWORD=your-password

# JWT
JWT_SECRET=your-strong-secret-key-min-32-chars
JWT_ACCESS_EXPIRATION=3600000  # 1시간 (밀리초)
JWT_REFRESH_EXPIRATION=604800000  # 7일 (밀리초)

# OAuth2 (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth2 (Naver)
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# OAuth2 (Kakao)
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# OAuth2 리다이렉트 URL
OAUTH2_REDIRECT_FRONT_URL=https://your-frontend.vercel.app
OAUTH2_FAILURE_REDIRECT_URL=https://your-frontend.vercel.app/auth/oauth-failure
OAUTH2_SALT=your-random-salt

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

# AI (OpenAI)
SPRING_AI_OPENAI_API_KEY=your-openai-api-key

# AI (Google Gemini)
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
GOOGLE_GEMINI_MODEL=gemini-1.5-pro
GOOGLE_GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GOOGLE_GEMINI_TIMEOUT_SECONDS=30
```

#### JPA 설정 (선택적)

```bash
JPA_SHOW_SQL=false
JPA_DDL_AUTO=validate  # 운영 환경에서는 validate 권장
HIBERNATE_DIALECT=org.hibernate.dialect.MySQL8Dialect
```

**중요 사항**:
- Railway는 `${{ServiceName.VariableName}}` 형식으로 다른 서비스 변수 참조 가능
- MySQL 서비스의 변수는 자동으로 연결됨
- 비밀번호는 강력하게 생성 (최소 32자)

### 6. application-production.yml 생성

백엔드 프로젝트에 프로덕션 설정 파일을 생성합니다:

```yaml
# src/main/resources/application-production.yml

server:
  port: ${PORT:8080}
  servlet:
    context-path: /api

spring:
  profiles:
    active: production

  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate  # 운영 환경에서는 validate 권장
    properties:
      hibernate:
        dialect: ${HIBERNATE_DIALECT:org.hibernate.dialect.MySQL8Dialect}

  data:
    redis:
      host: ${REDIS_HOST}
      port: ${REDIS_PORT:6379}

  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USERNAME:guest}
    password: ${RABBITMQ_PASSWORD:guest}

jwt:
  secret: ${JWT_SECRET}
  access:
    expiration: ${JWT_ACCESS_EXPIRATION:3600000}
  refresh:
    expiration: ${JWT_REFRESH_EXPIRATION:604800000}

oauth2:
  failure-redirect-url: ${OAUTH2_FAILURE_REDIRECT_URL}
  salt: ${OAUTH2_SALT}
  redirect:
    front-url: ${OAUTH2_REDIRECT_FRONT_URL}

cors:
  allowed-origins: ${CORS_ALLOWED_ORIGINS}

logging:
  level:
    root: INFO
    org.springframework.web: DEBUG
```

### 7. 빌드 설정

Railway는 Gradle을 자동 감지하지만, 필요시 `railway.toml` 생성:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "java -jar build/libs/sharedPrompts-0.0.1-SNAPSHOT.jar"
healthcheckPath = "/api/actuator/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
```

**중요**: JAR 파일명은 `build.gradle`의 `group`과 `version`을 확인하여 정확히 입력합니다.

### 8. 배포 완료

- **자동 배포**: GitHub push 시 자동 배포
- **도메인**: `your-project.up.railway.app` 자동 제공
- **로그**: Railway 대시보드에서 실시간 확인
- **메트릭**: CPU, 메모리 사용량 모니터링

**무료 플랜 제한**:
- ✅ $5 크레딧/월 (소규모 프로젝트 충분)
- ✅ 512MB RAM
- ✅ 1GB 디스크
- ⚠️ 슬리프 모드: 30일 비활성 시 슬리프 (깨우기 가능)

---

## 🗄️ 데이터베이스 옵션

### 옵션 1: Railway MySQL (권장) ⭐

**장점**:
- Railway와 통합 관리
- 환경 변수 자동 설정
- 무료 티어 사용 가능

**설정**:
- Railway 대시보드에서 자동 설정
- `MYSQL_URL` 환경 변수 사용

**무료 플랜 제한**:
- 256MB 저장소
- 백업: 7일

---

### 옵션 2: PlanetScale (완전 무료) ⭐

PlanetScale은 MySQL 호환 서버리스 데이터베이스입니다.

**설정 방법**:

1. [PlanetScale](https://planetscale.com) 계정 생성
2. "Create Database" 클릭
3. 설정:
   - **Database name**: sharedprompts
   - **Region**: AWS Asia Pacific (Seoul)
   - **Plan**: Free (Hobby)
4. "Connect" → "General" → 연결 문자열 복사

**환경 변수 설정**:

```bash
SPRING_DATASOURCE_URL=jdbc:mysql://[host]/[database]?sslMode=REQUIRED
SPRING_DATASOURCE_USERNAME=[username]
SPRING_DATASOURCE_PASSWORD=[password]
```

**무료 플랜 제한**:
- ✅ 5GB 저장소
- ✅ 1억 읽기/월
- ✅ 1천만 쓰기/월
- ✅ 브랜치 기능 (Git처럼)
- ⚠️ 자동 백업: 7일

---

### 옵션 3: Aiven MySQL (무료 티어)

**무료 플랜 제한**:
- 30일 무료 체험
- 이후 유료 전환 필요

---

## 📦 Redis 옵션

### 옵션 1: Railway Redis (권장) ⭐

**장점**:
- Railway와 통합
- 환경 변수 자동 설정
- 무료 티어 사용 가능

**설정**:
- Railway 대시보드에서 자동 설정
- `REDIS_HOST`, `REDIS_PORT` 환경 변수 사용

---

### 옵션 2: Upstash Redis (무료 티어)

1. [Upstash](https://upstash.com) 계정 생성
2. "Create Database" → "Redis" 선택
3. 설정:
   - **Region**: Asia Pacific (Seoul)
   - **Type**: Regional
   - **Plan**: Free

**환경 변수**:

```bash
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

**무료 플랜 제한**:
- ✅ 10,000 명령/일
- ✅ 256MB 저장소
- ⚠️ 제한된 대역폭

---

## 🐰 RabbitMQ 옵션

### 옵션 1: CloudAMQP (무료 티어) ⭐

1. [CloudAMQP](https://www.cloudamqp.com) 계정 생성
2. "Create Instance" → "Lemur" 플랜 선택 (무료)
3. 연결 정보 복사

**환경 변수**:

```bash
RABBITMQ_HOST=your-rabbitmq-host.cloudamqp.com
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=your-username
RABBITMQ_PASSWORD=your-password
```

**무료 플랜 제한**:
- ✅ 최대 1백만 메시지/월
- ✅ 20 큐
- ✅ 100 연결
- ⚠️ 단일 노드 (고가용성 없음)

---

### 옵션 2: RabbitMQ 생략 (권장)

알림 기능을 동기식으로 변경하여 RabbitMQ 없이 동작 가능하도록 수정:

```java
// RabbitMQ 사용 시
@RabbitListener(queues = "notification.queue")
public void handleNotification(NotificationMessage message) {
    // 비동기 처리
}

// RabbitMQ 없이 (동기식)
@EventListener
public void handleNotification(NotificationEvent event) {
    notificationService.sendNotification(event);
}
```

**장점**:
- 추가 서비스 불필요
- 설정 단순화
- 비용 절감

---

## 🔗 프론트엔드-백엔드 연결

### 1. CORS 설정 확인

백엔드 `application-production.yml`에서 CORS 설정:

```yaml
cors:
  allowed-origins: ${CORS_ALLOWED_ORIGINS}
```

환경 변수:
```bash
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**주의**: 여러 도메인은 쉼표로 구분:
```bash
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.your-domain.com
```

### 2. OAuth2 리다이렉트 URL 설정

#### 프론트엔드 (Vercel 환경 변수)

```bash
VITE_OAUTH2_REDIRECT_FRONT_URL=https://your-frontend.vercel.app
VITE_OAUTH2_FAILURE_REDIRECT_URL=https://your-frontend.vercel.app/auth/oauth-failure
```

#### 백엔드 (Railway 환경 변수)

```bash
OAUTH2_REDIRECT_FRONT_URL=https://your-frontend.vercel.app
OAUTH2_FAILURE_REDIRECT_URL=https://your-frontend.vercel.app/auth/oauth-failure
```

#### OAuth2 제공자 설정

각 OAuth2 제공자(Google, Naver, Kakao)의 개발자 콘솔에서 리다이렉트 URL을 등록해야 합니다:

**Google**:
- [Google Cloud Console](https://console.cloud.google.com)
- APIs & Services → Credentials → OAuth 2.0 Client IDs
- Authorized redirect URIs: `https://your-backend.railway.app/api/login/oauth2/code/google`

**Naver**:
- [Naver Developers](https://developers.naver.com)
- 애플리케이션 → API 설정 → 서비스 URL
- Callback URL: `https://your-backend.railway.app/api/login/oauth2/code/naver`

**Kakao**:
- [Kakao Developers](https://developers.kakao.com)
- 애플리케이션 → 플랫폼 → Web 플랫폼 등록
- Redirect URI: `https://your-backend.railway.app/api/login/oauth2/code/kakao`

### 3. API URL 설정

프론트엔드 `src/shared/config/env.ts`:

```typescript
export const ENV = {
  OAUTH_SUCCESS_URL: import.meta.env.VITE_OAUTH2_REDIRECT_FRONT_URL,
  OAUTH_FAILURE_URL: import.meta.env.VITE_OAUTH2_FAILURE_REDIRECT_URL,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,  // https://your-backend.railway.app/api
};
```

프론트엔드 `src/shared/api/axios.ts` 확인:

```typescript
// API_BASE_URL이 /api로 끝나는지 확인
const API_BASE_URL = ENV.API_BASE_URL || 'http://localhost:8080/api';
```

---

## 📝 배포 체크리스트

### 프론트엔드 (Vercel)

- [ ] GitHub 저장소에 코드 푸시
- [ ] Vercel 프로젝트 생성 및 연결
- [ ] 환경 변수 설정:
  - [ ] `VITE_API_BASE_URL`
  - [ ] `VITE_OAUTH2_REDIRECT_FRONT_URL`
  - [ ] `VITE_OAUTH2_FAILURE_REDIRECT_URL`
- [ ] 빌드 성공 확인
- [ ] 프로덕션 URL 접속 테스트
- [ ] OAuth2 로그인 테스트

### 백엔드 (Railway)

- [ ] GitHub 저장소에 코드 푸시
- [ ] Railway 프로젝트 생성
- [ ] `application-production.yml` 생성
- [ ] 서비스 추가:
  - [ ] MySQL 데이터베이스
  - [ ] Redis
  - [ ] RabbitMQ (선택적)
- [ ] 환경 변수 설정:
  - [ ] `SPRING_PROFILES_ACTIVE=production`
  - [ ] 데이터베이스 연결 정보
  - [ ] Redis 연결 정보
  - [ ] RabbitMQ 연결 정보 (선택적)
  - [ ] JWT 설정
  - [ ] OAuth2 클라이언트 정보 (Google, Naver, Kakao)
  - [ ] OAuth2 리다이렉트 URL
  - [ ] CORS 설정
  - [ ] AI API 키 (OpenAI, Gemini)
- [ ] OAuth2 제공자에 리다이렉트 URL 등록
- [ ] 빌드 및 배포 성공 확인
- [ ] 헬스 체크 엔드포인트 테스트 (`/api/actuator/health`)
- [ ] API 엔드포인트 테스트

### 통합 테스트

- [ ] 프론트엔드에서 백엔드 API 호출 테스트
- [ ] CORS 에러 없는지 확인
- [ ] OAuth2 로그인 (Google, Naver, Kakao) 테스트
- [ ] JWT 토큰 인증 테스트
- [ ] 프롬프트 CRUD 테스트
- [ ] 댓글, 좋아요 기능 테스트
- [ ] 알림 기능 테스트 (RabbitMQ 사용 시)

---

## 💰 비용 요약

### 완전 무료 옵션 (권장)

| 서비스 | 비용 | 제한 |
|--------|------|------|
| Vercel (프론트) | $0 | 빌드 6000분/월, 무제한 대역폭 |
| Railway (백엔드) | $0 | $5 크레딧/월 |
| Railway MySQL | $0 | 256MB 저장소 |
| Railway Redis | $0 | 포함 |
| CloudAMQP (RabbitMQ) | $0 | 1백만 메시지/월 |
| **총 비용** | **$0/월** | |

### 초저비용 옵션 (더 안정적)

| 서비스 | 비용 | 제한 |
|--------|------|------|
| Vercel (프론트) | $0 | - |
| Railway (백엔드) | $5/월 | 슬리프 없음, 512MB RAM |
| Railway MySQL | 포함 | - |
| Railway Redis | 포함 | - |
| **총 비용** | **$5/월** | |

---

## 🚨 주의사항

### 1. 슬리프 모드 (무료 플랜)

- **Railway**: 30일 비활성 시 슬리프 (깨우기 가능)

**해결책**:
- [UptimeRobot](https://uptimerobot.com) 같은 무료 모니터링 서비스로 5분마다 헬스 체크
- 또는 Railway Paid 플랜 ($5/월)으로 업그레이드

### 2. 환경 변수 보안

- 민감한 정보는 환경 변수로 관리
- GitHub에 `.env` 파일 커밋하지 않기
- Vercel/Railway 환경 변수에만 저장
- JWT_SECRET은 최소 32자 이상 랜덤 문자열 사용

### 3. 데이터베이스 마이그레이션

운영 환경에서는 `ddl-auto: validate`를 사용하여 스키마 변경을 방지하고, Flyway 또는 Liquibase를 사용한 마이그레이션을 권장합니다.

### 4. 메모리 제한

Railway 무료 플랜은 512MB RAM이므로, JVM 힙 메모리를 제한해야 합니다:

```bash
# Start Command에 추가
java -Xmx384m -Xms128m -jar build/libs/sharedPrompts-0.0.1-SNAPSHOT.jar
```

---

## 🔧 트러블슈팅

### 문제 1: CORS 에러

**증상**: 프론트엔드에서 API 호출 시 CORS 에러

**해결**:
1. 백엔드 환경 변수 `CORS_ALLOWED_ORIGINS` 확인
2. 프론트엔드 URL이 정확히 일치하는지 확인 (프로토콜 포함)
3. 여러 도메인은 쉼표로 구분

### 문제 2: OAuth2 리다이렉트 오류

**증상**: OAuth2 로그인 후 리다이렉트 실패

**해결**:
1. OAuth2 제공자 콘솔에서 리다이렉트 URL 등록 확인
2. 백엔드 URL이 정확한지 확인 (`https://your-backend.railway.app/api/login/oauth2/code/{provider}`)
3. 환경 변수 `OAUTH2_REDIRECT_FRONT_URL` 확인

### 문제 3: 데이터베이스 연결 실패

**증상**: MySQL 연결 에러

**해결**:
1. 환경 변수 `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` 확인
2. MySQL 서비스가 실행 중인지 Railway 대시보드에서 확인
3. 연결 문자열 형식 확인: `jdbc:mysql://host:port/database?sslMode=REQUIRED`

### 문제 4: Redis 연결 실패

**증상**: Redis 연결 에러

**해결**:
1. 환경 변수 `REDIS_HOST`, `REDIS_PORT` 확인
2. Redis 서비스가 실행 중인지 확인
3. 비밀번호가 필요한 경우 `REDIS_PASSWORD` 추가

### 문제 5: RabbitMQ 연결 실패

**증상**: RabbitMQ 연결 에러

**해결**:
1. RabbitMQ를 사용하지 않는 경우, 관련 설정을 비활성화하거나 선택적 의존성으로 변경
2. CloudAMQP 사용 시 연결 정보 확인
3. 방화벽/네트워크 설정 확인

---

## 📚 참고 자료

- [Vercel 문서](https://vercel.com/docs)
- [Railway 문서](https://docs.railway.app)
- [PlanetScale 문서](https://planetscale.com/docs)
- [Upstash Redis 문서](https://docs.upstash.com/redis)
- [CloudAMQP 문서](https://www.cloudamqp.com/docs)

---

**마지막 업데이트**: 2025년 1월

이 가이드가 도움이 되었다면 ⭐를 눌러주세요!
