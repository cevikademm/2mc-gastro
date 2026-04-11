import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
    assetsInlineLimit: 100000,
  },
  optimizeDeps: {
    entries: ['index.html', 'src/main.tsx'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
