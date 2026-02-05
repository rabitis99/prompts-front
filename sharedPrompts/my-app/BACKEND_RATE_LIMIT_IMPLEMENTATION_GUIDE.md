# 백엔드 RateLimit 구현 가이드

프론트엔드와의 효율적인 협업을 위한 백엔드 RateLimit 구현 가이드입니다.

## 빠른 시작 (최소 구현)

가장 빠르게 구현하려면 다음 3가지 헤더만 추가하세요:

```java
// Spring Boot 예시
response.setHeader("X-RateLimit-Limit", "100");
response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
response.setHeader("X-RateLimit-Reset", String.valueOf(resetTimestamp));
```

## 구현 예시

### 1. Spring Boot (Java)

```java
@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                           HttpServletResponse response, 
                           Object handler) {
        // RateLimit 체크 로직
        RateLimitInfo info = rateLimitService.checkRateLimit(request);
        
        // 헤더 추가
        response.setHeader("X-RateLimit-Limit", String.valueOf(info.getLimit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(info.getRemaining()));
        response.setHeader("X-RateLimit-Reset", String.valueOf(info.getResetTimestamp()));
        
        if (info.isExceeded()) {
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(info.getRetryAfterSeconds()));
            return false;
        }
        
        return true;
    }
}
```

### 2. Express.js (Node.js)

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 100, // 최대 100건
  standardHeaders: true, // X-RateLimit-* 헤더 자동 추가
  legacyHeaders: false,
  handler: (req, res) => {
    const resetTime = Math.floor(Date.now() / 1000) + 60;
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', resetTime);
    res.setHeader('Retry-After', '60');
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: '요청이 너무 많습니다. 60초 후에 다시 시도해주세요.'
      }
    });
  }
});

app.use('/api', limiter);
```

### 3. Django (Python)

```python
from django.http import JsonResponse
from django.utils import timezone
import time

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # RateLimit 체크
        limit_info = check_rate_limit(request)
        
        response = self.get_response(request)
        
        # 헤더 추가
        response['X-RateLimit-Limit'] = str(limit_info['limit'])
        response['X-RateLimit-Remaining'] = str(limit_info['remaining'])
        response['X-RateLimit-Reset'] = str(int(limit_info['reset_timestamp']))
        
        if limit_info['exceeded']:
            response.status_code = 429
            response['Retry-After'] = str(limit_info['retry_after'])
            return JsonResponse({
                'error': {
                    'code': 'RATE_LIMIT_EXCEEDED',
                    'message': '요청이 너무 많습니다.'
                }
            }, status=429)
        
        return response
```

## 헤더 값 계산 방법

### X-RateLimit-Limit
- 시간 윈도우당 최대 요청 수
- 예: `100` (60초에 100건)

### X-RateLimit-Remaining
- 현재 윈도우에서 남은 요청 수
- 계산: `limit - current_count`
- 예: `95` (100개 중 95개 남음)

### X-RateLimit-Reset
- 윈도우가 리셋되는 시간 (Unix timestamp, 초 단위)
- Fixed Window: 다음 윈도우 시작 시간
- Sliding Window: 가장 오래된 요청 시간 + 윈도우 시간
- 예: `1633024800`

### Retry-After (429 에러 시만)
- 재시도 가능한 시간까지의 초 수
- 숫자 형식 권장: `60`
- HTTP-date 형식도 가능: `Wed, 21 Oct 2024 07:28:00 GMT`

## 엔드포인트별 RateLimit 구현

```java
// Spring Boot 예시
@Configuration
public class RateLimitConfig {
    
    @Bean
    public Map<String, RateLimitPolicy> endpointPolicies() {
        Map<String, RateLimitPolicy> policies = new HashMap<>();
        
        // 전역 정책
        policies.put("default", new RateLimitPolicy(100, 60));
        
        // 엔드포인트별 정책
        policies.put("/prompts", new RateLimitPolicy(200, 60));
        policies.put("/auth/login", new RateLimitPolicy(5, 60));
        policies.put("/auth/refresh", new RateLimitPolicy(10, 60));
        
        return policies;
    }
}
```

## 테스트 방법

### 1. 정상 응답 테스트

```bash
curl -i http://localhost:8080/api/prompts

# 응답 헤더 확인:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 1633024800
```

### 2. 429 에러 테스트

```bash
# RateLimit 초과 시뮬레이션
for i in {1..101}; do
  curl -i http://localhost:8080/api/prompts
done

# 마지막 응답:
# HTTP/1.1 429 Too Many Requests
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 0
# X-RateLimit-Reset: 1633024800
# Retry-After: 60
```

## 주의사항

1. **헤더 이름 대소문자**: HTTP 헤더는 대소문자를 구분하지 않지만, 일관성을 위해 `X-RateLimit-*` 형식 권장
2. **타임스탬프 형식**: `X-RateLimit-Reset`은 Unix timestamp (초 단위) 사용
3. **Retry-After 계산**: 정확한 재시도 시간 제공 (윈도우 리셋 시간 기준)
4. **엔드포인트별 정책**: 엔드포인트마다 다른 헤더 값 제공 가능

## 프론트엔드와의 협업

프론트엔드는 백엔드에서 제공하는 헤더를 자동으로 파싱하여:
- RateLimit 추적기를 동기화
- 429 에러 시 자동 재시도
- 사용자에게 적절한 알림 표시

**백엔드는 헤더만 제공하면 프론트엔드가 자동으로 처리합니다!**

