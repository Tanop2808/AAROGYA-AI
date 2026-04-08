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
        primary: "#1B6CA8",
        "primary-dark": "#0F4C7A",
        "primary-light": "#2A85D0",
        accent: "#FF6B35",
        "green-brand": "#1E8449",
        "green-light": "#27AE60",
        "yellow-brand": "#F39C12",
        "red-brand": "#C0392B",
        "red-light": "#E74C3C",
        "bg-brand": "#F0F4F8",
        "text-brand": "#1A2332",
        "text-muted": "#6B7C93",
        border: "#DDE3EC",
      },
      fontFamily: {
        hindi: ["Noto Sans Devanagari", "Baloo 2", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
