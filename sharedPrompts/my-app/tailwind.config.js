/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        text: {
          main: "var(--color-text-main)",
          sub: "var(--color-text-sub)",
          muted: "var(--color-text-muted)",
        },
      },
      backgroundColor: {
        surface: "var(--color-surface)",
        landing: "var(--color-landing-bg)",
      },
      borderColor: {
        DEFAULT: "var(--color-border)",
        primary: "var(--color-primary-border)",
        accent: "var(--color-accent-border)",
        secondary: "var(--color-secondary-border)",
      },
    },
  },
  plugins: [],
};
