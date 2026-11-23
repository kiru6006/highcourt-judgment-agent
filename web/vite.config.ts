import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const base = process.env.BASE_HREF || (mode === 'production' ? '/highcourt-judgment-agent/' : '/');
  return {
    base,
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
          }
        }
      }
    },
    server: {
      port: 4200
    },
    preview: {
      port: 4200
    }
  };
});
