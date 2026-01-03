/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5e19e6",
        "primary-hover": "#4a14b6",
        "brand-blue": "#0d47a1",
        "brand-blue-light": "#1976d2",
        "background-light": "#f6f6f8",
        "background-dark": "#161121",
        "surface-light": "#f6f6f8",
        "surface-dark": "#1e1a2e"
      },
      fontFamily: {
        display: ["var(--font-lexend)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      }
    },
  },
  plugins: [],
}
