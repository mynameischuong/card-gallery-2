/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wood-dark': '#4a3a28',
        'wood-medium': '#6b563d',
        'wood-light': '#8b6f47',
        'parchment': '#f4e4c1',
        'parchment-dark': '#d4c4a1',
        'gold': '#ffd700',
        'gold-dark': '#b8926a',
      },
      fontFamily: {
        'medieval': ['Cinzel', 'serif'],
      },
      boxShadow: {
        'card': '0 5px 15px rgba(0, 0, 0, 0.6)',
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.8)',
        'inner-glow': 'inset 0 0 15px rgba(255, 255, 255, 0.3)',
      }
    },
  },
  plugins: [],
}
