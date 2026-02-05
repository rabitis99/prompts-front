# 결제 시스템 완전 구현 가이드

SDK 연동 코드 주석 해제 완료! 실제 결제가 가능하도록 설정하는 방법입니다.

## ✅ 완료된 작업

- ✅ 토스페이먼츠 SDK 연동 코드 활성화
- ✅ 카카오페이 API 연동 코드 활성화
- ✅ PayPal SDK 연동 코드 활성화
- ✅ 결제 성공/실패 콜백 페이지 생성

## 🚀 설정 방법

### 1. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 토스페이먼츠
VITE_TOSS_CLIENT_KEY=test_ck_PBal2vxj81l0P7pMKDYq3LAnGKWx

# PayPal
VITE_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID

# API URL
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. 라우터 설정

[src/App.tsx](src/App.tsx) 또는 라우터 설정 파일에 다음 라우트를 추가하세요:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaymentSuccessPage from '@/pages/payment/PaymentSuccessPage';
import PaymentFailPage from '@/pages/payment/PaymentFailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기존 라우트들 */}

        {/* 결제 콜백 라우트 - 반드시 추가! */}
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 3. 토스페이먼츠 설정

#### 클라이언트 키 발급

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/)에서 회원가입
2. **내 앱** → **새 앱 만들기**
3. **API 키** 탭에서 **클라이언트 키** 복사
4. `.env` 파일에 `VITE_TOSS_CLIENT_KEY`에 붙여넣기

**테스트 키 예시**:
```
VITE_TOSS_CLIENT_KEY=test_ck_PBal2vxj81l0P7pMKDYq3LAnGKWx
```

#### 테스트 카드 번호
- 카드 번호: `4242 4242 4242 4242`
- 유효기간: 미래의 아무 날짜 (예: `12/28`)
- CVC: 아무 3자리 숫자 (예: `123`)

### 4. PayPal 설정

#### Client ID 발급

1. [PayPal Developer](https://developer.paypal.com/dashboard/)에서 로그인
2. **My Apps & Credentials** → **Create App**
3. **Sandbox** 탭에서 **Client ID** 복사
4. `.env` 파일에 `VITE_PAYPAL_CLIENT_ID`에 붙여넣기

#### 테스트 계정
PayPal Sandbox 테스트 계정을 생성하여 테스트 결제를 진행할 수 있습니다.

### 5. 카카오페이 설정 (백엔드)

카카오페이는 **백엔드에서만** Admin Key를 사용합니다.

#### 백엔드 환경변수
```env
KAKAO_ADMIN_KEY=your_kakao_admin_key_here
```

#### 백엔드 API 구현 필요
카카오페이 결제를 위해 백엔드에서 다음 기능이 필요합니다:

```typescript
// 결제 준비 API (백엔드)
POST /v1/payment/ready
→ next_redirect_pc_url을 응답의 metadata에 포함

// 응답 예시
{
  "success": true,
  "data": {
    "id": 123,
    "amount": 29900,
    "metadata": "{\"next_redirect_pc_url\":\"https://online-pay.kakao.com/mockup/...\"}"
  }
}
```

---

## 🔄 결제 플로우

### 토스페이먼츠
```
1. 사용자가 폼 입력 → "결제하기" 클릭
2. 백엔드 API 호출 (POST /payments)
3. 토스페이먼츠 SDK 로드
4. 결제창 호출 (새 창)
5. 사용자가 결제 완료
6. /payment/success로 리다이렉트 (paymentKey, orderId, amount 포함)
7. PaymentSuccessPage에서 백엔드에 승인 요청
8. 승인 완료 → 결제 성공 화면
```

### 카카오페이
```
1. 사용자가 "카카오페이로 결제" 클릭
2. 백엔드 API 호출 (POST /payments)
3. 백엔드가 카카오페이 준비 API 호출
4. 백엔드가 next_redirect_pc_url을 metadata에 담아 응답
5. 프론트엔드가 카카오페이 결제창으로 리다이렉트
6. 사용자가 결제 완료
7. approval_url로 리다이렉트 (pg_token 포함)
8. 백엔드에서 승인 처리
```

### PayPal
```
1. 사용자가 PayPal 결제 수단 선택
2. 백엔드 API 호출 (POST /payments)
3. PayPal SDK가 자동 로드
4. PayPal 버튼 클릭 → PayPal 팝업
5. 사용자가 PayPal 계정으로 결제
6. onApprove 콜백 실행
7. 백엔드에 승인 요청
8. 승인 완료 → 결제 성공 화면
```

---

## 🧪 테스트 방법

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. 결제 모달 열기
```tsx
import { PaymentModal } from '@/features/payment/ui/PaymentModal';

<PaymentModal
  isOpen={true}
  onClose={() => {}}
  productName="Premium Plan"
  amount={29900}
  currency="KRW"
  onPaymentSuccess={(id) => console.log('성공:', id)}
  onPaymentError={(err) => console.error('실패:', err)}
/>
```

### 3. 결제 수단별 테스트

#### 토스페이먼츠
1. "토스페이먼츠" 선택
2. 이름, 이메일 입력
3. "결제하기" 클릭
4. 토스 결제창에서 테스트 카드 입력
5. 결제 완료 → `/payment/success`로 이동
6. 승인 완료 → 성공 화면

#### 카카오페이
1. "카카오페이" 선택
2. "카카오페이로 결제" 클릭
3. **백엔드가 next_redirect_pc_url을 반환해야 함**
4. 카카오페이 결제창으로 이동
5. 결제 완료 → approval_url로 리다이렉트

#### PayPal
1. "PayPal" 선택
2. PayPal 버튼 클릭
3. PayPal 팝업에서 Sandbox 계정으로 로그인
4. 결제 승인
5. 팝업 닫힘 → 성공 화면

---

## ⚠️ 주의사항

### 1. CORS 설정
백엔드에서 프론트엔드 도메인을 CORS에 추가해야 합니다:

```java
// Spring Boot 예시
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173") // Vite 개발 서버
                    .allowedMethods("GET", "POST", "PUT", "DELETE");
            }
        };
    }
}
```

### 2. 환경변수 확인
결제 전에 환경변수가 제대로 설정되었는지 확인:

```typescript
// 개발자 도구 콘솔에서 확인
console.log('토스 키:', import.meta.env.VITE_TOSS_CLIENT_KEY);
console.log('PayPal ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID);
```

환경변수가 `undefined`이면 다음을 확인:
- `.env` 파일이 프로젝트 루트에 있는지
- `VITE_` 접두사가 있는지
- 개발 서버를 재시작했는지

### 3. 백엔드 API 필수 구현
프론트엔드만으로는 결제가 불가능합니다. 백엔드에서 다음 API가 필수:

- `POST /api/payments` - 결제 요청
- `POST /api/payments/confirm` - 결제 승인
- 카카오페이의 경우: 준비 API에서 redirect URL 반환

---

## 🐛 문제 해결

### 토스페이먼츠 결제창이 안 열림
- 환경변수 `VITE_TOSS_CLIENT_KEY` 확인
- 브라우저 콘솔에서 에러 메시지 확인
- 네트워크 탭에서 `loadTossPayments` 로드 확인

### 카카오페이 리다이렉트 실패
- 백엔드 응답의 `metadata`에 `next_redirect_pc_url` 포함 확인
- 백엔드 로그에서 카카오페이 API 응답 확인

### PayPal 버튼이 안 보임
- 환경변수 `VITE_PAYPAL_CLIENT_ID` 확인
- 브라우저 콘솔에서 PayPal SDK 로드 에러 확인
- `@paypal/react-paypal-js` 패키지 설치 확인

### 결제 승인 실패 (successUrl 콜백)
- 라우터에 `/payment/success` 라우트 추가 확인
- 백엔드 `/api/payments/confirm` API 구현 확인
- 백엔드 로그에서 승인 API 에러 확인

---

## 📚 추가 자료

- [토스페이먼츠 개발 가이드](https://docs.tosspayments.com/)
- [카카오페이 API 문서](https://developers.kakao.com/docs/latest/ko/kakaopay/common)
- [PayPal Developer Docs](https://developer.paypal.com/home)

---

## ✅ 최종 체크리스트

배포 전 확인:

- [ ] `.env` 파일 생성 및 API 키 설정
- [ ] 라우터에 결제 콜백 페이지 추가 (`/payment/success`, `/payment/fail`)
- [ ] 백엔드 API 구현 (`/payments`, `/payments/confirm`)
- [ ] 백엔드 CORS 설정
- [ ] 토스페이먼츠 테스트 결제 성공
- [ ] PayPal 테스트 결제 성공
- [ ] 카카오페이 백엔드 연동 완료
- [ ] 프로덕션 환경에서 실제 API 키로 교체

---

모든 설정이 완료되면 **실제 결제가 가능**합니다! 🎉
