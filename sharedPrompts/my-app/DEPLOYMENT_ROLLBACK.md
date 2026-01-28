# 배포 롤백 전략

## 개요

이 문서는 프로덕션 배포 후 문제 발생 시 롤백 절차를 정의합니다.

## 롤백 시나리오

### 1. 자동 롤백 (권장)

#### 헬스 체크 기반 자동 롤백
- 배포 후 5분간 헬스 체크 실패 시 자동 롤백
- 에러율이 임계값(5%) 초과 시 자동 롤백

#### 구현 방법
```yaml
# CI/CD 파이프라인 예시 (GitHub Actions, GitLab CI 등)
deploy:
  steps:
    - name: Deploy
      run: ./deploy.sh
    
    - name: Health Check
      run: |
        for i in {1..10}; do
          if curl -f https://app.example.com/health; then
            echo "Health check passed"
            exit 0
          fi
          sleep 30
        done
        echo "Health check failed - rolling back"
        ./rollback.sh
```

### 2. 수동 롤백

#### 즉시 롤백이 필요한 경우
- 사용자 데이터 손실 위험
- 보안 취약점 발견
- 서비스 완전 중단

#### 롤백 절차

1. **빌드 버전 확인**
   ```bash
   # 현재 배포된 버전 확인
   cat dist/version.txt
   ```

2. **이전 버전으로 롤백**
   ```bash
   # Git 태그로 롤백
   git checkout <previous-version-tag>
   npm run build
   ./deploy.sh
   ```

3. **롤백 확인**
   - 헬스 체크 확인
   - 주요 기능 동작 확인
   - 에러 로그 모니터링

### 3. 블루-그린 배포 (고급)

#### 개념
- 두 개의 동일한 환경(블루, 그린)을 운영
- 새 버전을 그린 환경에 배포
- 검증 후 트래픽을 그린으로 전환
- 문제 발생 시 즉시 블루로 전환

#### 장점
- 롤백 시간 최소화 (트래픽 전환만)
- 무중단 배포 가능

## 버전 관리

### 빌드 산출물 버전 관리

```json
// package.json
{
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -b && vite build && echo $npm_package_version > dist/version.txt"
  }
}
```

### 배포 히스토리 기록

```bash
# deploy.log에 배포 기록
echo "$(date): Deployed version $npm_package_version" >> deploy.log
```

## 모니터링

### 롤백 결정 지표

1. **에러율**: 5% 초과 시 롤백 고려
2. **응답 시간**: 평균 응답 시간 2배 이상 증가 시
3. **사용자 리포트**: 심각한 버그 리포트 다수 발생 시

### 알림 설정

- 배포 알림: Slack, Email
- 롤백 알림: 즉시 알림
- 에러 알림: Sentry, LogRocket

## 롤백 체크리스트

- [ ] 현재 버전 확인
- [ ] 이전 버전 확인
- [ ] 롤백 이유 문서화
- [ ] 롤백 실행
- [ ] 롤백 후 검증
- [ ] 팀에 롤백 알림
- [ ] 문제 원인 분석
- [ ] 재배포 계획 수립

## 예방 조치

1. **스테이징 환경 테스트**: 프로덕션 배포 전 충분한 테스트
2. **카나리 배포**: 소수 사용자에게만 먼저 배포
3. **Feature Flag**: 새 기능을 점진적으로 활성화
4. **자동화된 테스트**: CI/CD 파이프라인에 테스트 통합

## 연락처

- 배포 담당자: [이름]
- 긴급 연락처: [전화번호]
- Slack 채널: #deployment

