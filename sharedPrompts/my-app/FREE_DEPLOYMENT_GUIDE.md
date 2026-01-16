# 무료 배포 가이드

## 📋 개요

이 문서는 **비용이 거의 0원**인 무료 배포 옵션들을 설명합니다.  
프로젝트는 **React 프론트엔드 + Spring Boot 백엔드** 구조이므로, 각각 분리 배포가 필요합니다.

**예상 월 비용**: **$0 ~ $5** (트래픽이 매우 적을 경우)

---

## 🎯 배포 전략

### 옵션 1: 완전 무료 (권장)

- **프론트엔드**: Vercel (무료)
- **백엔드**: Railway (무료 티어) 또는 Render (무료 티어)
- **데이터베이스**: Railway/Render 내장 PostgreSQL 또는 Supabase (무료)
- **총 비용**: **$0/월**

### 옵션 2: 초저비용 (더 안정적)

- **프론트엔드**: Vercel (무료)
- **백엔드**: Railway ($5/월) 또는 Render ($7/월)
- **데이터베이스**: Railway/Render 내장 PostgreSQL
- **총 비용**: **$5-7/월**

---

## 🚀 프론트엔드 배포: Vercel (무료)

### 1. Vercel 계정 생성

1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. 무료 플랜 선택

### 2. 프로젝트 연결

**방법 1: GitHub 연동 (권장)**

```bash
# 1. GitHub에 프로젝트 푸시
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/my-app.git
git push -u origin main

# 2. Vercel 대시보드에서
# - "Add New Project" 클릭
# - GitHub 저장소 선택
# - 자동으로 설정 감지됨
```

**방법 2: Vercel CLI**

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 3. 환경 변수 설정

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:

```
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

### 4. 빌드 설정

Vercel은 자동으로 감지하지만, 필요시 `vercel.json` 추가:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 5. 배포 완료

- **자동 배포**: GitHub에 push할 때마다 자동 배포
- **프리뷰 배포**: Pull Request마다 프리뷰 URL 생성
- **도메인**: `your-project.vercel.app` 자동 제공

**무료 플랜 제한**:
- ✅ 무제한 배포
- ✅ 무제한 대역폭 (합리적 사용)
- ✅ SSL 인증서 자동
- ⚠️ 빌드 시간: 45분/월 (충분함)

---

## 🔧 백엔드 배포 옵션 비교

### 옵션 A: Railway (권장)

**무료 티어**: $5 크레딧/월 (소규모 프로젝트에 충분)

#### 1. Railway 계정 생성

1. [Railway](https://railway.app) 접속
2. GitHub 계정으로 로그인
3. 무료 플랜 선택

#### 2. 프로젝트 배포

**방법 1: GitHub 연동**

```bash
# 1. 백엔드 프로젝트를 별도 저장소로 푸시
# (또는 monorepo의 경우 루트에서)

# 2. Railway 대시보드에서
# - "New Project" 클릭
# - "Deploy from GitHub repo" 선택
# - 저장소 선택
# - Root Directory: backend/ (백엔드 폴더 경로)
```

**방법 2: Railway CLI**

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
railway init

# 배포
railway up
```

#### 3. 데이터베이스 추가

Railway 대시보드에서:
1. "New" → "Database" → "Add PostgreSQL"
2. 자동으로 환경 변수 설정됨:
   - `DATABASE_URL`
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

#### 4. 환경 변수 설정

Railway 대시보드 → 프로젝트 → Variables:

```
SPRING_PROFILES_ACTIVE=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
```

#### 5. 포트 설정

Railway는 자동으로 포트를 할당하므로, Spring Boot 설정:

```yaml
# application-production.yml
server:
  port: ${PORT:8080}  # Railway가 PORT 환경 변수 제공
```

#### 6. 배포 완료

- **자동 배포**: GitHub push 시 자동 배포
- **도메인**: `your-project.railway.app` 자동 제공
- **로그**: Railway 대시보드에서 실시간 확인

**무료 플랜 제한**:
- ✅ $5 크레딧/월 (소규모 프로젝트 충분)
- ✅ 512MB RAM
- ✅ 1GB 디스크
- ⚠️ 슬리프 모드: 30일 비활성 시 슬리프 (깨우기 가능)

---

### 옵션 B: Render

**무료 티어**: 제한적이지만 사용 가능

#### 1. Render 계정 생성

1. [Render](https://render.com) 접속
2. GitHub 계정으로 로그인
3. 무료 플랜 선택

#### 2. Web Service 생성

Render 대시보드에서:
1. "New" → "Web Service"
2. GitHub 저장소 연결
3. 설정:
   - **Name**: your-backend-name
   - **Environment**: Java
   - **Build Command**: `./gradlew build` (또는 `./mvnw clean package`)
   - **Start Command**: `java -jar build/libs/your-app.jar` (또는 `target/your-app.jar`)
   - **Root Directory**: `backend/` (백엔드 폴더 경로)

#### 3. 데이터베이스 추가

1. "New" → "PostgreSQL"
2. 무료 플랜 선택
3. 자동으로 `DATABASE_URL` 환경 변수 설정됨

#### 4. 환경 변수 설정

Render 대시보드 → Environment:

```
SPRING_PROFILES_ACTIVE=production
DATABASE_URL=${{postgres.DATABASE_URL}}
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
```

#### 5. 배포 완료

- **자동 배포**: GitHub push 시 자동 배포
- **도메인**: `your-project.onrender.com` 자동 제공

**무료 플랜 제한**:
- ✅ 무료 사용 가능
- ⚠️ 슬리프 모드: 15분 비활성 시 슬리프 (첫 요청 시 깨우기, 느림)
- ⚠️ 제한된 리소스

---

### 옵션 C: Fly.io (대안)

**무료 티어**: 3개 VM, 3GB 스토리지

#### 1. Fly.io 계정 생성

```bash
# Fly CLI 설치
curl -L https://fly.io/install.sh | sh

# 로그인
fly auth login
```

#### 2. 프로젝트 초기화

```bash
cd backend/
fly launch

# 질문에 답변:
# - App name: your-backend-name
# - Region: seoul (또는 가장 가까운 지역)
# - PostgreSQL: Yes
```

#### 3. 환경 변수 설정

```bash
fly secrets set SPRING_PROFILES_ACTIVE=production
fly secrets set JWT_SECRET=your-secret-key
fly secrets set OPENAI_API_KEY=your-openai-key
```

#### 4. 배포

```bash
fly deploy
```

**무료 플랜 제한**:
- ✅ 3개 VM (공유 CPU)
- ✅ 3GB 스토리지
- ✅ 무료 PostgreSQL (256MB)

---

## 🗄️ 데이터베이스 옵션

### 옵션 1: Railway/Render 내장 PostgreSQL (권장)

- 배포 플랫폼과 함께 제공
- 환경 변수 자동 설정
- 무료 티어 사용 가능

### 옵션 2: Supabase (완전 무료)

1. [Supabase](https://supabase.com) 계정 생성
2. 새 프로젝트 생성
3. PostgreSQL 연결 정보 복사
4. 백엔드 환경 변수에 추가:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**무료 플랜 제한**:
- ✅ 500MB 데이터베이스
- ✅ 2GB 대역폭
- ✅ 무제한 API 요청

### 옵션 3: Neon (완전 무료)

1. [Neon](https://neon.tech) 계정 생성
2. 새 프로젝트 생성
3. PostgreSQL 연결 정보 복사

**무료 플랜 제한**:
- ✅ 3GB 스토리지
- ✅ 무제한 프로젝트

---

## 🔗 프론트엔드-백엔드 연결

### 1. CORS 설정 (백엔드)

```java
// SecurityConfig.java 또는 WebConfig.java

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(frontendUrl)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

```yaml
# application-production.yml
app:
  frontend:
    url: https://your-project.vercel.app
```

### 2. 프론트엔드 API URL 설정

Vercel 환경 변수:

```
VITE_API_BASE_URL=https://your-backend.railway.app
```

프론트엔드 코드:

```typescript
// src/shared/api/axios.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

---

## 📝 배포 체크리스트

### 프론트엔드 (Vercel)

- [ ] GitHub 저장소에 코드 푸시
- [ ] Vercel 프로젝트 생성 및 연결
- [ ] 환경 변수 설정 (`VITE_API_BASE_URL`)
- [ ] 빌드 성공 확인
- [ ] 프로덕션 URL 접속 테스트

### 백엔드 (Railway/Render)

- [ ] GitHub 저장소에 코드 푸시
- [ ] Railway/Render 프로젝트 생성
- [ ] 데이터베이스 추가
- [ ] 환경 변수 설정:
  - [ ] `SPRING_PROFILES_ACTIVE=production`
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `OPENAI_API_KEY`
- [ ] CORS 설정 (프론트엔드 URL)
- [ ] 빌드 및 배포 성공 확인
- [ ] API 엔드포인트 테스트

### 통합 테스트

- [ ] 프론트엔드에서 백엔드 API 호출 테스트
- [ ] 로그인/회원가입 테스트
- [ ] 프롬프트 CRUD 테스트
- [ ] CORS 에러 없는지 확인

---

## 💰 비용 요약

### 완전 무료 옵션

| 서비스 | 비용 | 제한 |
|--------|------|------|
| Vercel (프론트) | $0 | 빌드 45분/월 |
| Railway (백엔드) | $0 | $5 크레딧/월 |
| Supabase (DB) | $0 | 500MB, 2GB 대역폭 |
| **총 비용** | **$0/월** | |

### 초저비용 옵션 (더 안정적)

| 서비스 | 비용 | 제한 |
|--------|------|------|
| Vercel (프론트) | $0 | - |
| Railway (백엔드) | $5/월 | 슬리프 없음 |
| Railway PostgreSQL | 포함 | - |
| **총 비용** | **$5/월** | |

---

## 🚨 주의사항

### 1. 슬리프 모드 (무료 플랜)

- **Render**: 15분 비활성 시 슬리프 (첫 요청 시 느림)
- **Railway**: 30일 비활성 시 슬리프 (깨우기 가능)

**해결책**:
- UptimeRobot 같은 무료 모니터링 서비스로 주기적 핑
- 또는 유료 플랜으로 업그레이드

### 2. 환경 변수 보안

- 민감한 정보는 환경 변수로 관리
- GitHub에 `.env` 파일 커밋하지 않기
- Vercel/Railway 환경 변수에만 저장

### 3. 데이터베이스 백업

- 무료 플랜은 자동 백업이 제한적일 수 있음
- 정기적으로 수동 백업 권장

---

## 🔧 트러블슈팅

### 문제 1: CORS 에러

**증상**: 프론트엔드에서 API 호출 시 CORS 에러

**해결**:
1. 백엔드 CORS 설정 확인
2. 프론트엔드 URL이 `allowedOrigins`에 포함되어 있는지 확인
3. 환경 변수 `app.frontend.url` 확인

### 문제 2: 빌드 실패

**증상**: Vercel/Railway 빌드 실패

**해결**:
1. 로컬에서 빌드 테스트: `npm run build` 또는 `./gradlew build`
2. 빌드 로그 확인
3. 환경 변수 누락 확인

### 문제 3: 데이터베이스 연결 실패

**증상**: 백엔드 시작 시 DB 연결 에러

**해결**:
1. `DATABASE_URL` 환경 변수 확인
2. 데이터베이스가 실행 중인지 확인
3. 방화벽/네트워크 설정 확인

---

## 📚 참고 자료

- [Vercel 문서](https://vercel.com/docs)
- [Railway 문서](https://docs.railway.app)
- [Render 문서](https://render.com/docs)
- [Supabase 문서](https://supabase.com/docs)

---

## 🎯 다음 단계

배포 완료 후:

1. **도메인 연결** (선택사항):
   - Vercel: Custom Domain 설정
   - Railway: Custom Domain 설정

2. **모니터링 설정**:
   - UptimeRobot (무료)로 서비스 모니터링
   - 에러 로그 확인

3. **성능 최적화**:
   - 이미지 최적화
   - 코드 스플리팅
   - 캐싱 전략

4. **보안 강화**:
   - Rate Limiting
   - HTTPS 강제
   - 보안 헤더 설정

