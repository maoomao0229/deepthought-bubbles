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
        // Blue (海洋) - 主要色系
        blue: {
          900: "#316794", // bg-background (Heavy)
          700: "#4376A0", // bg-card (Dense)
          500: "#5B8BB4", // Primary Button (Medium)
          300: "#7AA6C9", // (Pale)
          100: "#9FC1DD", // (Light)
        },
        // Indigo (深淵) - 強調色系
        indigo: {
          900: "#3B489D", // (Heavy)
          700: "#4D5AAA", // (Dense)
          500: "#6571BC", // Accent (Medium)
          300: "#848ECF", // (Pale)
          100: "#A6AEE1", // (Light)
        },
        // Green (生機) - 氣泡/成功狀態
        green: {
          900: "#29937C", // (Heavy)
          700: "#3CA08A", // (Dense)
          500: "#54B39E", // Bubbles/Success (Medium)
          300: "#75C9B6", // (Pale)
          100: "#9BDDCE", // (Light)
        },
        // Yellow (警示/蝦米) - 取代紅色，用於警告與錯誤
        yellow: {
          900: "#E59F40", // (Heavy)
          700: "#F8B75C", // Text Error (Dense)
          500: "#FFC678", // Warning/Icons (Medium)
          300: "#FFD294", // (Pale)
          100: "#FFDFB3", // (Light)
        },
        // Gray - 中性色系
        gray: {
          900: "#161819", // Title Black
          500: "#898A91", // Subtext
          50: "#FFFBF6", // Card White
        },
      },
      fontFamily: {
        // 預設使用無襯線字體
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

