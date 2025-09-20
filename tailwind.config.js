/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'secondary': 'var(--secondary)',
        'accent': 'var(--accent)',
        'text-main': 'var(--text-main)',
        'text-light': 'var(--text-light)',
        'status-submitted': 'var(--status-submitted)',
        'status-progress': 'var(--status-progress)',
        'status-resolved': 'var(--status-resolved)',
      },
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}