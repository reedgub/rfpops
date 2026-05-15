import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#090b10",
        foreground: "#f4f7fb",
        surface: "#101621",
        panel: "#141d2b",
        muted: "#8b98ad",
        line: "#243044",
        gold: "#c9a64d",
        bid: "#39b980",
        maybe: "#d69b2d",
        nobid: "#d45555"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(201,166,77,0.18), 0 22px 80px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};

export default config;
