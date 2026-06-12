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
        inkwell: {
          accent: "#995F2F",
          hover: "#7A4A22",
          light: "#C88040",
          surface: "#F5F0EB",
          border: "#E5E5E5",
          muted: "#666666",
        },
        dark: {
          bg: "#1A0E04",
          card: "#2A1A08",
          input: "#3A2410",
          border: "#4A3020",
          text: "#F5F0EB",
          textMuted: "#A89080",
          textDisabled: "#7A6050",
          accent: "#5A3A1A",
          link: "#C88040",
        },
      },
    },
  },
  plugins: [],
};
