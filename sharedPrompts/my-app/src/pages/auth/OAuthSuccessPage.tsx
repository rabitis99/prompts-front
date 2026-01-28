import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { userApi } from "@/features/auth/api/user.api";

export default function OAuthSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { oauthCallback } = useAuth();

  const [loadingMessage, setLoadingMessage] = useState("OAuth 로그인 처리 중...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ⭐ StrictMode / 재렌더에서도 1회 실행 보장
  const calledRef = useRef(false);
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // 이미 실행됐으면 즉시 종료
    if (calledRef.current) return;
    calledRef.current = true;

    const key = params.get("key");
    const state = params.get("state");

    if (!key || !state) {
      console.error("OAuth key/state 누락", { key, state });
      setErrorMessage("OAuth key/state 누락");
      navigate("/login?error=oauth");
      return;
    }

    console.log("OAuth callback 호출", { keyPresent: !!key, statePresent: !!state });
    setLoadingMessage("OAuth 인증 중...");

    oauthCallback(key, state)
      .then(() => {
        setLoadingMessage("사용자 정보 확인 중...");

        // URL 정리 (뒤로 가기 / 리렌더 재호출 방지)
        window.history.replaceState({}, "", "/");

        // users/me를 통해 신규 가입인지 기존 가입인지 구분
        // oauth_signup 플래그는 더 이상 사용하지 않음
        localStorage.removeItem('oauth_signup');
        
        userApi.getMyInfo()
          .then((response) => {
            const userData = response.data.data;
            // is_signup_completed가 false면 신규 가입 (회원가입 플로우)
            // is_signup_completed가 true면 기존 가입 (로그인 완료)
            if (userData.is_signup_completed === false) {
              navigate("/signup?step=2&oauth=true");
            } else {
              navigate("/feed");
            }
          })
          .catch((err) => {
            console.error("사용자 정보 조회 실패", err);
            // users/me 호출 실패 시 기본적으로 피드로 이동
            navigate("/feed");
          });
      })
      .catch((err: any) => {
        // OAuth 실패 시 oauth_signup 플래그 정리
        localStorage.removeItem('oauth_signup');
        
        // 에러 메시지 추출
        const errorData = err?.response?.data;
        const errorCode = errorData?.error?.code || errorData?.code;
        const errorMessage = errorData?.error?.message || errorData?.message || err?.message;
        
        // 상세한 에러 로깅
        console.error("oauthCallback 실패", {
          errorCode,
          errorMessage,
          status: err?.response?.status,
        });
        
        // OAuth2 토큰 무효 에러인 경우
        if (errorCode === 'OAUTH2_TOKEN_INVALID') {
          setErrorMessage("OAuth 인증 토큰이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
          console.warn("OAuth2 토큰 무효 - 가능한 원인:", [
            "1. OAuth 인증 과정이 너무 오래 걸려서 토큰이 만료됨",
            "2. 같은 토큰을 두 번 사용하려고 시도함 (새로고침/뒤로가기)",
            "3. 백엔드 세션/캐시가 만료됨",
            "4. OAuth provider에서 받은 인증 코드가 이미 사용됨"
          ]);
        } else {
          setErrorMessage(errorMessage || "OAuth 인증 실패");
        }
        
        // 에러 메시지 표시 후 로그인 페이지로 이동
        redirectTimeoutRef.current = window.setTimeout(() => {
          navigate("/login?error=oauth" + (errorCode === 'OAUTH2_TOKEN_INVALID' ? '_token_invalid' : ''));
        }, 2000);
      });

    return () => {
      if (redirectTimeoutRef.current !== null) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []); // ⭐ 의존성 비움 (의도적)

  return (
    <div className="p-10 text-center">
      <p className="mb-4 animate-pulse">{loadingMessage}</p>
      {errorMessage && (
        <p className="text-red-500 font-semibold">{errorMessage}</p>
      )}
    </div>
  );
}
