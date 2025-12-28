import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '${API_URL}': {
        target: 'https://trustapi.onrender.com',
        secure: false,
      },
    },
    fs: {
      allow: [fileURLToPath(new URL('..', import.meta.url))],
    },
  },

  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
  },
});
