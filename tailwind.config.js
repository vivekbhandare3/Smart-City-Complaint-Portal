/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Eco-friendly green color palette
        'primary': '#059669', // Emerald 600
        'primary-hover': '#047857', // Emerald 700
        'secondary': '#F0FDF4', // Green 50
        'accent': '#10B981', // Emerald 500
        'text-main': '#111827', // Gray 900
        'text-light': '#6B7280', // Gray 500
        'status-submitted': '#EF4444', // Red 500
        'status-progress': '#F59E0B', // Amber 500
        'status-resolved': '#10B981', // Emerald 500
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}