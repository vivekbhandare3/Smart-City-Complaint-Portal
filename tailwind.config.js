/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'primary': '#0052cc', // A strong, professional blue
        'primary-hover': '#0041a3',
        'secondary': '#f8f9fa',
        'accent': '#007bff',
        'text-main': '#172b4d',
        'text-light': '#5e6c84',
      },
    },
  },
  plugins: [],
}