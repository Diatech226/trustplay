const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react-swc');

// https://vitejs.dev/config/
module.exports = defineConfig({
  server: {
    proxy: {
      '${API_URL}': {
        target: 'https://trustapi.onrender.com',
        secure: false,
      },
    },
  },

  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
  },
});
