/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'leemin-teal': '#007B80', // 메인 컬러
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite', // 무한대 회전용
      },
      fontFamily: {
        'dot': ['"VT323"', 'monospace'], // 도트 폰트
        'pixel': ['"Press Start 2P"', 'cursive'],
      },
    },
  },
  plugins: [],
}
