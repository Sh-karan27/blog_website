/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#18191B",
          card: "#232429",
          input: "#26272B",
          border: "#303136",
          text: "#F3F4F6",
          textMuted: "#A1A1AA",
          textDisabled: "#626269",
          accent: "#363B41",
          link: "#6675DF",
        },
      },
    },
  },
  plugins: [require("daisyui")], // ⬅️ register daisyUI
};
