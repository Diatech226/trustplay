/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
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
  plugins: (() => {
    const plugins = [require('@tailwindcss/line-clamp')];

    try {
      plugins.push(require('tailwind-scrollbar'));
    } catch (error) {
      // fix: guard optional plugin so Tailwind config loads even if dependency is missing
    }

    return plugins;
  })(),
};
