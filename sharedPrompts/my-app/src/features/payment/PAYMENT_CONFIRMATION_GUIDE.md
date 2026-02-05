# 결제 승인 플로우 구현 가이드

## 개요

이 문서는 토스페이먼츠와 카카오페이 결제 승인 플로우의 프론트엔드 구현 방법을 설명합니다.

## ⚠️ 중요 제약사항

**paymentKey와 pgToken은 서버에서 생성할 수 없으며 반드시 프론트엔드에서 전달해야 합니다.**

- **paymentKey**: 토스페이먼츠 결제 위젯에서 결제 성공 시 생성되는 고유 키
- **pgToken**: 카카오페이 결제 승인 후 카카오에서 리다이렉트할 때 전달되는 1회성 토큰
  - 승인 API 호출 후 즉시 무효화됨
  - 프론트엔드에서 누락되면 결제 승인은 절대 성공할 수 없음

## 1. 토스페이먼츠 결제 승인 플로우

### 플로우 설명

1. 사용자가 결제 정보 입력 후 "결제하기" 버튼 클릭
2. 백엔드에 결제 요청 (`POST /payments`)
3. 토스페이먼츠 결제 위젯 호출
4. 사용자가 결제 완료
5. 토스페이먼츠가 `successUrl`로 리다이렉트 (URL 파라미터: `orderId`, `paymentKey`, `amount`)
6. `PaymentSuccessPage`에서 `paymentKey` 추출
7. 백엔드에 결제 승인 요청 (`POST /api/payments/confirm`)

### 구현 코드

#### TossPaymentForm.tsx

```tsx
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { paymentApi } from '../api/payment.api';

export function TossPaymentForm({ amount, productName, ... }) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 1. 백엔드에 결제 요청
    const response = await paymentApi.requestPayment({
      amount,
      currency: 'KRW',
      payment_method: PaymentMethod.TOSS,
      // ...
    });

    const paymentData = response.data.data;

    // 2. 토스페이먼츠 결제 위젯 호출
    const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
    
    /**
     * ⚠️ 중요: paymentKey는 토스페이먼츠 결제 위젯에서 결제 성공 시 생성되는 고유 키입니다.
     * - 이 키는 토스페이먼츠 서버에서 결제 위젯이 성공적으로 처리된 후에만 생성됩니다.
     * - 서버에서는 이 값을 생성하거나 추측할 수 없습니다.
     * - 프론트엔드에서 토스 결제 위젯의 성공 콜백 또는 리다이렉트 URL의 쿼리 파라미터로만 획득 가능합니다.
     * - 결제 성공 시 successUrl로 리다이렉트되며, URL 파라미터로 orderId, paymentKey, amount가 전달됩니다.
     */
    await tossPayments.requestPayment('카드', {
      amount: paymentAmount,
      orderId: paymentData.id.toString(),
      orderName: productName,
      customerName,
      customerEmail,
      successUrl: `${window.location.origin}/payment/success?orderId=${paymentData.id}&amount=${paymentAmount}`,
      failUrl: `${window.location.origin}/payment/fail`,
    });
  };
}
```

#### PaymentSuccessPage.tsx (토스페이먼츠 처리 부분)

```tsx
export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey'); // 토스페이먼츠에서 전달
    const amount = searchParams.get('amount');

    if (!orderId || !paymentKey || !amount) {
      setStatus('error');
      return;
    }

    /**
     * ⚠️ 중요: paymentKey는 토스페이먼츠 결제 위젯에서 결제 성공 시 생성되는 고유 키입니다.
     * - 서버에서는 이 값을 생성하거나 추측할 수 없습니다.
     * - 프론트엔드에서 토스 결제 위젯의 성공 콜백 또는 리다이렉트 URL의 쿼리 파라미터로만 획득 가능합니다.
     * - pgToken은 토스페이먼츠에서는 사용하지 않으므로 보내지 않습니다.
     */
    const response = await paymentApi.confirmPayment({
      order_id: orderId,
      amount: Number(amount),
      payment_key: paymentKey, // 프론트엔드에서만 획득 가능
      // pgToken은 토스페이먼츠에서 사용하지 않음
    });
  }, [searchParams]);
}
```

### 백엔드 DTO

```typescript
{
  orderId: string;      // 주문 ID
  amount: number;        // 결제 금액
  paymentKey: string;    // 토스페이먼츠 결제 키 (프론트엔드에서만 획득 가능)
  // pgToken은 보내지 않음
}
```

## 2. 카카오페이 결제 승인 플로우

### 플로우 설명

1. 사용자가 "카카오페이로 결제" 버튼 클릭
2. 백엔드에 결제 요청 (`POST /payments`) - 카카오페이 준비 API 호출
3. 백엔드에서 `next_redirect_pc_url` 반환
4. 카카오페이 결제 페이지로 리다이렉트
5. 사용자가 결제 승인
6. 카카오페이가 `approval_url`로 리다이렉트 (URL 파라미터: `orderId`, `tid`, `pg_token`, `amount`)
7. `PaymentSuccessPage`에서 `pg_token` 추출
8. 백엔드에 결제 승인 요청 (`POST /api/payments/confirm`)

### 구현 코드

#### KakaoPayButton.tsx

```tsx
export function KakaoPayButton({ amount, productName, ... }) {
  const handleKakaoPay = async () => {
    // 1. 백엔드에 카카오페이 결제 준비 요청
    const response = await paymentApi.requestPayment({
      amount,
      currency: 'KRW',
      payment_method: PaymentMethod.KAKAO_PAY,
      // ...
    });

    const paymentData = response.data.data;

    // 2. 카카오페이 결제창으로 리다이렉트 URL 찾기
    let redirectUrl = null;
    if (paymentData.metadata) {
      const metadata = JSON.parse(paymentData.metadata);
      redirectUrl = metadata.next_redirect_pc_url;
    }

    /**
     * ⚠️ 중요: 백엔드에서 카카오페이 준비 API 호출 시 approval_url을 구성할 때
     * orderId와 amount를 쿼리 파라미터로 포함시켜야 합니다.
     * 
     * 예시:
     * approval_url: https://yourdomain.com/payment/success?orderId=123&tid=TID&amount=10000
     * 
     * 결제 승인 후 카카오페이가 이 URL로 리다이렉트하며 pg_token을 추가합니다:
     * https://yourdomain.com/payment/success?orderId=123&tid=TID&amount=10000&pg_token=TOKEN
     */
    window.location.href = redirectUrl;
  };
}
```

#### PaymentSuccessPage.tsx (카카오페이 처리 부분)

```tsx
export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const tid = searchParams.get('tid'); // 카카오페이에서 전달 (paymentKey로 사용)
    const pgToken = searchParams.get('pg_token'); // 카카오페이에서 전달
    const amount = searchParams.get('amount');

    if (!orderId || !tid || !pgToken || !amount) {
      setStatus('error');
      return;
    }

    /**
     * ⚠️ 중요: pgToken은 카카오페이에서 결제 승인 후 리다이렉트할 때만 전달되는 1회성 토큰입니다.
     * - 이 토큰은 카카오페이 결제 페이지에서 사용자가 결제를 승인한 후에만 생성됩니다.
     * - 서버에서는 이 값을 생성하거나 추측할 수 없습니다.
     * - 프론트엔드에서 리다이렉트 URL의 쿼리 파라미터로만 획득 가능합니다.
     * - 승인 API 호출 후 즉시 무효화되므로, 프론트엔드에서 누락되면 결제 승인은 절대 성공할 수 없습니다.
     */
    const response = await paymentApi.confirmPayment({
      order_id: orderId,
      amount: Number(amount),
      payment_key: tid, // 카카오페이에서는 tid를 paymentKey로 사용
      pg_token: pgToken, // 카카오페이 승인 시 필수 (프론트엔드에서만 획득 가능)
    });
  }, [searchParams]);
}
```

### 백엔드 DTO

```typescript
{
  orderId: string;      // 주문 ID
  amount: number;       // 결제 금액
  paymentKey: string;  // 카카오페이 tid (프론트엔드에서만 획득 가능)
  pgToken: string;      // 카카오페이 승인 토큰 (1회성, 프론트엔드에서만 획득 가능)
}
```

## 3. 백엔드 설정 요구사항

### 카카오페이 approval_url 구성

백엔드에서 카카오페이 준비 API(`/v1/payment/ready`) 호출 시 `approval_url`을 구성할 때 다음 정보를 포함해야 합니다:

```
approval_url: https://yourdomain.com/payment/success?orderId={orderId}&tid={tid}&amount={amount}
```

결제 승인 후 카카오페이가 이 URL로 리다이렉트하며 `pg_token`을 추가합니다:

```
https://yourdomain.com/payment/success?orderId=123&tid=TID&amount=10000&pg_token=TOKEN
```

## 4. 주요 파일 위치

- **토스페이먼츠 결제 폼**: `src/features/payment/ui/TossPaymentForm.tsx`
- **카카오페이 결제 버튼**: `src/features/payment/ui/KakaoPayButton.tsx`
- **결제 성공 페이지**: `src/pages/payment/PaymentSuccessPage.tsx`
- **결제 API**: `src/features/payment/api/payment.api.ts`
- **결제 타입**: `src/features/payment/types/payment.types.ts`

## 5. 테스트 시 주의사항

- **Postman 등 서버 단독 테스트는 불가능합니다**
  - `paymentKey`와 `pgToken`은 프론트엔드에서만 획득 가능
  - 실제 결제 플로우를 통해 테스트해야 함

- **카카오페이 pg_token**
  - 1회성 토큰이므로 한 번만 사용 가능
  - 승인 API 호출 후 즉시 무효화
  - 테스트 시 매번 새로운 결제 플로우를 진행해야 함

## 6. 에러 처리

### 토스페이먼츠
- `paymentKey` 누락: 결제 승인 실패
- `orderId` 또는 `amount` 불일치: 결제 승인 실패

### 카카오페이
- `pg_token` 누락: 결제 승인 실패 (가장 중요!)
- `tid` 누락: 결제 승인 실패
- `orderId` 또는 `amount` 불일치: 결제 승인 실패

## 7. 카카오페이 403 Forbidden 에러 해결

### 에러 현상
```
403 Forbidden on POST request for "https://open-api.kakaopay.com/online/v1/payment/ready"
{"error_code":-403,"error_message":"접근 금지됨"}
```

### 원인 분석

이 에러는 **백엔드에서 KakaoPay API를 호출할 때 발생**합니다. 프론트엔드에서 보내는 요청 데이터가 백엔드가 KakaoPay API를 호출하는 데 필요한 정보를 제대로 전달하지 못할 수 있습니다.

#### 1. 프론트엔드 요청 데이터 형식 확인

**올바른 요청 형식:**
```typescript
{
  amount: number,              // 숫자 타입 (문자열 X)
  currency: string,            // "KRW" (대문자)
  payment_method: "KAKAO_PAY", // enum 값 (문자열 X)
  user_type: "PERSONAL",      // enum 값 (문자열 X)
  metadata: string            // JSON 문자열 (객체 X)
}
```

**잘못된 예시:**
```typescript
// ❌ 잘못됨: amount가 문자열
{ amount: "10000", ... }

// ❌ 잘못됨: metadata가 객체
{ metadata: { product_name: "..." }, ... }

// ❌ 잘못됨: 필드명이 camelCase
{ paymentMethod: "KAKAO_PAY", ... }
```

#### 2. 필수 필드 확인

다음 필드들이 모두 포함되어야 합니다:
- ✅ `amount`: 숫자 (필수)
- ✅ `currency`: 문자열 "KRW" (필수)
- ✅ `payment_method`: "KAKAO_PAY" (필수)
- ✅ `user_type`: "PERSONAL" 또는 "BUSINESS" (필수)
- ⚠️ `metadata`: JSON 문자열 (선택, 하지만 포함 권장)

#### 3. 백엔드가 KakaoPay API 호출에 필요한 정보

백엔드가 KakaoPay API를 호출하려면 다음 정보가 필요합니다:
- `cid`: 가맹점 코드 (백엔드 설정)
- `partner_order_id`: 주문 ID (백엔드에서 생성)
- `partner_user_id`: 사용자 ID (백엔드에서 추출)
- `item_name`: 상품명 (프론트엔드 `metadata`에서 추출 가능)
- `quantity`: 수량
- `total_amount`: 총 금액 (프론트엔드 `amount`)
- `tax_free_amount`: 면세 금액
- `approval_url`: 승인 후 리다이렉트 URL (백엔드에서 구성)
- `cancel_url`: 취소 시 리다이렉트 URL
- `fail_url`: 실패 시 리다이렉트 URL

**프론트엔드에서 확인할 사항:**
- `metadata`에 `product_name`이 포함되어 있는지 확인
- `amount`가 올바른 숫자 값인지 확인
- 모든 필수 필드가 포함되어 있는지 확인

#### 4. 디버깅 방법

**프론트엔드에서 확인:**
```typescript
const requestData = {
  amount,
  currency,
  payment_method: PaymentMethod.KAKAO_PAY,
  user_type: PaymentUserType.PERSONAL,
  metadata: JSON.stringify({
    product_name: productName,
  }),
};

// 실제 전송 데이터 확인
console.log('전송 데이터:', JSON.stringify(requestData, null, 2));
console.log('데이터 타입:', {
  amount: typeof amount,
  currency: typeof currency,
  payment_method: typeof requestData.payment_method,
  user_type: typeof requestData.user_type,
  metadata: typeof requestData.metadata,
});
```

**백엔드에서 확인해야 할 사항:**
- KakaoPay API 키/시크릿 키가 올바르게 설정되어 있는지
- Authorization 헤더 형식이 올바른지
- IP 화이트리스트 설정이 올바른지
- 카카오페이 개발자센터에서 앱 상태가 정상인지

#### 5. 해결 방법

1. **프론트엔드 요청 데이터 검증**
   - 모든 필드가 올바른 타입인지 확인
   - 필수 필드가 모두 포함되어 있는지 확인
   - `metadata`가 JSON 문자열인지 확인

2. **백엔드 설정 확인**
   - KakaoPay API 키/시크릿 키 확인
   - 카카오페이 개발자센터에서 앱 설정 확인
   - IP 화이트리스트 확인 (개발 환경)

3. **네트워크 요청 확인**
   - 브라우저 개발자 도구 Network 탭에서 실제 전송 데이터 확인
   - 백엔드 로그에서 받은 요청 데이터 확인



