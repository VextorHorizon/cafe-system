import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#0c0c10",
        surface: "#0f0f14",
        elevated: "#12121a",
        border: "#1e1e2a",
        "text-primary": "#e8e6f0",
        "text-muted": "#5a5870",
        gold: "#c9a96e",
        "coffee-bg": "#2a1a0e",
        "coffee-text": "#c9833a",
        "tea-bg": "#0e1f1a",
        "tea-text": "#4caf8a",
        "other-bg": "#16161e",
        "other-text": "#8b7fcf",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
