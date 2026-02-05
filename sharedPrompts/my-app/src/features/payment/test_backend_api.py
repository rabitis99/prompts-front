#!/usr/bin/env python3
"""
결제 API 백엔드 검증 스크립트

사용법:
    python test_backend_api.py

환경변수:
    API_BASE_URL: API 서버 주소 (기본값: http://localhost:8080/api)
    API_TOKEN: 인증 토큰 (필수)
"""

import os
import sys
import json
import requests
from typing import Dict, Any, Optional

# 색상 정의 (ANSI 코드)
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

# 설정
BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8080/api')
TOKEN = os.getenv('API_TOKEN', 'YOUR_ACCESS_TOKEN')

# 성공/실패 카운터
success_count = 0
fail_count = 0


def test_api(
    test_name: str,
    method: str,
    endpoint: str,
    data: Optional[Dict[str, Any]] = None,
    expected_status: int = 200,
    skip_auth: bool = False
) -> Optional[Dict[str, Any]]:
    """
    API 테스트 함수

    Args:
        test_name: 테스트 이름
        method: HTTP 메서드 (GET, POST, etc.)
        endpoint: API 엔드포인트
        data: 요청 데이터 (POST/PUT 등)
        expected_status: 예상 HTTP 상태 코드
        skip_auth: 인증 헤더 생략 여부

    Returns:
        응답 데이터 (JSON)
    """
    global success_count, fail_count

    print(f"{Colors.YELLOW}[테스트] {test_name}{Colors.NC}")

    headers = {
        "Content-Type": "application/json"
    }

    if not skip_auth:
        headers["Authorization"] = f"Bearer {TOKEN}"

    url = f"{BASE_URL}{endpoint}"

    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=10)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            print(f"{Colors.RED}❌ 지원하지 않는 HTTP 메서드: {method}{Colors.NC}\n")
            fail_count += 1
            return None

        # 상태 코드 확인
        if response.status_code == expected_status:
            print(f"{Colors.GREEN}✅ 통과{Colors.NC} (HTTP {response.status_code})")
            try:
                response_data = response.json()
                print(f"응답: {json.dumps(response_data, indent=2, ensure_ascii=False)}\n")
                success_count += 1
                return response_data
            except json.JSONDecodeError:
                print(f"응답: {response.text}\n")
                success_count += 1
                return None
        else:
            print(f"{Colors.RED}❌ 실패{Colors.NC} (예상: {expected_status}, 실제: {response.status_code})")
            try:
                error_data = response.json()
                print(f"응답: {json.dumps(error_data, indent=2, ensure_ascii=False)}\n")
            except json.JSONDecodeError:
                print(f"응답: {response.text}\n")
            fail_count += 1
            return None

    except requests.exceptions.ConnectionError:
        print(f"{Colors.RED}❌ 연결 실패{Colors.NC}: 서버에 연결할 수 없습니다. ({url})\n")
        fail_count += 1
        return None
    except requests.exceptions.Timeout:
        print(f"{Colors.RED}❌ 타임아웃{Colors.NC}: 요청 시간이 초과되었습니다.\n")
        fail_count += 1
        return None
    except Exception as e:
        print(f"{Colors.RED}❌ 오류 발생{Colors.NC}: {str(e)}\n")
        fail_count += 1
        return None


def main():
    """메인 테스트 실행"""
    print(f"{Colors.BLUE}================================{Colors.NC}")
    print(f"{Colors.BLUE}결제 API 백엔드 검증 시작{Colors.NC}")
    print(f"{Colors.BLUE}================================{Colors.NC}\n")
    print(f"Base URL: {BASE_URL}")
    print(f"Token: {TOKEN[:20]}...\n")

    # 1. 결제 요청 테스트 (토스페이먼츠 - 성공)
    payment_response = test_api(
        "1. 결제 요청 (토스페이먼츠)",
        "POST",
        "/payments",
        {
            "amount": 29900,
            "currency": "KRW",
            "payment_method": "TOSS",
            "user_type": "PERSONAL",
            "metadata": json.dumps({
                "product_name": "Premium Plan",
                "customer_name": "홍길동",
                "customer_email": "test@example.com"
            })
        },
        200
    )

    # 결제 ID 추출
    payment_id = None
    if payment_response and payment_response.get("success") and payment_response.get("data"):
        payment_id = payment_response["data"].get("id")
        print(f"{Colors.BLUE}생성된 결제 ID: {payment_id}{Colors.NC}\n")

    # 2. 결제 요청 테스트 (음수 금액 - 실패)
    test_api(
        "2. 결제 요청 (음수 금액 - 실패 예상)",
        "POST",
        "/payments",
        {
            "amount": -1000,
            "currency": "KRW",
            "payment_method": "TOSS",
            "user_type": "PERSONAL"
        },
        400
    )

    # 3. 결제 요청 테스트 (잘못된 결제 방식 - 실패)
    test_api(
        "3. 결제 요청 (잘못된 결제 방식 - 실패 예상)",
        "POST",
        "/payments",
        {
            "amount": 29900,
            "currency": "KRW",
            "payment_method": "INVALID_METHOD",
            "user_type": "PERSONAL"
        },
        400
    )

    # 4. 결제 승인 테스트 (성공)
    if payment_id:
        test_api(
            "4. 결제 승인 (토스페이먼츠)",
            "POST",
            "/payments/confirm",
            {
                "orderId": str(payment_id),
                "amount": 29900,
                "paymentKey": "test_payment_key_abc123"
            },
            200
        )
    else:
        global fail_count
        print(f"{Colors.YELLOW}⚠️  결제 ID를 가져올 수 없어 결제 승인 테스트를 건너뜁니다.{Colors.NC}\n")
        fail_count += 1

    # 5. 결제 상태 조회 테스트
    if payment_id:
        test_api(
            "5. 결제 상태 조회",
            "GET",
            f"/payments/{payment_id}/status",
            expected_status=200
        )
    else:
        print(f"{Colors.YELLOW}⚠️  결제 ID를 가져올 수 없어 상태 조회 테스트를 건너뜁니다.{Colors.NC}\n")
        fail_count += 1

    # 6. 존재하지 않는 결제 조회 (실패)
    test_api(
        "6. 존재하지 않는 결제 조회 (실패 예상)",
        "GET",
        "/payments/999999/status",
        expected_status=404
    )

    # 7. 인증 없이 요청 (실패)
    test_api(
        "7. 인증 없이 결제 요청 (실패 예상)",
        "POST",
        "/payments",
        {
            "amount": 29900,
            "currency": "KRW",
            "payment_method": "TOSS",
            "user_type": "PERSONAL"
        },
        401,
        skip_auth=True
    )

    # 8. 카카오페이 결제 요청
    test_api(
        "8. 결제 요청 (카카오페이)",
        "POST",
        "/payments",
        {
            "amount": 29900,
            "currency": "KRW",
            "payment_method": "KAKAO_PAY",
            "user_type": "PERSONAL",
            "metadata": json.dumps({"product_name": "Premium Plan"})
        },
        200
    )

    # 9. PayPal 결제 요청
    test_api(
        "9. 결제 요청 (PayPal)",
        "POST",
        "/payments",
        {
            "amount": 29.99,
            "currency": "USD",
            "payment_method": "PAYPAL",
            "user_type": "PERSONAL",
            "metadata": json.dumps({"product_name": "Premium Plan"})
        },
        200
    )

    # 10. 금액 불일치 테스트 (결제 승인 - 실패)
    if payment_id:
        test_api(
            "10. 결제 승인 (금액 불일치 - 실패 예상)",
            "POST",
            "/payments/confirm",
            {
                "orderId": str(payment_id),
                "amount": 50000,  # 다른 금액
                "paymentKey": "test_key"
            },
            400
        )

    # 결과 출력
    print(f"{Colors.BLUE}================================{Colors.NC}")
    print(f"{Colors.BLUE}테스트 결과 요약{Colors.NC}")
    print(f"{Colors.BLUE}================================{Colors.NC}")
    print(f"{Colors.GREEN}성공: {success_count}{Colors.NC}")
    print(f"{Colors.RED}실패: {fail_count}{Colors.NC}")
    print(f"{Colors.BLUE}================================{Colors.NC}\n")

    if fail_count == 0:
        print(f"{Colors.GREEN}🎉 모든 테스트를 통과했습니다!{Colors.NC}")
        sys.exit(0)
    else:
        print(f"{Colors.RED}❌ 일부 테스트가 실패했습니다. 위의 실패 내용을 확인하세요.{Colors.NC}")
        sys.exit(1)


if __name__ == "__main__":
    # requests 라이브러리 확인
    try:
        import requests
    except ImportError:
        print(f"{Colors.RED}❌ requests 라이브러리가 설치되지 않았습니다.{Colors.NC}")
        print(f"다음 명령어로 설치하세요: pip install requests")
        sys.exit(1)

    # TOKEN 확인
    if TOKEN == "YOUR_ACCESS_TOKEN":
        print(f"{Colors.YELLOW}⚠️  경고: API_TOKEN 환경 변수가 설정되지 않았습니다.{Colors.NC}")
        print(f"일부 테스트가 실패할 수 있습니다.\n")
        print(f"사용법: API_TOKEN=your_token python test_backend_api.py\n")

    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}⚠️  테스트가 사용자에 의해 중단되었습니다.{Colors.NC}")
        sys.exit(1)
