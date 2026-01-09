export function LandingFooter() {
  return (
    <footer className="py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
        <div>© 2025 PromptHub</div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-neutral-900 transition-colors">
            이용약관
          </a>
          <a href="#" className="hover:text-neutral-900 transition-colors">
            개인정보처리방침
          </a>
        </div>
      </div>
    </footer>
  );
}
