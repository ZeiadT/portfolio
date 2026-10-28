/// <reference types="vitest" />
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
