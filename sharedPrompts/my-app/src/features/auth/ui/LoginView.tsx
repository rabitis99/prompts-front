import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
} from "lucide-react";
import { oauthLogin } from "@/features/auth/api/oauth";
import { useAuth } from "@/features/auth/hooks/useAuth";
interface Props {
  onChangeView: (view: "login" | "forgot" | "verify") => void;
}

export function LoginView({ onChangeView }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await login({ email, password });

      navigate("/feed");
    } catch {
      setError("로그인에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">로그인</h1>
        <p className="text-neutral-500">프롬프트 공유의 첫 걸음을 시작하세요</p>
      </div>

      {/* OAuth 로그인 */}
      <div className="space-y-3">
        <button
          onClick={() => oauthLogin("google")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 시작하기
        </button>

        <button
          onClick={() => oauthLogin("kakao")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#FEE500] rounded-xl font-medium text-[#191919] hover:bg-[#FDD800] transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.87 5.33 4.67 6.77l-.95 3.53c-.05.18.15.34.32.24l4.12-2.72c.59.08 1.2.13 1.84.13 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
          </svg>
          카카오로 시작하기
        </button>

        <button
          onClick={() => oauthLogin("naver")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#03C75A] rounded-xl font-medium text-white hover:bg-[#02B350] transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
          </svg>
          네이버로 시작하기
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-neutral-400">또는</span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* 로컬 로그인 */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">이메일</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                error ? 'border-red-300 bg-red-50' : 'border-neutral-200'
              } focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all bg-white`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">비밀번호</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className={`w-full pl-12 pr-12 py-3.5 rounded-xl border ${
                error ? 'border-red-300 bg-red-50' : 'border-neutral-200'
              } focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all bg-white`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              로그인 중...
            </>
          ) : (
            "로그인"
          )}
        </button>
      </div>

      <div className="flex justify-between text-sm">
        <button
          onClick={() => onChangeView("forgot")}
          className="text-violet-600 hover:text-violet-700 hover:underline"
        >
          비밀번호 찾기
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="text-violet-600 hover:text-violet-700 hover:underline"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
