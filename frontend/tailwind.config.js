/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'main': '#8babf1',
        'accent1': '#6366f1',
        'accent2': '#f57600'
      },
    },
  },
  plugins: [],
}