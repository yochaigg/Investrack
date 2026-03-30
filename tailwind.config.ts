import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#06060f",
          surface: "#0d0d1a",
          card: "#111127",
          hover: "#1a1a2e",
        },
        neon: {
          cyan: "#00f0ff",
          blue: "#3b82f6",
          green: "#00ff88",
          purple: "#8b5cf6",
          pink: "#ec4899",
          amber: "#f59e0b",
        },
        gain: "#00ff88",
        loss: "#ff3366",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 240, 255, 0.15)",
        "glow-lg": "0 0 40px rgba(0, 240, 255, 0.2)",
        "glow-green": "0 0 20px rgba(0, 255, 136, 0.15)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.15)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
