# 데이터베이스 락 타임아웃 문제 해결 가이드

## 🔴 문제 상황

결제 승인 후 포인트 적립 과정에서 다음과 같은 오류가 발생합니다:

```
Lock wait timeout exceeded; try restarting transaction
```

**발생 위치:**
- `PointServiceImpl.doAddPointsDirectly` → `points` 테이블 INSERT 시
- `PaymentPostProcessService.processPaymentSuccessAfterCommit` 호출 중
- `PaymentServiceImpl.confirmPayment` → 후처리 단계

## 🔍 원인 분석

### 1. 동시성 문제
- 동일한 사용자에 대한 여러 결제 승인 요청이 동시에 발생
- 포인트 적립 시 사용자 잔액 업데이트를 위한 락 경합
- ShedLock으로 분산 락을 사용하지만, DB 레벨 락과 충돌 가능

### 2. 트랜잭션 범위 문제
- `processPaymentSuccessAfterCommit`이 별도 트랜잭션에서 실행
- 메인 트랜잭션이 완료되기 전에 후처리 트랜잭션이 시작되어 락 대기
- 긴 트랜잭션으로 인한 락 홀드 시간 증가

### 3. 락 전략 부재
- 사용자 잔액 조회/업데이트 시 명시적 락 미사용
- `SELECT FOR UPDATE` 또는 비관적 락 미적용
- 인덱스 부재로 인한 테이블 락 가능성

## ✅ 해결 방안

### 방안 1: 비관적 락 적용 (권장)

#### 1.1 PointServiceImpl 수정

```java
@Service
@Transactional
public class PointServiceImpl implements PointService {
    
    @Autowired
    private PointRepository pointRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * 포인트 적립 (비관적 락 적용)
     */
    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void accumulatePoints(Long userId, Long paymentId, BigDecimal amount) {
        // 사용자 잔액 조회 시 비관적 락 적용
        User user = userRepository.findByIdWithLock(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
        
        // 최신 잔액 계산
        BigDecimal currentBalance = calculateCurrentBalance(userId);
        BigDecimal newBalance = currentBalance.add(amount);
        
        // 포인트 적립 기록 생성
        Point point = Point.builder()
            .userId(userId)
            .paymentId(paymentId)
            .amount(amount)
            .balance(newBalance)
            .type(PointType.EARNED)
            .description("결제 적립")
            .build();
        
        pointRepository.save(point);
    }
    
    /**
     * 포인트 직접 추가 (락 적용)
     */
    private void doAddPointsDirectly(Long userId, BigDecimal amount, String description) {
        // 비관적 락으로 사용자 조회
        User user = userRepository.findByIdWithLock(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
        
        // 최신 잔액 계산
        BigDecimal currentBalance = calculateCurrentBalance(userId);
        BigDecimal newBalance = currentBalance.add(amount);
        
        Point point = Point.builder()
            .userId(userId)
            .amount(amount)
            .balance(newBalance)
            .type(PointType.EARNED)
            .description(description)
            .build();
        
        pointRepository.save(point);
    }
}
```

#### 1.2 UserRepository에 락 메서드 추가

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * 비관적 락으로 사용자 조회
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.id = :userId")
    Optional<User> findByIdWithLock(@Param("userId") Long userId);
}
```

#### 1.3 PointRepository에 락 메서드 추가

```java
@Repository
public interface PointRepository extends JpaRepository<Point, Long> {
    
    /**
     * 사용자의 최신 포인트 잔액 조회 (락 적용)
     */
    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT p FROM Point p WHERE p.userId = :userId ORDER BY p.createdAt DESC")
    List<Point> findLatestByUserIdWithLock(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * 사용자별 포인트 합계 조회 (락 적용)
     */
    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Point p WHERE p.userId = :userId AND p.type = 'EARNED'")
    BigDecimal sumEarnedPointsByUserId(@Param("userId") Long userId);
}
```

### 방안 2: 트랜잭션 분리 및 재시도 로직

#### 2.1 PaymentPostProcessService 수정

```java
@Service
public class PaymentPostProcessService {
    
    @Autowired
    private PointService pointService;
    
    @Autowired
    private TransactionTemplate transactionTemplate;
    
    /**
     * 결제 승인 후 후처리 (별도 트랜잭션, 재시도 로직)
     */
    public void processPaymentSuccessAfterCommit(Long paymentId, Long userId, BigDecimal amount) {
        // 재시도 로직 적용
        RetryTemplate retryTemplate = new RetryTemplate();
        retryTemplate.setRetryPolicy(new SimpleRetryPolicy(3)); // 최대 3회 재시도
        retryTemplate.setBackOffPolicy(new FixedBackOffPolicy()); // 즉시 재시도
        
        retryTemplate.execute(context -> {
            transactionTemplate.execute(status -> {
                try {
                    // 포인트 적립
                    pointService.accumulatePoints(userId, paymentId, amount);
                    return null;
                } catch (PessimisticLockingFailureException e) {
                    // 락 타임아웃 시 재시도
                    throw new RetryableException("포인트 적립 실패, 재시도 필요", e);
                }
            });
            return null;
        });
    }
}
```

### 방안 3: 비동기 처리 및 큐 사용

#### 3.1 포인트 적립을 비동기로 처리

```java
@Service
public class PaymentPostProcessService {
    
    @Autowired
    private PointService pointService;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    /**
     * 결제 승인 후 후처리 (비동기 이벤트 발행)
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void processPaymentSuccessAfterCommit(PaymentConfirmedEvent event) {
        // 비동기로 포인트 적립 처리
        eventPublisher.publishEvent(new PointAccumulationEvent(
            event.getPaymentId(),
            event.getUserId(),
            event.getAmount()
        ));
    }
}

/**
 * 포인트 적립 이벤트
 */
@Getter
@AllArgsConstructor
public class PointAccumulationEvent {
    private Long paymentId;
    private Long userId;
    private BigDecimal amount;
}

/**
 * 포인트 적립 이벤트 리스너
 */
@Component
@Slf4j
public class PointAccumulationEventListener {
    
    @Autowired
    private PointService pointService;
    
    @Async
    @TransactionalEventListener
    public void handlePointAccumulation(PointAccumulationEvent event) {
        try {
            pointService.accumulatePoints(
                event.getUserId(),
                event.getPaymentId(),
                event.getAmount()
            );
        } catch (Exception e) {
            log.error("포인트 적립 실패: paymentId={}, userId={}", 
                event.getPaymentId(), event.getUserId(), e);
            // 실패 시 재시도 큐에 추가하거나 알림 발송
        }
    }
}
```

### 방안 4: 데이터베이스 설정 최적화

#### 4.1 MySQL 설정 조정

```properties
# application.properties 또는 application.yml

# 락 대기 시간 증가 (기본값: 50초)
spring.datasource.hikari.connection-timeout=10000
spring.datasource.hikari.maximum-pool-size=20

# 트랜잭션 타임아웃 설정
spring.transaction.default-timeout=30

# JPA 락 타임아웃 설정
spring.jpa.properties.javax.persistence.lock.timeout=10000
```

#### 4.2 MySQL 서버 설정

```sql
-- 락 대기 시간 증가 (초 단위)
SET GLOBAL innodb_lock_wait_timeout = 120;

-- 또는 my.cnf에 추가
[mysqld]
innodb_lock_wait_timeout = 120
```

### 방안 5: 인덱스 최적화

#### 5.1 포인트 테이블 인덱스 추가

```sql
-- 사용자별 포인트 조회 성능 향상
CREATE INDEX idx_points_user_id_created_at ON points(user_id, created_at DESC);

-- 결제별 포인트 조회
CREATE INDEX idx_points_payment_id ON points(payment_id);

-- 만료되지 않은 포인트 조회
CREATE INDEX idx_points_user_expired ON points(user_id, expired, expired_at);
```

## 🎯 권장 구현 순서

1. **즉시 적용 (단기)**
   - ✅ 비관적 락 적용 (방안 1)
   - ✅ 인덱스 추가 (방안 5)
   - ✅ MySQL 락 타임아웃 설정 조정 (방안 4)

2. **중기 개선**
   - ✅ 재시도 로직 추가 (방안 2)
   - ✅ 트랜잭션 분리 최적화

3. **장기 개선**
   - ✅ 비동기 처리 및 이벤트 기반 아키텍처 (방안 3)
   - ✅ 메시지 큐 도입 (RabbitMQ, Kafka 등)

## 📊 모니터링 및 로깅

### 로깅 추가

```java
@Slf4j
@Service
public class PointServiceImpl implements PointService {
    
    @Override
    public void accumulatePoints(Long userId, Long paymentId, BigDecimal amount) {
        long startTime = System.currentTimeMillis();
        try {
            // 포인트 적립 로직
            log.info("포인트 적립 시작: userId={}, paymentId={}, amount={}", 
                userId, paymentId, amount);
            
            // ... 적립 로직 ...
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("포인트 적립 완료: userId={}, paymentId={}, duration={}ms", 
                userId, paymentId, duration);
        } catch (PessimisticLockingFailureException e) {
            long duration = System.currentTimeMillis() - startTime;
            log.warn("포인트 적립 락 타임아웃: userId={}, paymentId={}, duration={}ms", 
                userId, paymentId, duration, e);
            throw e;
        }
    }
}
```

### 메트릭 수집

```java
@Component
public class PointMetrics {
    
    private final MeterRegistry meterRegistry;
    private final Counter lockTimeoutCounter;
    private final Timer pointAccumulationTimer;
    
    public PointMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.lockTimeoutCounter = Counter.builder("point.accumulation.lock.timeout")
            .description("포인트 적립 락 타임아웃 횟수")
            .register(meterRegistry);
        this.pointAccumulationTimer = Timer.builder("point.accumulation.duration")
            .description("포인트 적립 소요 시간")
            .register(meterRegistry);
    }
    
    public void recordLockTimeout() {
        lockTimeoutCounter.increment();
    }
    
    public Timer.Sample startTimer() {
        return Timer.start(meterRegistry);
    }
}
```

## 🔧 테스트 방법

### 동시성 테스트

```java
@Test
public void testConcurrentPointAccumulation() throws InterruptedException {
    Long userId = 1L;
    int threadCount = 10;
    ExecutorService executor = Executors.newFixedThreadPool(threadCount);
    CountDownLatch latch = new CountDownLatch(threadCount);
    
    for (int i = 0; i < threadCount; i++) {
        executor.submit(() -> {
            try {
                pointService.accumulatePoints(userId, (long) i, BigDecimal.valueOf(1000));
            } finally {
                latch.countDown();
            }
        });
    }
    
    latch.await(30, TimeUnit.SECONDS);
    executor.shutdown();
    
    // 최종 잔액 검증
    BigDecimal finalBalance = pointService.getBalance(userId);
    assertEquals(BigDecimal.valueOf(10000), finalBalance);
}
```

## 📝 체크리스트

- [ ] `UserRepository.findByIdWithLock()` 메서드 추가
- [ ] `PointRepository`에 락 메서드 추가
- [ ] `PointServiceImpl`에 비관적 락 적용
- [ ] MySQL `innodb_lock_wait_timeout` 설정 조정
- [ ] 포인트 테이블 인덱스 추가
- [ ] 재시도 로직 구현
- [ ] 로깅 및 모니터링 추가
- [ ] 동시성 테스트 수행

## ⚠️ 주의사항

1. **락 범위 최소화**: 필요한 최소한의 데이터만 락
2. **데드락 방지**: 항상 동일한 순서로 락 획득
3. **타임아웃 설정**: 무한 대기 방지를 위한 타임아웃 필수
4. **성능 모니터링**: 락 경합이 성능에 미치는 영향 지속 모니터링
5. **트랜잭션 범위**: 트랜잭션 범위를 최소화하여 락 홀드 시간 단축


