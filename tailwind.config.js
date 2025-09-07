/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // make sure Tailwind scans all your React files
  ],
  theme: {
    extend: {
      colors: {
        brandGreen: "#31ab3a",
        brandOrange: "#fe9f23",
      },
    },
  },
  plugins: [],
};
