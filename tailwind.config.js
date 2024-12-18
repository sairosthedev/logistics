module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          600: '#4B5563',
          500: '#6B7280',
          400: '#9CA3AF',
          300: '#D1D5DB',
          200: '#E5E7EB',
          100: '#F3F4F6',
          50: '#F9FAFB',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui'], // Add Roboto font here
      },
      keyframes: {
        popup: {
          '0%': {
            opacity: '0',
            transform: 'translate(-50%, -40%)',
            scale: '0.95'
          },
          '40%': {
            opacity: '1',
            transform: 'translate(-50%, -50%)',
            scale: '1.05'
          },
          '100%': {
            opacity: '1',
            transform: 'translate(-50%, -50%)',
            scale: '1'
          },
        }
      },
      animation: {
        'popup': 'popup 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }
    },
  },
  plugins: [],
};
