import { useState } from "react";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { oauthLogin } from "@/features/auth/api/oauth";
import { useAuth } from "@/features/auth/hooks/useAuth";
interface Props {
  onChangeView: (view: "login" | "forgot" | "verify") => void;
}

export function LoginView({ onChangeView }: Props) {
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

      alert("로그인 성공 (임시)");
    } catch {
      setError("로그인에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 text-center">
        로그인
      </h1>

      {/* OAuth 로그인 */}
      <div className="space-y-3">
        <button
          onClick={() => oauthLogin("kakao")}
          className="w-full py-3 rounded-lg bg-[#FEE500] text-[#191919] font-medium hover:bg-[#FDD800]"
        >
          카카오로 계속하기
        </button>

        <button
          onClick={() => oauthLogin("naver")}
          className="w-full py-3 rounded-lg bg-[#03C75A] text-white font-medium hover:bg-[#02B350]"
        >
          네이버로 계속하기
        </button>

        <button
          onClick={() => oauthLogin("google")}
          className="w-full py-3 rounded-lg border border-neutral-300 font-medium hover:bg-neutral-50"
        >
          Google로 계속하기
        </button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-neutral-500">또는</span>
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
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-neutral-200"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-lg flex justify-center"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "로그인"}
        </button>
      </div>

      <div className="flex justify-between text-sm">
        <button
          onClick={() => onChangeView("forgot")}
          className="text-violet-600 hover:underline"
        >
          비밀번호 찾기
        </button>
        <button className="text-violet-600 hover:underline">
          회원가입
        </button>
      </div>
    </div>
  );
}
