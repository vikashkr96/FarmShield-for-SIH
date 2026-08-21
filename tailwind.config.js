/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          dark: '#0f3d2e',
          primary: '#0F766E', // rich teal/emerald
          secondary: '#047857', // emerald green
          accent: '#0284C7', // trustworthy slate/sky blue
          navy: '#0f172a',
          slate: '#334155',
          light: '#f0fdf4',
          subtle: '#f8fafc',
          border: '#e2e8f0',
          tricolorOrange: '#FF9933',
          tricolorGreen: '#138808'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
