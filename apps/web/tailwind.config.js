/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Mars & Memory dark palette
        surface: {
          DEFAULT: '#0f0e11',
          50: '#1a1820',
          100: '#242130',
          200: '#2e2a40',
        },
        accent: {
          DEFAULT: '#c2410c',   // rust-red (mars iron oxide)
          light: '#ea580c',
          subtle: '#431407',
        },
        gold: {
          DEFAULT: '#d97706',
          light: '#f59e0b',
          subtle: '#451a03',
        },
        muted: '#6b7280',
        border: '#27272a',
      },
    },
  },
  plugins: [],
}
