/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E6F7F3', // 淡薄荷蓝
        secondary: '#B3E5DC', // 薄荷蓝
        accent: '#80D8CC', // 深薄荷蓝
        dark: '#26A69A', // 薄荷绿
        light: '#F0FDFA', // 极浅薄荷蓝
        gray: {
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        }
      },
      fontFamily: {
        sans: ['PingFang SC', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 15px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}