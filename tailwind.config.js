/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        screens: {
          'xs': '360px', // Custom breakpoint for screens wider than 400px
        },
        fontFamily: {
          inter: ['Inter', 'sans-serif'], // Define custom font if needed
        },
        colors: {
          purple: { // Custom purple palette if needed
            '400': '#A78BFA',
            '500': '#8B5CF6',
            '600': '#7C3AED',
            '700': '#6D28D9',
          },
          zinc: { // Matching your existing zinc usage
            '100': '#F4F4F5',
            '300': '#D4D4D8',
            '400': '#A1A1AA',
            '500': '#71717A',
            '600': '#52525B',
            '700': '#3F3F46',
            '800': '#27272A',
            '900': '#18181B',
            '950': '#09090B',
          },
        }
      },
    },
    plugins: [],
}