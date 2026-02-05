# 백엔드 결제 API 검증 가이드

프론트엔드 결제 모달과 연동하기 위한 백엔드 API 검증 체크리스트입니다.

## 📋 필수 API 엔드포인트 체크리스트

### ✅ 1. 결제 요청 API
- [ ] **엔드포인트**: `POST /api/payments`
- [ ] 인증 토큰 검증 (Authorization Header)
- [ ] 요청 바디 유효성 검증
- [ ] 데이터베이스에 결제 정보 저장
- [ ] 올바른 응답 포맷 반환

### ✅ 2. 결제 승인 API (토스페이먼츠)
- [ ] **엔드포인트**: `POST /api/payments/confirm`
- [ ] 토스페이먼츠 API 연동
- [ ] 결제 금액 검증 (프론트엔드 금액 vs 실제 금액)
- [ ] 결제 상태 업데이트
- [ ] 중복 승인 방지

### ✅ 3. 결제 상태 조회 API
- [ ] **엔드포인트**: `GET /api/payments/{paymentId}/status`
- [ ] 결제 ID 유효성 검증
- [ ] 사용자 권한 확인 (본인 결제만 조회 가능)
- [ ] 최신 결제 상태 반환

---

## 🧪 API 테스트 스크립트

### 1. 결제 요청 API 테스트

```bash
# 성공 케이스
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "amount": 29900,
    "currency": "KRW",
    "payment_method": "TOSS",
    "user_type": "PERSONAL",
    "metadata": "{\"product_name\":\"Premium Plan\",\"customer_name\":\"홍길동\",\"customer_email\":\"test@example.com\"}"
  }'

# 예상 응답 (200 OK)
{
  "success": true,
  "message": "결제 요청이 성공적으로 생성되었습니다.",
  "data": {
    "id": 123,
    "user_id": 1,
    "amount": 29900,
    "currency": "KRW",
    "payment_method": "TOSS",
    "status": "PENDING",
    "user_type": "PERSONAL",
    "retry_count": 0,
    "created_at": "2024-01-31T10:30:00Z",
    "updated_at": "2024-01-31T10:30:00Z"
  }
}
```

**검증 포인트**:
- ✅ `success: true` 반환
- ✅ `data.id` 존재 (양수)
- ✅ `data.amount`가 요청한 금액과 일치
- ✅ `data.status`가 "PENDING"
- ✅ `data.payment_method`가 요청한 방식과 일치

---

### 2. 결제 승인 API 테스트 (토스페이먼츠)

```bash
# 성공 케이스
curl -X POST http://localhost:8080/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "orderId": "123",
    "amount": 29900,
    "paymentKey": "test_payment_key_abc123"
  }'

# 예상 응답 (200 OK)
{
  "success": true,
  "message": "결제가 성공적으로 승인되었습니다.",
  "data": {
    "paymentKey": "test_payment_key_abc123",
    "orderId": "123",
    "status": "DONE",
    "totalAmount": 29900,
    "approvedAt": "2024-01-31T10:35:00+09:00",
    "method": "카드"
  }
}
```

**검증 포인트**:
- ✅ `success: true` 반환
- ✅ `data.status`가 "DONE" 또는 "COMPLETED"
- ✅ `data.totalAmount`가 요청 금액과 일치
- ✅ `data.approvedAt` 존재
- ✅ 데이터베이스에서 결제 상태가 "COMPLETED"로 업데이트됨

---

### 3. 결제 상태 조회 API 테스트

```bash
# 성공 케이스
curl -X GET http://localhost:8080/api/payments/123/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 예상 응답 (200 OK)
{
  "success": true,
  "data": {
    "id": 123,
    "status": "COMPLETED",
    "external_payment_id": "test_payment_key_abc123",
    "approved_at": "2024-01-31T10:35:00Z",
    "created_at": "2024-01-31T10:30:00Z",
    "updated_at": "2024-01-31T10:35:00Z"
  }
}
```

**검증 포인트**:
- ✅ `success: true` 반환
- ✅ `data.id`가 요청한 ID와 일치
- ✅ `data.status` 존재
- ✅ 본인의 결제만 조회 가능

---

## 🚨 에러 케이스 테스트

### 1. 인증 실패 (401 Unauthorized)

```bash
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 29900,
    "currency": "KRW",
    "payment_method": "TOSS",
    "user_type": "PERSONAL"
  }'

# 예상 응답 (401)
{
  "success": false,
  "message": "인증이 필요합니다.",
  "error": "UNAUTHORIZED"
}
```

### 2. 유효성 검증 실패 (400 Bad Request)

```bash
# 음수 금액
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "amount": -1000,
    "currency": "KRW",
    "payment_method": "TOSS",
    "user_type": "PERSONAL"
  }'

# 예상 응답 (400)
{
  "success": false,
  "message": "유효하지 않은 결제 금액입니다.",
  "error": "INVALID_AMOUNT"
}
```

### 3. 지원하지 않는 결제 방식 (400 Bad Request)

```bash
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "amount": 29900,
    "currency": "KRW",
    "payment_method": "INVALID_METHOD",
    "user_type": "PERSONAL"
  }'

# 예상 응답 (400)
{
  "success": false,
  "message": "지원하지 않는 결제 방식입니다.",
  "error": "UNSUPPORTED_PAYMENT_METHOD"
}
```

### 4. 결제 승인 실패 (400 Bad Request)

```bash
curl -X POST http://localhost:8080/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "orderId": "999999",
    "amount": 29900,
    "paymentKey": "invalid_key"
  }'

# 예상 응답 (404 또는 400)
{
  "success": false,
  "message": "결제 정보를 찾을 수 없습니다.",
  "error": "PAYMENT_NOT_FOUND"
}
```

### 5. 금액 불일치 (400 Bad Request)

```bash
curl -X POST http://localhost:8080/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "orderId": "123",
    "amount": 50000,
    "paymentKey": "test_key"
  }'

# 예상 응답 (400)
{
  "success": false,
  "message": "결제 금액이 일치하지 않습니다.",
  "error": "AMOUNT_MISMATCH"
}
```

---

## 🔒 보안 검증 체크리스트

### 필수 보안 검증
- [ ] **인증 토큰 검증**: 모든 결제 API는 인증 필수
- [ ] **사용자 권한 확인**: 본인의 결제만 조회/수정 가능
- [ ] **금액 재검증**: 프론트엔드에서 받은 금액을 백엔드에서 다시 검증
- [ ] **중복 결제 방지**: 동일한 orderId로 중복 승인 불가
- [ ] **Rate Limiting**: 결제 요청 횟수 제한 (예: 분당 10회)
- [ ] **CSRF 토큰**: CSRF 공격 방지
- [ ] **SQL Injection 방지**: 파라미터 바인딩 사용
- [ ] **XSS 방지**: 사용자 입력 sanitization

### 데이터 검증
- [ ] `amount > 0` (양수 금액만 허용)
- [ ] `currency` enum 검증 (KRW, USD, EUR 등)
- [ ] `payment_method` enum 검증 (TOSS, KAKAO_PAY, PAYPAL)
- [ ] `user_type` enum 검증 (PERSONAL, BUSINESS)
- [ ] 최대 결제 금액 제한 (예: 100만원)

---

## 📊 데이터베이스 검증

### 결제 테이블 (payments)

```sql
-- 결제 생성 후 확인
SELECT * FROM payments WHERE id = 123;

-- 확인 사항:
-- ✅ status = 'PENDING' (생성 직후)
-- ✅ amount = 29900
-- ✅ currency = 'KRW'
-- ✅ payment_method = 'TOSS'
-- ✅ user_id = 현재 로그인한 사용자 ID
-- ✅ created_at, updated_at 존재
```

```sql
-- 결제 승인 후 확인
SELECT * FROM payments WHERE id = 123;

-- 확인 사항:
-- ✅ status = 'COMPLETED'
-- ✅ external_payment_id = 'test_payment_key_abc123'
-- ✅ approved_at 존재
-- ✅ updated_at이 승인 시간으로 업데이트됨
```

---

## 🔄 결제 흐름 시나리오 테스트

### 시나리오 1: 토스페이먼츠 정상 결제

```bash
# Step 1: 결제 요청
PAYMENT_RESPONSE=$(curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 29900,
    "currency": "KRW",
    "payment_method": "TOSS",
    "user_type": "PERSONAL",
    "metadata": "{\"product_name\":\"Premium Plan\"}"
  }')

# 응답에서 payment_id 추출
PAYMENT_ID=$(echo $PAYMENT_RESPONSE | jq -r '.data.id')

echo "Payment ID: $PAYMENT_ID"

# Step 2: 결제 승인 (토스페이먼츠 결제 완료 후)
curl -X POST http://localhost:8080/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{
    \"orderId\": \"$PAYMENT_ID\",
    \"amount\": 29900,
    \"paymentKey\": \"test_payment_key_12345\"
  }"

# Step 3: 결제 상태 확인
curl -X GET "http://localhost:8080/api/payments/$PAYMENT_ID/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**예상 결과**:
1. Step 1: `status = PENDING` 반환
2. Step 2: `status = DONE` 반환
3. Step 3: `status = COMPLETED` 반환

---

### 시나리오 2: 카카오페이 정상 결제

```bash
# Step 1: 결제 요청
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 29900,
    "currency": "KRW",
    "payment_method": "KAKAO_PAY",
    "user_type": "PERSONAL",
    "metadata": "{\"product_name\":\"Premium Plan\"}"
  }'

# Step 2: 카카오페이 결제 준비 (백엔드에서 카카오 API 호출)
# 백엔드는 next_redirect_pc_url을 반환해야 함

# Step 3: 사용자가 카카오페이 결제 완료 후 approval_url로 돌아옴
# 백엔드는 pg_token을 받아 결제 승인 요청
```

---

### 시나리오 3: 결제 실패 처리

```bash
# Step 1: 결제 요청
PAYMENT_ID=123

# Step 2: 잘못된 paymentKey로 승인 시도
curl -X POST http://localhost:8080/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "123",
    "amount": 29900,
    "paymentKey": "invalid_key_xxxxx"
  }'

# 예상 응답 (400 또는 500)
{
  "success": false,
  "message": "결제 승인에 실패했습니다.",
  "error": "PAYMENT_APPROVAL_FAILED"
}

# Step 3: 데이터베이스 확인
# ✅ status가 여전히 'PENDING' 또는 'FAILED'로 업데이트
# ✅ failure_reason에 에러 메시지 저장
# ✅ retry_count 증가
```

---

## 🧰 자동화 테스트 스크립트 (Python)

```python
import requests
import json

BASE_URL = "http://localhost:8080/api"
TOKEN = "YOUR_ACCESS_TOKEN"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

def test_payment_flow():
    """결제 전체 흐름 테스트"""

    # 1. 결제 요청
    print("1. 결제 요청...")
    payment_data = {
        "amount": 29900,
        "currency": "KRW",
        "payment_method": "TOSS",
        "user_type": "PERSONAL",
        "metadata": json.dumps({"product_name": "Premium Plan"})
    }

    response = requests.post(
        f"{BASE_URL}/payments",
        headers=headers,
        json=payment_data
    )

    assert response.status_code == 200, f"결제 요청 실패: {response.status_code}"
    payment_result = response.json()
    assert payment_result["success"] == True, "결제 요청 실패"

    payment_id = payment_result["data"]["id"]
    print(f"✅ 결제 ID: {payment_id}")

    # 2. 결제 승인
    print("2. 결제 승인...")
    confirm_data = {
        "orderId": str(payment_id),
        "amount": 29900,
        "paymentKey": "test_key_12345"
    }

    response = requests.post(
        f"{BASE_URL}/payments/confirm",
        headers=headers,
        json=confirm_data
    )

    assert response.status_code == 200, f"결제 승인 실패: {response.status_code}"
    confirm_result = response.json()
    assert confirm_result["success"] == True, "결제 승인 실패"
    print("✅ 결제 승인 성공")

    # 3. 결제 상태 확인
    print("3. 결제 상태 확인...")
    response = requests.get(
        f"{BASE_URL}/payments/{payment_id}/status",
        headers=headers
    )

    assert response.status_code == 200, f"상태 조회 실패: {response.status_code}"
    status_result = response.json()
    assert status_result["data"]["status"] == "COMPLETED", "결제 상태가 COMPLETED가 아님"
    print("✅ 결제 상태: COMPLETED")

    print("\n🎉 모든 테스트 통과!")

if __name__ == "__main__":
    try:
        test_payment_flow()
    except AssertionError as e:
        print(f"❌ 테스트 실패: {e}")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
```

---

## 📝 백엔드 구현 체크리스트

### 토스페이먼츠 연동
- [ ] `@tosspayments/server-sdk` 또는 axios로 토스 API 호출
- [ ] Secret Key 환경 변수 설정
- [ ] `/v1/payments/confirm` API 호출 구현
- [ ] 서명 검증 (Authorization Header)
- [ ] 웹훅 엔드포인트 구현 (`POST /api/webhooks/toss`)

### 카카오페이 연동
- [ ] 카카오 Admin Key 발급
- [ ] `/v1/payment/ready` API 호출 구현
- [ ] `/v1/payment/approve` API 호출 구현
- [ ] pg_token 처리 로직
- [ ] 결제 준비/승인 상태 관리

### PayPal 연동
- [ ] `@paypal/checkout-server-sdk` 설치
- [ ] Client ID, Secret 환경 변수 설정
- [ ] Order 생성 API 구현
- [ ] Order Capture API 구현
- [ ] 웹훅 엔드포인트 구현

### 공통 구현
- [ ] 결제 정보 암호화 (민감 정보)
- [ ] 트랜잭션 처리 (ACID 보장)
- [ ] 에러 로깅 시스템
- [ ] 결제 내역 조회 API
- [ ] 환불 API
- [ ] 관리자 대시보드 API

---

## ✅ 최종 검증 체크리스트

프론트엔드 개발자에게 전달하기 전 확인:

### API 응답 형식
- [ ] 모든 API가 일관된 응답 형식 사용 (`success`, `message`, `data`)
- [ ] 에러 응답에 명확한 `error` 코드 포함
- [ ] HTTP 상태 코드가 올바르게 설정됨

### 데이터 일관성
- [ ] 금액 타입이 일관됨 (정수 또는 실수)
- [ ] 날짜 형식이 ISO 8601 (예: `2024-01-31T10:30:00Z`)
- [ ] enum 값이 프론트엔드 타입과 일치

### 성능
- [ ] 결제 요청 응답 시간 < 500ms
- [ ] 데이터베이스 인덱스 설정 (user_id, status, created_at)
- [ ] 결제 내역 조회에 페이지네이션 적용

### 보안
- [ ] HTTPS만 허용
- [ ] Secret Key가 코드에 하드코딩되지 않음
- [ ] 모든 민감 정보 로깅 제외
- [ ] Rate Limiting 적용

### 문서화
- [ ] API 문서 작성 (Swagger 또는 README)
- [ ] 에러 코드 목록 정리
- [ ] 환경 변수 설정 가이드

---

## 🚀 프론트엔드 개발자에게 전달할 정보

백엔드 구현 완료 후, 프론트엔드 개발자에게 다음 정보를 전달하세요:

```markdown
## 결제 API 연동 정보

### 1. Base URL
- 개발: `http://localhost:8080/api`
- 스테이징: `https://staging-api.example.com/api`
- 프로덕션: `https://api.example.com/api`

### 2. 인증
- Header: `Authorization: Bearer {access_token}`
- 토큰 만료 시간: 24시간

### 3. 지원하는 결제 방식
- TOSS (토스페이먼츠)
- KAKAO_PAY (카카오페이)
- PAYPAL (페이팔)

### 4. 지원하는 통화
- KRW (원화)
- USD (달러)
- EUR (유로)

### 5. 테스트 계정
- Email: `test@example.com`
- Password: `test1234`
- Access Token: `test_token_abc123`

### 6. 주의사항
- 모든 금액은 정수로 전송 (KRW: 원 단위, USD: 센트 단위)
- 결제 승인은 반드시 5분 이내에 완료
- 중복 결제 방지를 위해 orderId는 고유해야 함
```

---

이 문서를 참고하여 백엔드 API가 올바르게 구현되었는지 검증하세요!
