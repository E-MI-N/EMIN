/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'leemin-teal': '#007B80',
        'leemin-dark': '#001A1B',
        'leemin-glow': '#00FFD0',
      },
      fontFamily: {
        'dot': ['"VT323"', 'monospace'],
        'pixel': ['"Press Start 2P"', 'cursive'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      },
    },
  },
  plugins: [],
}
