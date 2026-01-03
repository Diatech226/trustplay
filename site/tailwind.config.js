
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens
        primary: '#0F172A',
        secondary: '#14532D',
        accent: '#EAB308',
        ink: '#0B1120',
        mist: '#F8FAFC',
        subtle: '#E2E8F0',
        ocean: '#0EA5E9',
        coral: '#FB7185',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 70px rgba(15, 23, 42, 0.12)',
        subtle: '0 10px 30px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        soft: '18px',
      },
      spacing: {
        gutter: '1.25rem',
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
    require('tailwind-scrollbar'),
  ],
};
