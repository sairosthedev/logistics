/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui" 
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Dark mode specific colors
        dark: {
          bg: {
            primary: '#1a1b1e',
            secondary: '#2c2d31',
            tertiary: '#3d3e42',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
            tertiary: '#71717a',
          }
        }
      },
      backgroundColor: {
        'dark-hover': 'rgba(255, 255, 255, 0.1)',
      },
      boxShadow: {
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [daisyui],
}
