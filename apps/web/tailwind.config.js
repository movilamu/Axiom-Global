/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        "dm-sans": ["DM Sans", "sans-serif"],
        "dm-mono": ["DM Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
