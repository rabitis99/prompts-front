#!/bin/bash

# 결제 API 백엔드 검증 스크립트
# 사용법: ./test-backend-api.sh

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정
BASE_URL="${API_BASE_URL:-http://localhost:8080/api}"
TOKEN="${API_TOKEN:-YOUR_ACCESS_TOKEN}"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}결제 API 백엔드 검증 시작${NC}"
echo -e "${BLUE}================================${NC}\n"
echo -e "Base URL: ${BASE_URL}"
echo -e "Token: ${TOKEN:0:20}...\n"

# 성공/실패 카운터
SUCCESS_COUNT=0
FAIL_COUNT=0

# 테스트 함수
test_api() {
  local test_name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expected_status="$5"

  echo -e "${YELLOW}[테스트] ${test_name}${NC}"

  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}${endpoint}" \
      -H "Authorization: Bearer ${TOKEN}")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "${BASE_URL}${endpoint}" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d "$data")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" == "$expected_status" ]; then
    echo -e "${GREEN}✅ 통과${NC} (HTTP ${http_code})"
    echo -e "응답: ${body}\n" | jq '.' 2>/dev/null || echo "$body\n"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo -e "${RED}❌ 실패${NC} (예상: ${expected_status}, 실제: ${http_code})"
    echo -e "응답: ${body}\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

# 1. 결제 요청 테스트 (성공)
test_api \
  "1. 결제 요청 (토스페이먼츠)" \
  "POST" \
  "/payments" \
  '{
    "amount": 29900,
    "currency": "KRW",
    "payment_method": "TOSS",
    "user_type": "PERSONAL",
    "metadata": "{\"product_name\":\"Premium Plan\",\"customer_name\":\"홍길동\",\"customer_email\":\"test@example.com\"}"
  }' \
  "200"

# 결제 ID 추출 (마지막 성공한 테스트에서)
PAYMENT_ID=$(curl -s -X POST "${BASE_URL}/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "amount": 29900,
    "currency": "KRW",
    "payment_method": "TOSS",
    "user_type": "PERSONAL",
    "metadata": "{\"product_name\":\"Test\"}"
  }' | jq -r '.data.id' 2>/dev/null)

echo -e "${BLUE}생성된 결제 ID: ${PAYMENT_ID}${NC}\n"

# 2. 결제 요청 테스트 (음수 금액 - 실패)
test_api \
  "2. 결제 요청 (음수 금액 - 실패 예상)" \
  "POST" \
  "/payments" \
  '{
    "amount": -1000,
    "currency": "KRW",
    "payment_method": "TOSS",
    "user_type": "PERSONAL"
  }' \
  "400"

# 3. 결제 요청 테스트 (지원하지 않는 결제 방식 - 실패)
test_api \
  "3. 결제 요청 (잘못된 결제 방식 - 실패 예상)" \
  "POST" \
  "/payments" \
  '{
    "amount": 29900,
    "currency": "KRW",
    "payment_method": "INVALID_METHOD",
    "user_type": "PERSONAL"
  }' \
  "400"

# 4. 결제 승인 테스트 (성공)
if [ "$PAYMENT_ID" != "null" ] && [ -n "$PAYMENT_ID" ]; then
  test_api \
    "4. 결제 승인 (토스페이먼츠)" \
    "POST" \
    "/payments/confirm" \
    "{
      \"orderId\": \"${PAYMENT_ID}\",
      \"amount\": 29900,
      \"paymentKey\": \"test_payment_key_abc123\"
    }" \
    "200"
else
  echo -e "${YELLOW}⚠️  결제 ID를 가져올 수 없어 결제 승인 테스트를 건너뜁니다.${NC}\n"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# 5. 결제 상태 조회 테스트
if [ "$PAYMENT_ID" != "null" ] && [ -n "$PAYMENT_ID" ]; then
  test_api \
    "5. 결제 상태 조회" \
    "GET" \
    "/payments/${PAYMENT_ID}/status" \
    "" \
    "200"
else
  echo -e "${YELLOW}⚠️  결제 ID를 가져올 수 없어 상태 조회 테스트를 건너뜁니다.${NC}\n"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# 6. 존재하지 않는 결제 조회 (실패)
test_api \
  "6. 존재하지 않는 결제 조회 (실패 예상)" \
  "GET" \
  "/payments/999999/status" \
  "" \
  "404"

# 7. 인증 없이 요청 (실패)
echo -e "${YELLOW}[테스트] 7. 인증 없이 결제 요청 (실패 예상)${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 29900,
    "currency": "KRW",
    "payment_method": "TOSS",
    "user_type": "PERSONAL"
  }')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "401" ]; then
  echo -e "${GREEN}✅ 통과${NC} (HTTP ${http_code})"
  echo -e "응답: ${body}\n" | jq '.' 2>/dev/null || echo "$body\n"
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
  echo -e "${RED}❌ 실패${NC} (예상: 401, 실제: ${http_code})"
  echo -e "응답: ${body}\n"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# 8. 카카오페이 결제 요청
test_api \
  "8. 결제 요청 (카카오페이)" \
  "POST" \
  "/payments" \
  '{
    "amount": 29900,
    "currency": "KRW",
    "payment_method": "KAKAO_PAY",
    "user_type": "PERSONAL",
    "metadata": "{\"product_name\":\"Premium Plan\"}"
  }' \
  "200"

# 9. PayPal 결제 요청
test_api \
  "9. 결제 요청 (PayPal)" \
  "POST" \
  "/payments" \
  '{
    "amount": 29.99,
    "currency": "USD",
    "payment_method": "PAYPAL",
    "user_type": "PERSONAL",
    "metadata": "{\"product_name\":\"Premium Plan\"}"
  }' \
  "200"

# 결과 출력
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}테스트 결과 요약${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}성공: ${SUCCESS_COUNT}${NC}"
echo -e "${RED}실패: ${FAIL_COUNT}${NC}"
echo -e "${BLUE}================================${NC}\n"

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}🎉 모든 테스트를 통과했습니다!${NC}"
  exit 0
else
  echo -e "${RED}❌ 일부 테스트가 실패했습니다. 위의 실패 내용을 확인하세요.${NC}"
  exit 1
fi
