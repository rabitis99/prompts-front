import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@/app/index.css";
import App from '@/app/App.tsx'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { initSentry } from '@/shared/utils/sentry';

// Sentry 초기화 (환경 변수 설정 시에만 활성화)
initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
