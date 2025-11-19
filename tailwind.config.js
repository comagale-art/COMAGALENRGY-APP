/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'comagal-blue': '#0056b3',
        'comagal-green': '#00a651',
        'comagal-light-blue': '#4a90e2',
        'comagal-light-green': '#4cd964',
      },
    },
  },
  plugins: [],
};