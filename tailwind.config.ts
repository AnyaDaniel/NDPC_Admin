import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ndpc: {
          blue: "#1E4CC4",
          "blue-2": "#2E62E4",
          green: "#22c55e",
          amber: "#f59e0b",
          red: "#ef4444",
          purple: "#a855f7",
        },
      },
    },
  },
  plugins: [],
};

export default config;
