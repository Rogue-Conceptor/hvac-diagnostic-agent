import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1724",
        card: "#1a2332",
        foreground: "#e8e6df",
        muted: "#8b9bb4",
        accent: "#5d9cf5",
      },
    },
  },
  plugins: [],
};

export default config;
