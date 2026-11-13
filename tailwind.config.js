/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#FFF5EC',
          100: '#FFE6CC',
          200: '#FFCC99',
          300: '#FFB266',
          400: '#FF9933',
          500: '#FF7900',
          600: '#E56C00',
          700: '#B85600',
          800: '#8A4100',
          900: '#5C2B00',
        },
        accent: {
          300: '#FFD666',
          400: '#FFBE16',
          500: '#E5A500',
        },
        slate: {
          50: '#F4F7FB',
          100: '#E9EEF5',
          200: '#D5DEEA',
          300: '#B8C5D6',
          400: '#8A9BB2',
          500: '#63768F',
          600: '#475A73',
          700: '#2A3D57',
          800: '#10243D',
          900: '#071426',
          950: '#040C18',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
