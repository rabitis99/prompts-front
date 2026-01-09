import { ArrowLeft } from "lucide-react";

interface Props {
  onChangeView: (view: "login" | "forgot" | "verify") => void;
}

export function ForgotPasswordView({ onChangeView }: Props) {
  return (
    <div className="space-y-6">
      <button
        onClick={() => onChangeView("login")}
        className="flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> 뒤로
      </button>

      <h1 className="text-3xl font-bold text-center">
        비밀번호 찾기
      </h1>

      <input
        type="email"
        placeholder="이메일"
        className="w-full px-4 py-3 rounded-lg border"
      />

      <button
        onClick={() => onChangeView("verify")}
        className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-lg"
      >
        재설정 링크 보내기
      </button>
    </div>
  );
}
