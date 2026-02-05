# PaymentRequestDto toPaymentBuilder 메서드 수정 가이드

## 변경 사항

`PaymentRequestDto`의 `toPaymentBuilder` 메서드에서 파라미터로 받던 `tier` 대신 DTO의 `this.tier`를 사용하도록 수정해야 합니다.

## 수정 전 코드

```java
public Payment.PaymentBuilder toPaymentBuilder(User user, UserTier tier, BigDecimal convertedAmount, BigDecimal usedPointAmount) {
    return Payment.builder()
            .user(user)
            .amount(convertedAmount)
            .currency(this.currency)
            .paymentMethod(this.paymentMethod)
            .userType(this.userType)
            .tier(tier)  // 파라미터 tier 사용
            .status(PaymentStatus.PENDING)
            .usedPointAmount(usedPointAmount)
            .metadata(this.metadata);
}
```

## 수정 후 코드

```java
public Payment.PaymentBuilder toPaymentBuilder(User user, BigDecimal convertedAmount, BigDecimal usedPointAmount) {
    return Payment.builder()
            .user(user)
            .amount(convertedAmount)
            .currency(this.currency)
            .paymentMethod(this.paymentMethod)
            .userType(this.userType)
            .tier(this.tier)  // DTO의 tier 사용
            .status(PaymentStatus.PENDING)
            .usedPointAmount(usedPointAmount)
            .metadata(this.metadata);
}
```

## 주요 변경 사항

1. **메서드 시그니처 변경**: `UserTier tier` 파라미터 제거
2. **메서드 내부 변경**: `.tier(tier)` → `.tier(this.tier)`

## 영향받는 코드

이 메서드를 호출하는 모든 곳에서 `tier` 파라미터를 제거해야 합니다.

### 수정 전 호출 예시
```java
Payment payment = paymentRequestDto.toPaymentBuilder(user, userTier, convertedAmount, usedPointAmount)
    .build();
```

### 수정 후 호출 예시
```java
Payment payment = paymentRequestDto.toPaymentBuilder(user, convertedAmount, usedPointAmount)
    .build();
```

## 주의사항

- `PaymentRequestDto`에 `tier` 필드가 `@NotNull`로 설정되어 있으므로, DTO 생성 시 반드시 `tier` 값을 포함해야 합니다.
- 프론트엔드에서도 `tier` 필드를 필수로 전송하도록 수정되었습니다.

