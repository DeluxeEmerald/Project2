/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'main': '#1F5C57',
        'wood': '#C77D45',
        'marble': '#E4D6B5',
        'magic': '#2C3E6B'
      },
      fontFamily: {
        grover: ['"Irish Grover"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}