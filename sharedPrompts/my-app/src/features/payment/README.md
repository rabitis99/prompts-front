# 결제 모달 구현 가이드

React + TypeScript + 토스페이먼츠/카카오페이/PayPal을 사용한 결제 모달 구현 가이드입니다.

## 📦 지원하는 결제 수단

- **토스페이먼츠** - 국내 간편결제 (카드, 계좌이체 등)
- **카카오페이** - 카카오톡 간편결제
- **PayPal** - 글로벌 결제 (신용카드, PayPal 계정)

## 📁 파일 구조

```
src/features/payment/
├── ui/
│   ├── PaymentModal.tsx              # 메인 결제 모달 컴포넌트
│   ├── PaymentMethodSelector.tsx     # 결제 수단 선택 UI
│   ├── TossPaymentForm.tsx           # 토스페이먼츠 결제 폼
│   ├── KakaoPayButton.tsx            # 카카오페이 결제 버튼
│   ├── PaypalButton.tsx              # PayPal 결제 버튼
│   └── PaymentExample.tsx            # 사용 예제
├── api/
│   └── payment.api.ts                # 결제 API 클라이언트
└── types/
    └── payment.types.ts              # 결제 타입 정의
```

## 🚀 사용 방법

### 1. 기본 사용 예제

```tsx
import { useState } from 'react';
import { PaymentModal } from '@/features/payment/ui/PaymentModal';

function MyComponent() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handlePaymentSuccess = (paymentId: number) => {
    console.log('결제 성공:', paymentId);
    // 성공 후 처리 로직
  };

  const handlePaymentError = (error: string) => {
    console.error('결제 실패:', error);
    // 에러 처리 로직
  };

  return (
    <>
      <button onClick={() => setIsPaymentOpen(true)}>
        결제하기
      </button>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        productName="Premium Plan"
        amount={29900}
        currency="KRW"
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </>
  );
}
```

### 2. Props 설명

```typescript
interface PaymentModalProps {
  isOpen: boolean;              // 모달 열림 상태
  onClose: () => void;          // 모달 닫기 콜백
  productName: string;          // 상품명
  amount: number;               // 결제 금액
  currency?: string;            // 통화 (기본값: 'KRW')
  onPaymentSuccess?: (paymentId: number) => void;  // 결제 성공 콜백
  onPaymentError?: (error: string) => void;        // 결제 실패 콜백
}
```

## 🔄 결제 흐름 설명

### 전체 흐름도

```
1. 사용자: "결제하기" 버튼 클릭
   ↓
2. PaymentModal 열림 (상품 정보 표시)
   ↓
3. 결제 수단 선택
   - 토스페이먼츠
   - 카카오페이
   - PayPal
   ↓
4. 결제 정보 입력 및 결제 요청
   [프론트엔드] → [백엔드] POST /api/payments
   ← {paymentId, amount, status}
   ↓
5. 각 결제사 결제창 호출
   - 토스: 토스페이먼츠 결제창
   - 카카오: 카카오페이 결제창
   - PayPal: PayPal 팝업
   ↓
6. 사용자 결제 진행
   ↓
7. 결제 승인 처리
   [프론트엔드] → [백엔드] POST /api/payments/confirm
   ← {success: true, paymentId}
   ↓
8. 결제 성공 화면 표시 ✅
```

### 결제 수단별 상세 흐름

#### 1️⃣ 토스페이먼츠

```typescript
// 1. 결제 요청
POST /api/payments
{
  "amount": 29900,
  "currency": "KRW",
  "payment_method": "TOSS",
  "user_type": "PERSONAL",
  "metadata": {
    "product_name": "Premium Plan",
    "customer_name": "홍길동",
    "customer_email": "example@email.com"
  }
}

// 2. 토스페이먼츠 SDK로 결제창 호출
const tossPayments = await loadTossPayments(clientKey);
await tossPayments.requestPayment('카드', {
  amount: 29900,
  orderId: 'ORDER_12345',
  orderName: 'Premium Plan',
  customerName: '홍길동',
  successUrl: `${window.location.origin}/payment/success`,
  failUrl: `${window.location.origin}/payment/fail`,
});

// 3. 결제 성공 시 successUrl로 리다이렉트
// 4. 백엔드에 결제 승인 요청
POST /api/payments/confirm
{
  "orderId": "ORDER_12345",
  "amount": 29900,
  "paymentKey": "tgen_xxx"
}
```

#### 2️⃣ 카카오페이

```typescript
// 1. 결제 준비 요청
POST /api/payments
{
  "amount": 29900,
  "currency": "KRW",
  "payment_method": "KAKAO_PAY"
}

// 2. 카카오페이 API 호출 (백엔드)
POST https://kapi.kakao.com/v1/payment/ready
{
  "cid": "TC0ONETIME",
  "partner_order_id": "ORDER_12345",
  "partner_user_id": "USER_123",
  "item_name": "Premium Plan",
  "quantity": 1,
  "total_amount": 29900,
  "approval_url": "${origin}/payment/kakao/success",
  "cancel_url": "${origin}/payment/kakao/cancel",
  "fail_url": "${origin}/payment/kakao/fail"
}

// 3. 카카오페이 결제창으로 리다이렉트
window.location.href = next_redirect_pc_url;

// 4. 결제 승인 (사용자가 승인 후 approval_url로 돌아옴)
POST https://kapi.kakao.com/v1/payment/approve
{
  "tid": "T123456789",
  "partner_order_id": "ORDER_12345",
  "pg_token": "pg_token_from_url"
}
```

#### 3️⃣ PayPal

```typescript
// 1. 결제 요청
POST /api/payments
{
  "amount": 29.99,
  "currency": "USD",
  "payment_method": "PAYPAL"
}

// 2. PayPal SDK 사용
paypal.Buttons({
  createOrder: (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: '29.99',
          currency_code: 'USD'
        }
      }]
    });
  },
  onApprove: async (data, actions) => {
    const order = await actions.order.capture();

    // 백엔드에 결제 완료 알림
    await fetch('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({
        orderId: data.orderID,
        paymentId: order.id
      })
    });
  }
}).render('#paypal-button-container');
```

## 🎨 접근성 (Accessibility) 고려사항

### 1. 키보드 접근성
- ✅ `Escape` 키로 모달 닫기
- ✅ `Tab` 키로 요소 간 이동
- ✅ 모든 버튼 포커스 가능

### 2. 스크린 리더 지원
- ✅ `role="dialog"`, `aria-modal="true"`
- ✅ `aria-labelledby`로 제목 연결
- ✅ `aria-label`로 버튼 설명
- ✅ 에러 메시지 `role="alert"`

### 3. 시각적 피드백
- ✅ 포커스 상태 표시 (focus ring)
- ✅ 결제 수단별 고유 색상 및 아이콘
- ✅ 로딩 상태 스피너
- ✅ 성공/실패 명확한 시각적 피드백

### 4. 사용자 경험
- ✅ 결제 처리 중 모달 닫기 방지
- ✅ Body 스크롤 방지
- ✅ 모달 열림 시 상태 초기화
- ✅ 에러 발생 시 재시도 가능

## 🔐 보안 고려사항

### 현재 구현된 보안 기능
1. ✅ **HTTPS 필수**: 모든 결제는 HTTPS에서만 가능
2. ✅ **민감 정보 비노출**: 카드 정보는 각 결제사 SDK에서 처리
3. ✅ **결제 금액 검증**: 백엔드에서 금액 재검증 필요

### 추가 구현 필요 사항
- ⚠️ **CSRF 토큰**: API 요청 시 CSRF 토큰 추가
- ⚠️ **재시도 공격 방지**: Rate Limiting 적용
- ⚠️ **금액 위변조 방지**: 백엔드에서 금액 재검증
- ⚠️ **웹훅 서명 검증**: 각 결제사 웹훅 서명 검증

## 🔧 백엔드 구현 필요 사항

### 1. 결제 요청 API

```typescript
// POST /api/payments
export async function requestPayment(req, res) {
  const { amount, currency, payment_method, user_type, metadata } = req.body;

  try {
    // 1. 결제 정보 검증
    if (amount <= 0) {
      return res.status(400).json({ error: '유효하지 않은 금액입니다.' });
    }

    // 2. 데이터베이스에 결제 정보 저장
    const payment = await db.payments.create({
      user_id: req.user.id,
      amount,
      currency,
      payment_method,
      user_type,
      status: 'PENDING',
      metadata,
    });

    // 3. 결제 응답
    res.json({
      success: true,
      data: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 2. 토스페이먼츠 승인 API

```typescript
// POST /api/payments/confirm
import axios from 'axios';

export async function confirmTossPayment(req, res) {
  const { orderId, amount, paymentKey } = req.body;

  try {
    // 1. 토스페이먼츠 승인 요청
    const response = await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        orderId,
        amount,
        paymentKey,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.TOSS_SECRET_KEY + ':'
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 2. 데이터베이스 업데이트
    await db.payments.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        external_payment_id: paymentKey,
        approved_at: new Date(),
      },
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 3. 카카오페이 준비 API

```typescript
// POST /api/payments/kakao/ready
import axios from 'axios';

export async function prepareKakaoPay(req, res) {
  const { amount, productName } = req.body;

  try {
    const response = await axios.post(
      'https://kapi.kakao.com/v1/payment/ready',
      {
        cid: 'TC0ONETIME',
        partner_order_id: `ORDER_${Date.now()}`,
        partner_user_id: req.user.id,
        item_name: productName,
        quantity: 1,
        total_amount: amount,
        tax_free_amount: 0,
        approval_url: `${process.env.BASE_URL}/payment/kakao/success`,
        cancel_url: `${process.env.BASE_URL}/payment/kakao/cancel`,
        fail_url: `${process.env.BASE_URL}/payment/kakao/fail`,
      },
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 4. PayPal 결제 생성 API

```typescript
// POST /api/payments/paypal/create
import paypal from '@paypal/checkout-server-sdk';

export async function createPayPalOrder(req, res) {
  const { amount, currency } = req.body;

  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString(),
        },
      }],
    });

    const order = await paypalClient.execute(request);

    res.json({ success: true, orderID: order.result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## 🚀 추후 확장 시 고려사항

### 1. 구독 결제 (Recurring Payments)
```typescript
interface SubscriptionConfig {
  planId: string;
  interval: 'month' | 'year';
  trialDays?: number;
}

// 토스페이먼츠 빌링키 발급
// 카카오페이 정기결제
// PayPal Subscription
```

### 2. 할인 쿠폰 시스템
```typescript
interface CouponConfig {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
}

// 쿠폰 적용 로직
const finalAmount = applyCoupon(originalAmount, coupon);
```

### 3. 포인트/크레딧 사용
```typescript
interface PointUsage {
  availablePoints: number;
  pointsToUse: number;
  finalAmount: number;
}

// UI에 포인트 입력 필드 추가
// 백엔드에서 포인트 차감 및 결제 금액 계산
```

### 4. 결제 내역 조회
```typescript
// 사용자별 결제 내역
GET /api/payments/history?page=1&size=20

// 특정 결제 상세 조회
GET /api/payments/:paymentId

// 영수증 다운로드
GET /api/payments/:paymentId/receipt
```

### 5. 환불 처리
```typescript
// 환불 요청
POST /api/payments/:paymentId/refund
{
  "amount": 10000,  // 부분 환불 가능
  "reason": "단순 변심"
}

// 각 결제사별 환불 API 호출
// - 토스: POST /v1/payments/{paymentKey}/cancel
// - 카카오: POST /v1/payment/cancel
// - PayPal: POST /v2/payments/captures/{capture_id}/refund
```

### 6. 웹훅 처리
```typescript
// 토스페이먼츠 웹훅
POST /api/webhooks/toss

// 카카오페이 웹훅
POST /api/webhooks/kakao

// PayPal 웹훅
POST /api/webhooks/paypal

// 웹훅으로 결제 상태 업데이트
// - 결제 성공/실패
// - 환불 완료
// - 정기결제 갱신
```

### 7. 다국어 지원
```typescript
import { useTranslation } from 'react-i18next';

function PaymentModal() {
  const { t } = useTranslation();
  return <h2>{t('payment.title')}</h2>;
}
```

### 8. 결제 분석
```typescript
// Google Analytics 이벤트 추적
trackEvent('payment_initiated', { product, amount });
trackEvent('payment_success', { paymentId, method });
trackEvent('payment_failed', { error, method });
```

### 9. 저장된 카드 관리
```typescript
// 토스페이먼츠 빌링키 저장
// 카드 정보 토큰화
// 사용자별 저장된 결제 수단 관리
```

### 10. 테스트 모드
```typescript
// 환경변수로 테스트/프로덕션 모드 분리
const isTes tMode = process.env.NODE_ENV === 'development';

// 테스트 모드에서는 실제 결제 없이 성공 처리
if (isTestMode) {
  setTimeout(() => onSuccess(mockPaymentId), 1000);
  return;
}
```

## 📚 참고 자료

- [토스페이먼츠 개발자 문서](https://docs.tosspayments.com/)
- [카카오페이 개발자 가이드](https://developers.kakao.com/docs/latest/ko/kakaopay/common)
- [PayPal Developer Documentation](https://developer.paypal.com/home)

## 🧪 테스트 정보

### 토스페이먼츠 테스트 카드
- 카드 번호: `4242 4242 4242 4242`
- CVC: 아무 3자리
- 유효기간: 미래의 아무 날짜

### 카카오페이 테스트
- Sandbox 환경: `https://sandbox-kapi.kakao.com`
- 테스트 CID: `TC0ONETIME`

### PayPal 테스트
- Sandbox 계정 생성: [PayPal Developer](https://developer.paypal.com/)
- 테스트 카드 정보 확인

## ✅ 배포 체크리스트

- [ ] 환경 변수 설정 (API 키, Secret Key)
- [ ] HTTPS 적용
- [ ] 백엔드 결제 API 구현
- [ ] 웹훅 엔드포인트 설정
- [ ] 에러 로깅 시스템 구축
- [ ] 결제 테스트 (성공/실패 시나리오)
- [ ] 환불 정책 및 UI 구현
- [ ] 접근성 테스트
- [ ] 다양한 브라우저/디바이스 테스트
- [ ] 결제 데이터 백업 시스템

## 💡 주요 특징

1. **3가지 결제 수단 지원**: 토스페이먼츠, 카카오페이, PayPal
2. **완전한 접근성**: 키보드, 스크린 리더, ARIA 속성
3. **사용자 친화적**: 직관적인 UI, 명확한 피드백
4. **확장 가능한 구조**: 새로운 결제 수단 추가 용이
5. **타입 안전성**: TypeScript로 안전한 타입 체크
6. **반응형 디자인**: 모바일/데스크톱 모두 지원
