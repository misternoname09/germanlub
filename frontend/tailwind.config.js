/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand': '#e85d04', // Germanlub orange
        'brand-dark': '#dc2f02',
      }
    },
  },
  plugins: [],
}

