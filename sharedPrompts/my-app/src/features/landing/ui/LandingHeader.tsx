import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import { useHeaderScroll } from "../model/useHeaderScroll";

export function LandingHeader() {
  const scrolled = useHeaderScroll();
  const navigate = useNavigate();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-bold text-neutral-900">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          PromptHub
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            로그인
          </button>

          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            시작하기
          </button>
        </div>
      </div>
    </nav>
  );
}
