/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#e5e9ff',
          200: '#d0d7ff',
          300: '#b0bdff',
          400: '#959eff',
          500: '#7f83ff',
          600: '#605ef5',
          700: '#4946db',
          800: '#3d3bb5',
          900: '#363491',
        },
        secondary: {
          50: '#fff5f5',
          100: '#ffe5e5',
          200: '#ffcfcf',
          300: '#ffabab',
          400: '#ff8787',
          500: '#ff6b6b',
          600: '#f54848',
          700: '#db3434',
          800: '#b52a2a',
          900: '#912424',
        },
        maroon: '#800000',
        darkPurple: '#4B0082',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};