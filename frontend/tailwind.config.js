/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
        },
      },
      boxShadow: {
        glow: '0 0 30px rgba(59,130,246,0.35)'
      }
    },
  },
  plugins: [],
}


