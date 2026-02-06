# 백엔드 Payment NullPointerException 수정 가이드

## 🚨 에러 내용

```
결제 준비 실패 (런타임 오류): paymentId=null, paymentMethod=KAKAO_PAY, 
error=Cannot invoke "java.lang.Long.longValue()" because the return value of 
"org.example.sharedprompts.domain.payment.domain.entity.Payment.getId()" is null
```

## 🔍 원인 분석

이 에러는 `PaymentProviderIntegrationService`에서 `Payment` 엔티티의 ID를 사용하려고 할 때 발생합니다.

**문제점:**
- `Payment` 엔티티가 데이터베이스에 저장되기 **전**에 `getId()`를 호출하고 있습니다
- JPA에서 엔티티는 `save()` 또는 `persist()` 후에야 ID가 생성됩니다
- 저장되지 않은 엔티티의 `getId()`는 `null`을 반환합니다
- `null.longValue()`를 호출하려고 하면 `NullPointerException`이 발생합니다

## ✅ 해결 방법

### 1. Payment 엔티티를 먼저 저장하기

`PaymentProviderIntegrationService`의 `preparePayment` 메서드에서 다음 순서를 지켜야 합니다:

1. **Payment 엔티티 생성**
2. **Payment 엔티티 저장** (ID 생성)
3. **저장된 Payment의 ID 사용**

#### ❌ 잘못된 코드 예시

```java
@Service
public class PaymentProviderIntegrationService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    public PaymentResponse preparePayment(PaymentRequest request) {
        // Payment 엔티티 생성
        Payment payment = Payment.builder()
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .paymentMethod(PaymentMethod.KAKAO_PAY)
            .status(PaymentStatus.PENDING)
            .build();
        
        // ❌ 잘못됨: 저장하기 전에 ID를 사용하려고 함
        Long paymentId = payment.getId().longValue(); // NullPointerException!
        
        // 카카오페이 준비 API 호출
        KakaoPayReadyRequest readyRequest = KakaoPayReadyRequest.builder()
            .partner_order_id(paymentId.toString()) // paymentId가 null
            .build();
        
        // ...
    }
}
```

#### ✅ 올바른 코드 예시

```java
@Service
public class PaymentProviderIntegrationService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Transactional
    public PaymentResponse preparePayment(PaymentRequest request) {
        // 1. Payment 엔티티 생성
        Payment payment = Payment.builder()
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .paymentMethod(PaymentMethod.KAKAO_PAY)
            .status(PaymentStatus.PENDING)
            .userId(getCurrentUserId())
            .build();
        
        // 2. Payment 엔티티 저장 (ID 생성됨)
        payment = paymentRepository.save(payment);
        
        // 3. 저장된 Payment의 ID 사용 (이제 null이 아님)
        Long paymentId = payment.getId();
        
        // 4. 카카오페이 준비 API 호출
        KakaoPayReadyRequest readyRequest = KakaoPayReadyRequest.builder()
            .cid("TC0ONETIME")
            .partner_order_id(paymentId.toString()) // ✅ 정상 작동
            .partner_user_id(getCurrentUserId().toString())
            .item_name(extractProductName(request.getMetadata()))
            .quantity(1)
            .total_amount(request.getAmount())
            .tax_free_amount(0)
            .approval_url(buildApprovalUrl(paymentId, request.getAmount()))
            .cancel_url(buildCancelUrl())
            .fail_url(buildFailUrl())
            .build();
        
        KakaoPayReadyResponse readyResponse = kakaoPayService.ready(readyRequest);
        String tid = readyResponse.getTid();
        
        // 5. Payment 엔티티 업데이트 (tid 저장)
        // ⚠️ @Version 필드 고려: 변경 감지(Dirty Checking) 활용
        // @Transactional 내에서 엔티티 수정 시 자동 flush되므로 명시적 save() 불필요
        payment.setExternalPaymentId(tid);
        payment.setMetadata(buildMetadata(readyResponse));
        // save() 호출 불필요 - 트랜잭션 커밋 시 자동으로 저장됨
        
        // 6. 응답 반환
        return PaymentResponse.builder()
            .id(payment.getId())
            .amount(payment.getAmount())
            .currency(payment.getCurrency())
            .paymentMethod(payment.getPaymentMethod())
            .status(payment.getStatus())
            .externalPaymentId(tid)
            .metadata(buildMetadata(readyResponse))
            .build();
    }
    
    private String buildApprovalUrl(Long paymentId, Integer amount) {
        String baseUrl = environment.getProperty("payment.kakao.approval-url", 
            "https://yourdomain.com/payment/success");
        return String.format("%s?orderId=%d&amount=%d", baseUrl, paymentId, amount);
    }
}
```

### 2. @Transactional 어노테이션 확인

`preparePayment` 메서드에 `@Transactional` 어노테이션이 있는지 확인하세요. 이는 엔티티가 제대로 저장되고 ID가 생성되도록 보장합니다.

**⚠️ 중요: @Version 필드가 있는 경우**
- `@Transactional` 내에서 엔티티를 수정하면 변경 감지(Dirty Checking)가 자동으로 작동합니다
- 명시적인 `save()` 호출이 불필요하며, 여러 번 `save()`를 호출하면 버전 충돌이 발생할 수 있습니다
- ID가 필요한 시점에만 한 번 저장하고, 이후 업데이트는 변경 감지를 활용하세요

```java
@Transactional
public PaymentResponse preparePayment(PaymentRequest request) {
    // 1. Payment 저장 (ID 생성 필요)
    Payment payment = paymentRepository.save(createPayment(request));
    
    // 2. 카카오페이 API 호출 후 업데이트
    payment.setExternalPaymentId(tid);
    payment.setMetadata(metadata);
    // save() 호출 불필요 - 변경 감지로 자동 저장됨
    
    return buildResponse(payment);
}
```

### 3. Payment 엔티티 ID 생성 전략 확인

`Payment` 엔티티의 ID 생성 전략이 올바르게 설정되어 있는지 확인하세요:

```java
@Entity
@Table(name = "payments")
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 또는 AUTO, SEQUENCE 등
    private Long id;
    
    // ...
}
```

### 4. Null 체크 추가 (방어적 프로그래밍)

추가적인 안전장치로 null 체크를 추가할 수 있습니다:

```java
@Transactional
public PaymentResponse preparePayment(PaymentRequest request) {
    Payment payment = createPayment(request);
    payment = paymentRepository.save(payment);
    
    // 방어적 null 체크
    if (payment.getId() == null) {
        throw new IllegalStateException("Payment ID가 생성되지 않았습니다. " +
            "Payment 엔티티가 제대로 저장되지 않았을 수 있습니다.");
    }
    
    Long paymentId = payment.getId();
    // ...
}
```

## 🔧 수정 체크리스트

백엔드 개발자가 확인해야 할 사항:

- [ ] `PaymentProviderIntegrationService.preparePayment()` 메서드에서 `Payment` 엔티티를 **저장하기 전**에 `getId()`를 호출하지 않는지 확인
- [ ] `paymentRepository.save(payment)` 호출 후에 `payment.getId()`를 사용하는지 확인
- [ ] `@Transactional` 어노테이션이 메서드에 적용되어 있는지 확인
- [ ] `Payment` 엔티티의 `@GeneratedValue` 전략이 올바르게 설정되어 있는지 확인
- [ ] 모든 결제 방법(KAKAO_PAY, TOSS, PAYPAL 등)에 대해 동일한 패턴을 적용했는지 확인

## 📝 수정 예시 (전체 흐름)

```java
@Service
@Slf4j
public class PaymentProviderIntegrationService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private KakaoPayService kakaoPayService;
    
    @Autowired
    private Environment environment;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Transactional
    public PaymentResponse preparePayment(PaymentRequest request) {
        try {
            log.info("결제 준비 시작: paymentMethod={}, amount={}", 
                request.getPaymentMethod(), request.getAmount());
            
            // 1. Payment 엔티티 생성 및 저장
            Payment payment = createAndSavePayment(request);
            
            // 2. 저장된 Payment의 ID 확인
            Long paymentId = payment.getId();
            if (paymentId == null) {
                throw new IllegalStateException("Payment ID가 생성되지 않았습니다.");
            }
            
            log.info("Payment 생성 완료: paymentId={}", paymentId);
            
            // 3. 결제 방법별 처리
            PaymentResponse response;
            switch (request.getPaymentMethod()) {
                case KAKAO_PAY:
                    response = prepareKakaoPay(payment, request);
                    break;
                case TOSS:
                    response = prepareToss(payment, request);
                    break;
                case PAYPAL:
                    response = preparePayPal(payment, request);
                    break;
                default:
                    throw new IllegalArgumentException(
                        "지원하지 않는 결제 방법: " + request.getPaymentMethod());
            }
            
            log.info("결제 준비 완료: paymentId={}, paymentMethod={}", 
                paymentId, request.getPaymentMethod());
            
            return response;
            
        } catch (Exception e) {
            log.error("결제 준비 실패 (런타임 오류): paymentId={}, paymentMethod={}, error={}", 
                null, request.getPaymentMethod(), e.getMessage(), e);
            throw new PaymentPreparationException("결제 준비 중 오류가 발생했습니다.", e);
        }
    }
    
    private Payment createAndSavePayment(PaymentRequest request) {
        Payment payment = Payment.builder()
            .userId(getCurrentUserId())
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .paymentMethod(request.getPaymentMethod())
            .userType(request.getUserType())
            .status(PaymentStatus.PENDING)
            .metadata(request.getMetadata())
            .build();
        
        // ✅ 저장 후 반환 (ID 생성됨)
        return paymentRepository.save(payment);
    }
    
    private PaymentResponse prepareKakaoPay(Payment payment, PaymentRequest request) {
        Long paymentId = payment.getId(); // ✅ 이미 저장된 엔티티이므로 ID가 있음
        
        // 카카오페이 준비 API 호출
        KakaoPayReadyRequest readyRequest = KakaoPayReadyRequest.builder()
            .cid("TC0ONETIME")
            .partner_order_id(paymentId.toString())
            .partner_user_id(payment.getUserId().toString())
            .item_name(extractProductName(request.getMetadata()))
            .quantity(1)
            .total_amount(request.getAmount())
            .tax_free_amount(0)
            .approval_url(buildApprovalUrl(paymentId, request.getAmount()))
            .cancel_url(buildCancelUrl())
            .fail_url(buildFailUrl())
            .build();
        
        KakaoPayReadyResponse readyResponse = kakaoPayService.ready(readyRequest);
        String tid = readyResponse.getTid();
        
        // Payment 업데이트
        // ⚠️ @Version 필드 고려: 변경 감지 활용 (트랜잭션 내에서 자동 flush)
        payment.setExternalPaymentId(tid);
        payment.setMetadata(buildMetadata(readyResponse));
        // save() 호출 불필요 - @Transactional 내에서 엔티티 수정 시 자동으로 저장됨
        
        // 메타데이터 구성
        String metadata = buildMetadata(readyResponse);
        
        return PaymentResponse.builder()
            .id(payment.getId())
            .amount(payment.getAmount())
            .currency(payment.getCurrency())
            .paymentMethod(payment.getPaymentMethod())
            .status(payment.getStatus())
            .externalPaymentId(tid)
            .metadata(metadata)
            .build();
    }
    
    private String buildApprovalUrl(Long paymentId, Integer amount) {
        String baseUrl = environment.getProperty("payment.kakao.approval-url",
            "https://yourdomain.com/payment/success");
        return String.format("%s?orderId=%d&amount=%d", baseUrl, paymentId, amount);
    }
    
    private Long getCurrentUserId() {
        // SecurityContext에서 현재 사용자 ID 가져오기
        // ⚠️ 주의: 프로젝트의 인증 방식에 맞게 구현해야 합니다
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("인증되지 않은 사용자입니다.");
        }
        
        // 방법 1: CustomUserDetails를 사용하는 경우 (가장 일반적)
        // if (authentication.getPrincipal() instanceof CustomUserDetails) {
        //     CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        //     return userDetails.getId();
        // }
        
        // 방법 2: JWT 토큰에서 직접 추출하는 경우
        // if (authentication instanceof JwtAuthenticationToken) {
        //     Jwt jwt = ((JwtAuthenticationToken) authentication).getToken();
        //     return Long.parseLong(jwt.getClaim("userId"));
        // }
        
        // 방법 3: UserService를 통해 조회
        // String username = authentication.getName();
        // return userService.findByUsername(username).getId();
        
        // 임시 구현 (실제로는 위 방법 중 하나를 사용)
        throw new UnsupportedOperationException("getCurrentUserId() 메서드를 프로젝트에 맞게 구현해야 합니다.");
    }
    
    private String extractProductName(String metadata) {
        try {
            if (metadata == null || metadata.isEmpty()) {
                return "상품";
            }
            Map<String, Object> metadataMap = objectMapper.readValue(metadata, Map.class);
            return (String) metadataMap.getOrDefault("product_name", "상품");
        } catch (Exception e) {
            log.warn("메타데이터에서 상품명 추출 실패: {}", e.getMessage());
            return "상품";
        }
    }
    
    private String buildCancelUrl() {
        String baseUrl = environment.getProperty("payment.kakao.cancel-url",
            "https://yourdomain.com/payment/fail");
        return baseUrl;
    }
    
    private String buildFailUrl() {
        String baseUrl = environment.getProperty("payment.kakao.fail-url",
            "https://yourdomain.com/payment/fail");
        return baseUrl;
    }
    
    private String buildMetadata(KakaoPayReadyResponse readyResponse) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("next_redirect_pc_url", readyResponse.getNext_redirect_pc_url());
            metadata.put("next_redirect_mobile_url", readyResponse.getNext_redirect_mobile_url());
            metadata.put("next_redirect_app_url", readyResponse.getNext_redirect_app_url());
            metadata.put("tid", readyResponse.getTid());
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.error("메타데이터 구성 실패", e);
            return "{}";
        }
    }
}
```

## 🧪 테스트 방법

1. **단위 테스트 작성**
   ```java
   @Test
   void testPreparePayment_SavesPaymentBeforeUsingId() {
       PaymentRequest request = PaymentRequest.builder()
           .amount(10000)
           .currency("KRW")
           .paymentMethod(PaymentMethod.KAKAO_PAY)
           .build();
       
       PaymentResponse response = service.preparePayment(request);
       
       assertNotNull(response.getId());
       assertNotNull(response.getExternalPaymentId());
   }
   ```

2. **통합 테스트 실행**
   - 카카오페이 결제 요청 API 호출
   - 응답에서 `id` 필드가 null이 아닌지 확인
   - 로그에서 "Payment 생성 완료" 메시지 확인

## 🆘 추가 문제 해결

만약 위의 수정 후에도 문제가 발생한다면:

1. **데이터베이스 연결 확인**
   - `paymentRepository.save()`가 실제로 데이터베이스에 저장되는지 확인
   - 트랜잭션이 롤백되지 않는지 확인

2. **JPA 설정 확인**
   - `spring.jpa.hibernate.ddl-auto` 설정 확인
   - `Payment` 테이블이 제대로 생성되어 있는지 확인

3. **로깅 추가**
   ```java
   payment = paymentRepository.save(payment);
   log.debug("Payment 저장 후 ID: {}", payment.getId());
   ```

4. **디버거 사용**
   - `paymentRepository.save()` 호출 전후의 `payment` 객체 상태 확인
   - ID가 언제 생성되는지 추적

## ⚠️ 주의사항

### 코드 예시에서 누락된 부분

위의 코드 예시는 개념을 설명하기 위한 것이며, 실제 구현 시 다음 사항들을 확인해야 합니다:

1. **ObjectMapper 주입**
   - `@Autowired private ObjectMapper objectMapper;` 추가 필요
   - 또는 `new ObjectMapper()` 사용

2. **사용자 ID 추출 방법**
   - 프로젝트의 인증 방식에 맞게 `getCurrentUserId()` 메서드를 구현해야 합니다
   - JWT 토큰, 세션, 또는 커스텀 UserDetails 구현체를 사용할 수 있습니다

3. **누락된 메서드 구현**
   - `extractProductName()`: 메타데이터에서 상품명 추출
   - `buildCancelUrl()`: 취소 URL 구성
   - `buildFailUrl()`: 실패 URL 구성

4. **예외 처리**
   - `PaymentPreparationException` 커스텀 예외 클래스 필요
   - 또는 표준 예외 사용

5. **필요한 Import**
   ```java
   import org.springframework.transaction.annotation.Transactional;
   import org.springframework.core.env.Environment;
   import org.springframework.security.core.context.SecurityContextHolder;
   import org.springframework.security.core.Authentication;
   import com.fasterxml.jackson.databind.ObjectMapper;
   import lombok.extern.slf4j.Slf4j;
   ```

## 📚 참고 자료

- [Spring Data JPA - Entity Lifecycle](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.entity-persistence)
- [JPA @GeneratedValue 전략](https://www.baeldung.com/jpa-entity-generation-strategies)
- [Spring @Transactional](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction-declarative)

