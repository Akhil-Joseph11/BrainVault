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
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(3%, -4%) scale(1.03)" },
          "66%": { transform: "translate(-2%, 3%) scale(0.97)" },
        },
        "micro-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.75" },
        },
        "shimmer-sweep": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        "tab-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.55s ease-out both",
        "fade-in": "fade-in 0.45s ease-out both",
        "scale-in": "scale-in 0.4s ease-out both",
        "float-slow": "float 22s ease-in-out infinite",
        "float-slower": "float 32s ease-in-out infinite reverse",
        "micro-float": "micro-float 5s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "shimmer-sweep": "shimmer-sweep 2.8s ease-in-out infinite",
        "tab-glow": "tab-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

