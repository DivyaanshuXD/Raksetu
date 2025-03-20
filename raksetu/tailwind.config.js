/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3B82F6',
          600: '#2563EB',
        },
        secondary: {
          500: '#10B981',
          600: '#059669',
        },
        gradient: {
          blue: '#BFDBFE',
          purple: '#C4B5FD',
          pink: '#FBCFE8',
        },
      },
    },
  },
  plugins: [],
};