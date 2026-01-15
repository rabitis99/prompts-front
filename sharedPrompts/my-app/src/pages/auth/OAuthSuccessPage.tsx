import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function OAuthSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { oauthCallback } = useAuth();

  const [loadingMessage, setLoadingMessage] = useState("OAuth 로그인 처리 중...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ⭐ StrictMode / 재렌더에서도 1회 실행 보장
  const calledRef = useRef(false);

  useEffect(() => {
    // 이미 실행됐으면 즉시 종료
    if (calledRef.current) return;
    calledRef.current = true;

    console.log("OAuthSuccessPage callback 실행");

    const key = params.get("key");
    const state = params.get("state");

    if (!key || !state) {
      setErrorMessage("OAuth key/state 누락");
      navigate("/login?error=oauth");
      return;
    }

    setLoadingMessage("OAuth 인증 중...");

    oauthCallback(key, state)
      .then(() => {
        setLoadingMessage("로그인 성공! 이동 중...");

        // URL 정리 (뒤로 가기 / 리렌더 재호출 방지)
        window.history.replaceState({}, "", "/");

        // 회원가입에서 시작한 OAuth인지 확인
        const isSignupFlow = localStorage.getItem('oauth_signup') === 'true';
        if (isSignupFlow) {
          localStorage.removeItem('oauth_signup');
          navigate("/signup?step=2&oauth=true");
        } else {
          navigate("/auth/bootstrap");
        }
      })
      .catch((err) => {
        console.error("oauthCallback 실패", err);
        // OAuth 실패 시 oauth_signup 플래그 정리
        localStorage.removeItem('oauth_signup');
        setErrorMessage("OAuth 인증 실패");
        navigate("/login?error=oauth");
      });
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
