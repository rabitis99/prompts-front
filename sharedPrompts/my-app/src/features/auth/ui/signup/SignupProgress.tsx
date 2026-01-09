import { Check } from 'lucide-react';
import type { SignupStep } from '@/features/auth/types/signup.types';

interface SignupProgressProps {
  currentStep: SignupStep;
}

export function SignupProgress({ currentStep }: SignupProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              currentStep >= s ? 'bg-violet-500 text-white' : 'bg-neutral-200 text-neutral-500'
            }`}
          >
            {currentStep > s ? <Check className="w-4 h-4" /> : s}
          </div>
          {s < 5 && (
            <div
              className={`w-8 h-1 mx-1 rounded-full transition-colors ${
                currentStep > s ? 'bg-violet-500' : 'bg-neutral-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

