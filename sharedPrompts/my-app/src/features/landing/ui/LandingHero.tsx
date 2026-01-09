import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";

export function LandingHero() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto w-full text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-violet-200 text-violet-700 text-sm font-medium mb-8">
        <Sparkles className="w-4 h-4" />
        AI 프롬프트의 새로운 기준
      </div>

      <h1 className="text-6xl md:text-7xl font-bold text-neutral-900 leading-tight mb-8 tracking-tight">
        프롬프트를 공유하고
        <br />
        <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          함께 성장하세요
        </span>
      </h1>

      <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto leading-relaxed">
        개발, 마케팅, 디자인 분야의 검증된 프롬프트를 발견하고 공유해보세요
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate("/signup")}
          className="group px-10 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-violet-500/50 transition-all flex items-center justify-center gap-2"
        >
          무료로 시작하기
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => navigate("/explore")}
          className="px-10 py-5 bg-white/80 backdrop-blur-sm text-neutral-700 rounded-2xl font-semibold text-lg border-2 border-neutral-200 hover:border-neutral-300 hover:bg-white transition-all"
        >
          프롬프트 둘러보기
        </button>
      </div>
    </div>
  );
}
