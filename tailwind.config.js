/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080a0c',
          surface: '#0f1216',
          card: '#15191e',
          panel: '#1d232a',
          border: '#262f3a',
          hover: '#202832',
          text: '#d1d7de',
          muted: '#8b949e',
          
          // Accents
          green: {
            DEFAULT: '#608b63',
            text: '#83b887',
            bg: '#122315',
            border: '#28462c',
          },
          amber: {
            DEFAULT: '#c9961a',
            text: '#ecc45b',
            bg: '#261e0c',
            border: '#4d3a14',
          },
          red: {
            DEFAULT: '#d53b3b',
            text: '#ff6666',
            bg: '#260e0f',
            border: '#4e191b',
          },
          cyan: {
            DEFAULT: '#3486f3',
            text: '#58a6ff',
            bg: '#0d1b2d',
            border: '#1a3c63',
          }
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
