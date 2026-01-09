import { Mail } from "lucide-react";

interface Props {
  onChangeView: (view: "login" | "forgot" | "verify") => void;
}

export function VerifyEmailView({ onChangeView }: Props) {
  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto">
        <Mail className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-bold">이메일 확인</h1>

      <p className="text-neutral-500">
        입력한 이메일로 링크를 보냈습니다
      </p>

      <button
        onClick={() => onChangeView("login")}
        className="w-full py-3 bg-neutral-100 rounded-lg"
      >
        로그인으로 돌아가기
      </button>
    </div>
  );
}
