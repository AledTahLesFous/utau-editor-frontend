/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./src/**/*.{html,ts}",
],

  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

