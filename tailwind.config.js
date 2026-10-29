/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          base: '#08090C',
          surface: '#111318',
          elevated: '#181B22',
        },
        accent: {
          cyan: '#00F2FE',
          blue: '#4FACFE',
          violet: '#7F00FF',
        },
        text: {
          primary: '#F8FAFC',
          muted: '#94A3B8',
          high: '#F8FAFC',
        },
        vyn: {
          canvas: '#08090C',
          surface: '#111318',
          elevated: '#181B22',
          primary: '#00F2FE',
          secondary: '#4FACFE',
          accent: '#7F00FF',
          high: '#F8FAFC',
          muted: '#94A3B8',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-active': 'rgba(0, 242, 254, 0.3)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 242, 254, 0.25)',
        'glow-accent': '0 0 20px -3px rgba(127, 0, 255, 0.25)',
      },
    },
  },
  plugins: [],
}

