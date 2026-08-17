import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"]
      },
      colors: {
        background: "#FAF7F5",
        primary: {
          DEFAULT: "#257ED9",
          strong: "#0A54A1"
        },
        navy: "#092D58",
        accent: "#F6AC2F",
        border: "rgba(9,45,88,0.14)"
      },
      boxShadow: {
        premium: "0 24px 80px rgba(9, 45, 88, 0.12)",
        soft: "0 12px 36px rgba(9, 45, 88, 0.09)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.35rem",
        "3xl": "1.6rem"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
