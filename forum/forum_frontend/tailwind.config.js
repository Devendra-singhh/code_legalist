/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      scale: {
        '102': '1.02',
      },
      colors: {
        pastel: {
          blue: '#E6F3FF',
          red: '#FFE6E6',
          green: '#E6FFE6',
          purple: '#F3E6FF',
          yellow: '#FFFDE6'
        },
        red: {
          50: '#FFF5F5',
          100: '#FFE6E6',
          200: '#FFC7C7',
          300: '#FFA8A8',
          400: '#FF8989',
          500: '#FF6B6B',
          600: '#FF4D4D',
          700: '#FF2E2E',
          800: '#FF1010',
          900: '#F10000'
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
} 