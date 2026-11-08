import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#03010a",
          900: "#060312",
          800: "#0b0619",
          700: "#120b24",
        },
        gold: {
          50: "#fff9e6",
          100: "#fdf2cd",
          200: "#f8e3a1",
          300: "#f0cf74",
          400: "#e3b84f",
          500: "#d4a437",
          600: "#b8860b",
          700: "#8f6508",
        },
        ivory: "#f7ecd8",
        ember: "#ff7a1a",
        rose: "#ff4f8b",
        teal: "#4ee0cf",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        accent: ["var(--font-cinzel)", "Georgia", "serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-220%) skewX(-12deg)" },
          "100%": { transform: "translateX(420%) skewX(-12deg)" },
        },
        "spin-slower": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "spin-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "35%": { opacity: "0.82", transform: "scale(0.97)" },
          "65%": { opacity: "0.94", transform: "scale(1.02)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.15", transform: "scale(0.85)" },
          "50%": { opacity: "0.9", transform: "scale(1.15)" },
        },
      },
      animation: {
        shimmer: "shimmer 3.4s ease-in-out infinite",
        "spin-slower": "spin-slower 90s linear infinite",
        "spin-reverse": "spin-reverse 120s linear infinite",
        "float-soft": "float-soft 7s ease-in-out infinite",
        flicker: "flicker 2.8s ease-in-out infinite",
        twinkle: "twinkle 4s ease-in-out infinite",
      },
      boxShadow: {
        "glow-gold": "0 0 60px -12px rgba(240, 190, 90, 0.55)",
        "glow-ember": "0 0 80px -20px rgba(255, 122, 26, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
