import { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, Layers } from 'lucide-react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex flex-col">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-neutral-900">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            PromptHub
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              로그인
            </button>
            <button className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
              시작하기
            </button>
          </div>
        </div>
      </nav>
    
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
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
            <button className="group px-10 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-violet-500/50 transition-all flex items-center justify-center gap-2">
              무료로 시작하기
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-5 bg-white/80 backdrop-blur-sm text-neutral-700 rounded-2xl font-semibold text-lg border-2 border-neutral-200 hover:border-neutral-300 hover:bg-white transition-all">
              프롬프트 둘러보기
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <div>© 2025 PromptHub</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-neutral-900 transition-colors">이용약관</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </div>
  );
}