import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 번들 분석 (npm run build 후 dist/stats.html 생성)
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 개발 서버 프록시 설정 (CORS 문제 해결)
  // 프로덕션에서는 백엔드에서 CORS를 올바르게 설정해야 합니다
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // 필요시 헤더 추가
        // configure: (proxy, _options) => {
        //   proxy.on('error', (err, _req, _res) => {
        //     console.log('proxy error', err);
        //   });
        // },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          
          // Vendor chunks
          if (normalizedId.includes('node_modules')) {
            if (normalizedId.includes('react') || normalizedId.includes('react-dom') || normalizedId.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (normalizedId.includes('lucide-react')) {
              return 'ui-vendor';
            }
          }
          // Feature chunks
          if (normalizedId.includes('/src/features/admin/')) {
            return 'admin';
          }
          if (normalizedId.includes('/src/features/settings/')) {
            return 'settings';
          }
        },
      },
    },
    // 청크 크기 경고 임계값 증가 (큰 번들 허용)
    chunkSizeWarningLimit: 1000,
  },
})
