import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "@/app/index.css";
import App from '@/app/App.tsx'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { initSentry } from '@/shared/utils/sentry';

// Sentry 초기화 (환경 변수 설정 시에만 활성화)
initSentry();

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
