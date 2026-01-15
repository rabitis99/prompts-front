import type { AppearanceSettings } from '../types/settings.types';
import { THEME_OPTIONS, LANGUAGE_OPTIONS } from '../constants/settings.constants';

interface AppearanceTabProps {
  appearance: AppearanceSettings;
  onAppearanceChange: (appearance: AppearanceSettings) => void;
}

export function AppearanceTab({
  appearance,
  onAppearanceChange,
}: AppearanceTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">테마</h3>
        <div className="grid grid-cols-3 gap-4">
          {THEME_OPTIONS.map((theme) => (
            <button 
              key={theme.id} 
              onClick={() => onAppearanceChange({ ...appearance, theme: theme.id as 'light' | 'dark' | 'system' })} 
              className={`p-4 rounded-xl border-2 transition-colors ${
                appearance.theme === theme.id ? 'border-violet-500 bg-violet-50' : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="text-2xl mb-2">{theme.icon}</div>
              <div className="text-sm font-medium">{theme.label}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">언어</h3>
        <div className="grid grid-cols-2 gap-4">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button 
              key={lang.id} 
              onClick={() => onAppearanceChange({ ...appearance, language: lang.id as 'ko' | 'en' })} 
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                appearance.language === lang.id ? 'border-violet-500 bg-violet-50' : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

