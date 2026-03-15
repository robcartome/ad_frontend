/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "euclid-circular-a": ["'Euclid Circular A'", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
