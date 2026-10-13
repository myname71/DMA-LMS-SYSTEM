import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 5173,
    host: true,
    hmr: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Explicit target: esbuild >= 0.28 cannot down-level destructuring for
    // Vite 6's default 'modules' target list, so build for modern browsers.
    target: ['chrome107', 'edge107', 'firefox104', 'safari16'],
  },
});
