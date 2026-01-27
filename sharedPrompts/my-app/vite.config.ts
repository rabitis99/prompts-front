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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          // Feature chunks
          'admin': ['./src/features/admin'],
          'settings': ['./src/features/settings'],
        },
      },
    },
    // 청크 크기 경고 임계값 증가 (큰 번들 허용)
    chunkSizeWarningLimit: 1000,
  },
})
