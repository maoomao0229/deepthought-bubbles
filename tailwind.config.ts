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
        // 使用本地字體 GenSenRounded2TW 作為首選，保留系統字體作為後備
        sans: [
          "var(--font-deepthought)",
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
      // 自訂動畫定義
      animation: {
        // 氣泡浮動動畫 - 模擬深海中的緩慢浮動效果
        float: "float 6s ease-in-out infinite",
        // 淡入動畫 - 用於 Modal 與內容的漸入效果
        "fade-in": "fade-in 0.3s ease-out",
        // 縮放上升動畫 - 用於 Modal 卡片的出現效果
        "scale-up": "scale-up 0.4s ease-out",
      },
      keyframes: {
        // 氣泡浮動動畫關鍵幀
        float: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "25%": { transform: "translateY(-8px) translateX(4px)" },
          "50%": { transform: "translateY(-4px) translateX(-4px)" },
          "75%": { transform: "translateY(-12px) translateX(2px)" },
        },
        // 淡入動畫關鍵幀
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        // 縮放上升動畫關鍵幀
        "scale-up": {
          from: {
            opacity: "0",
            transform: "scale(0.9) translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "scale(1) translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;

