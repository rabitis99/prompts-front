# 결제 사용 가이드

## 결제 플로우

### 1. 결제 모달 열기
`PaymentModal` 컴포넌트를 사용하여 결제 모달을 엽니다.

```tsx
import { useState } from 'react';
import { PaymentModal } from '@/features/payment/ui/PaymentModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>결제하기</button>
      
      <PaymentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productName="Premium Plan"
        amount={29900}
        currency="KRW"
        onPaymentSuccess={(paymentId) => {
          console.log('결제 성공:', paymentId);
          // 결제 성공 후 처리 로직
        }}
        onPaymentError={(error) => {
          console.error('결제 실패:', error);
          // 에러 처리 로직
        }}
      />
    </>
  );
}
```

### 2. 결제 수단 선택
모달에서 다음 결제 수단 중 하나를 선택합니다:
- **토스페이먼츠**: 카드 결제
- **카카오페이**: 카카오톡 간편결제
- **PayPal**: 글로벌 결제

### 3. 결제 정보 입력
선택한 결제 수단에 따라 필요한 정보를 입력합니다:
- **토스페이먼츠**: 이름, 이메일, 결제 유형 (개인/사업자)
- **카카오페이**: 자동으로 카카오페이 결제창으로 이동
- **PayPal**: PayPal 결제창에서 처리

### 4. 결제 처리
1. 백엔드에 결제 요청 (`POST /payments`)
2. 결제사 SDK로 결제창 호출
3. 사용자가 결제 완료
4. 결제 성공/실패 페이지로 리다이렉트

### 5. 결제 완료
- **성공**: `/payment/success` 페이지에서 결제 승인 처리
- **실패**: `/payment/fail` 페이지에서 에러 메시지 표시

## 결제 수단별 상세 플로우

### 토스페이먼츠
1. 결제 정보 입력 (이름, 이메일, 결제 유형)
2. "결제하기" 버튼 클릭
3. 백엔드에 결제 요청
4. 토스페이먼츠 결제창 열림
5. 결제 완료 후 `/payment/success`로 리다이렉트
6. URL 파라미터(`orderId`, `paymentKey`, `amount`)로 결제 승인

### 카카오페이
1. "카카오페이로 결제" 버튼 클릭
2. 백엔드에 결제 요청 (카카오페이 준비 API 호출)
3. 카카오페이 결제창으로 리다이렉트
4. 결제 완료 후 승인 URL로 리다이렉트
5. 백엔드에서 결제 승인 처리

### PayPal
1. PayPal 버튼 클릭
2. PayPal 결제창에서 결제 진행
3. 결제 완료 후 콜백 처리

## 환경 변수 설정

`.env` 파일에 다음 환경 변수를 설정해야 합니다:

```env
# 토스페이먼츠
VITE_TOSS_CLIENT_KEY=your_toss_client_key

# PayPal
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

## 라우터 설정

결제 성공/실패 페이지를 라우터에 추가해야 합니다:

```tsx
// App.tsx
<Route path="/payment/success" element={<PaymentSuccessPage />} />
<Route path="/payment/fail" element={<PaymentFailPage />} />
```

## 예제 코드

전체 예제는 `PaymentExample.tsx` 파일을 참고하세요.

