# 백엔드 카카오페이 결제 수정 가이드

## 🚨 현재 문제점

카카오페이 결제 승인 후 `PaymentSuccessPage`로 리다이렉트될 때 필요한 파라미터(`orderId`, `tid`, `amount`)가 URL에 포함되지 않아 결제 승인이 실패하고 있습니다.

**현재 상황:**
```
https://yourdomain.com/payment/success?pg_token=3f60d6c19602730c0ddb
```

**필요한 형태:**
```
https://yourdomain.com/payment/success?orderId=123&tid=T1234567890&amount=10000&pg_token=3f60d6c19602730c0ddb
```

## ✅ 수정 사항

### 1. 카카오페이 준비 API 호출 시 `approval_url` 구성

백엔드에서 카카오페이 준비 API(`/v1/payment/ready`)를 호출할 때 `approval_url`에 **반드시** 다음 쿼리 파라미터를 포함해야 합니다:

- `orderId`: 주문 ID (결제 요청 시 생성된 payment ID)
- `tid`: 카카오페이 결제 키 (카카오페이 준비 API 응답에서 받은 `tid`)
- `amount`: 결제 금액

#### 예시 코드 (Java/Spring Boot)

```java
// 카카오페이 준비 API 호출
KakaoPayReadyRequest readyRequest = KakaoPayReadyRequest.builder()
    .cid("TC0ONETIME") // 가맹점 코드
    .partner_order_id(paymentId.toString())
    .partner_user_id(userId.toString())
    .item_name(productName)
    .quantity(1)
    .total_amount(amount)
    .tax_free_amount(0)
    .approval_url(buildApprovalUrl(paymentId, amount)) // ⚠️ 중요!
    .cancel_url("https://yourdomain.com/payment/fail")
    .fail_url("https://yourdomain.com/payment/fail")
    .build();

KakaoPayReadyResponse readyResponse = kakaoPayService.ready(readyRequest);
String tid = readyResponse.getTid(); // ⚠️ 이 값을 저장하고 반환해야 함

// approval_url 구성 메서드
private String buildApprovalUrl(Long orderId, Integer amount) {
    String baseUrl = "https://yourdomain.com/payment/success";
    // ⚠️ 중요: orderId, tid, amount를 쿼리 파라미터로 포함
    // 단, tid는 카카오페이 응답을 받은 후에 알 수 있으므로,
    // 실제로는 두 단계로 나누어야 할 수 있습니다.
    return String.format("%s?orderId=%d&amount=%d", baseUrl, orderId, amount);
}
```

#### ⚠️ 주의사항: `tid` 처리

카카오페이 준비 API 응답에서 `tid`를 받은 후 `approval_url`에 포함해야 하는데, 이는 순환 참조 문제가 있습니다. 해결 방법:

**방법 1: `approval_url`에 `tid`를 포함하지 않고, 프론트엔드에서 sessionStorage 사용 (현재 구현)**
- 백엔드가 `tid`를 응답에 포함하여 반환
- 프론트엔드에서 `tid`를 sessionStorage에 저장
- `approval_url`에는 `orderId`와 `amount`만 포함

**방법 2: `approval_url`에 `tid`를 포함 (권장)**
- 카카오페이 준비 API 호출 후 `tid`를 받음
- `tid`를 포함한 `approval_url`로 다시 카카오페이 준비 API 호출 (또는 별도 엔드포인트 사용)
- 또는 `approval_url`을 동적으로 구성할 수 있는 방법 사용

### 2. 카카오페이 준비 API 응답에 `tid` 포함

백엔드의 `POST /payments` 응답에 카카오페이 `tid`를 포함해야 합니다.

#### 현재 응답 구조 (예상)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "amount": 10000,
    "currency": "KRW",
    "payment_method": "KAKAO_PAY",
    "status": "PENDING",
    "metadata": "{\"next_redirect_pc_url\": \"https://...\"}"
  }
}
```

#### 수정 후 응답 구조

```json
{
  "success": true,
  "data": {
    "id": 123,
    "amount": 10000,
    "currency": "KRW",
    "payment_method": "KAKAO_PAY",
    "status": "PENDING",
    "external_payment_id": "T1234567890",  // ⚠️ 카카오페이 tid 추가
    "metadata": "{\"next_redirect_pc_url\": \"https://...\", \"tid\": \"T1234567890\"}"
  }
}
```

또는 `metadata`에 `tid`를 포함:

```json
{
  "success": true,
  "data": {
    "id": 123,
    "amount": 10000,
    "metadata": "{\"next_redirect_pc_url\": \"https://...\", \"tid\": \"T1234567890\"}"
  }
}
```

### 3. `approval_url` 구성 최종 권장 사항

#### 옵션 A: `tid`를 URL에 포함하지 않음 (현재 프론트엔드 구현 방식)

```java
// approval_url 구성 (tid 제외)
String approvalUrl = String.format(
    "%s/payment/success?orderId=%d&amount=%d",
    frontendBaseUrl,
    paymentId,
    amount
);

// tid는 응답의 metadata나 별도 필드로 반환
paymentResponse.setExternalPaymentId(tid); // 또는
metadata.put("tid", tid);
```

**프론트엔드에서 처리:**
- `tid`를 sessionStorage에 저장
- `PaymentSuccessPage`에서 sessionStorage에서 복원

#### 옵션 B: `tid`를 URL에 포함 (더 명확한 방식)

```java
// 카카오페이 준비 API 호출 후 tid 받기
KakaoPayReadyResponse readyResponse = kakaoPayService.ready(readyRequest);
String tid = readyResponse.getTid();

// approval_url 구성 (tid 포함)
String approvalUrl = String.format(
    "%s/payment/success?orderId=%d&tid=%s&amount=%d",
    frontendBaseUrl,
    paymentId,
    tid,
    amount
);
```

**주의:** 이 경우 카카오페이 준비 API를 호출한 후 `tid`를 받아야 하므로, 두 단계로 나누어야 할 수 있습니다.

## 📋 체크리스트

백엔드 개발자가 확인해야 할 사항:

- [ ] 카카오페이 준비 API 호출 시 `approval_url`에 `orderId` 쿼리 파라미터 포함
- [ ] 카카오페이 준비 API 호출 시 `approval_url`에 `amount` 쿼리 파라미터 포함
- [ ] 카카오페이 준비 API 응답에서 `tid` 추출
- [ ] `tid`를 `POST /payments` 응답에 포함 (metadata 또는 별도 필드)
- [ ] `approval_url`에 `tid` 포함 여부 결정 (옵션 A 또는 B 선택)
- [ ] 환경 변수 `PAYMENT_KAKAO_APPROVAL_URL` 설정 확인

## 🔍 테스트 방법

1. 카카오페이 결제 요청
2. 카카오페이 결제창에서 결제 완료
3. `PaymentSuccessPage`로 리다이렉트되는 URL 확인
4. 브라우저 개발자 도구에서 다음 값들이 모두 있는지 확인:
   - `orderId`: 주문 ID
   - `tid`: 카카오페이 결제 키 (또는 sessionStorage에 저장됨)
   - `amount`: 결제 금액
   - `pg_token`: 카카오페이 승인 토큰

## 📝 참고

- 프론트엔드는 현재 sessionStorage를 사용하여 `tid`를 복원할 수 있도록 구현되어 있습니다.
- 하지만 가장 안정적인 방법은 백엔드에서 `approval_url`에 모든 필요한 파라미터를 포함하는 것입니다.
- `tid`는 카카오페이 준비 API 응답에서만 얻을 수 있으므로, 백엔드에서 이를 처리해야 합니다.

## 🆘 문제 해결

만약 여전히 문제가 발생한다면:

1. **백엔드 로그 확인**
   - 카카오페이 준비 API 호출 시 `approval_url` 값 확인
   - `tid` 값이 제대로 추출되는지 확인

2. **프론트엔드 콘솔 확인**
   - `KakaoPayButton`에서 저장하는 sessionStorage 값 확인
   - `PaymentSuccessPage`에서 복원하는 값 확인

3. **네트워크 탭 확인**
   - 카카오페이로 리다이렉트되는 URL 확인
   - 최종 `PaymentSuccessPage` URL의 쿼리 파라미터 확인

