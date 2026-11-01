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
        charcoal: {
          950: "#0b0c0e",
          900: "#101115",
          850: "#14161b",
          800: "#181a20",
          700: "#22252e",
          600: "#2d313c",
        },
        brand: {
          purple: {
            light: "#c084fc",
            DEFAULT: "#9333ea",
            dark: "#6b21a8",
            muted: "#4c1d95",
          },
          green: {
            light: "#34d399",
            DEFAULT: "#10b981",
            dark: "#059669",
            muted: "#064e3b",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

