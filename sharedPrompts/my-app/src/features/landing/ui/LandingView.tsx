import { LandingHeader } from '@/features/landing/ui/LandingHeader';
import { LandingHero } from '@/features/landing/ui/LandingHero';
import { LandingFooter } from '@/features/landing/ui/LandingFooter';
import { useLandingView } from '@/features/landing/model/useLandingView';

export function LandingView() {
  const {
    handleNavigateToLogin,
    handleNavigateToSignup,
    handleNavigateToExplore,
  } = useLandingView();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex flex-col">
      <LandingHeader
        onNavigateToLogin={handleNavigateToLogin}
        onNavigateToSignup={handleNavigateToSignup}
      />
      <main className="flex-1 flex items-center justify-center px-6">
        <LandingHero
          onNavigateToSignup={handleNavigateToSignup}
          onNavigateToExplore={handleNavigateToExplore}
        />
      </main>
      <LandingFooter />
    </div>
  );
}

