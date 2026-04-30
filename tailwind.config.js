/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ascend: {
          navy:   '#102556',
          blue:   '#2a60bc',
          sky:    '#61caf9',
          mint:   '#89ffc7',
          card:   '#a7dce8',
          bg:     '#f6f7f2',
          muted:  '#4a5464',
        },
      },
    },
  },
  plugins: [],
}
