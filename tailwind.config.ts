import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        silver: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#c0c0c0",
          500: "#a8a8a8",
          600: "#8a8a8a",
          700: "#6b6b6b",
          800: "#4a4a4a",
          900: "#2a2a2a",
        },
      },
    },
  },
  plugins: [],
};
export default config;

