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
        // 🔵 Blue (海洋基調)
        blue: {
          900: "#316794", // 深海背景
          700: "#4376A0",
          500: "#5B8BB4", // 主要按鈕
          300: "#7AA6C9", // 次要文字
          100: "#9FC1DD", // 裝飾性背景
        },
        // 🟣 Indigo (深邃意象)
        indigo: {
          900: "#3B489D", // 深淵背景
          700: "#4D5AAA",
          500: "#6571BC", // 品牌強調色
          300: "#848ECF",
          100: "#A6AEE1",
        },
        // 🟢 Green (生機 - 氣泡)
        green: {
          900: "#29937C",
          700: "#3CA08A",
          500: "#54B39E", // 泡泡本體 / Success
          300: "#75C9B6",
          100: "#9BDDCE",
        },
        // 🟡 Yellow (警示 - 取代紅色)
        yellow: {
          900: "#E59F40",
          700: "#F8B75C", // Text Error
          500: "#FFC678", // Warning / Error Message
          300: "#FFD294",
          100: "#FFDFB3",
        },
        // ⚪️ Neutral (中性色)
        gray: {
          900: "#161819", // 標題文字
          500: "#898A91", // 輔助說明文字
          50: "#FFFBF6",  // 卡片背景 / 暖白文字
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "float-bubble": "floatBubble 20s infinite linear", // 新增氣泡浮動動畫
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatBubble: { // 新增氣泡浮動關鍵影格
          "0%": { transform: "translateY(0) translateX(0) rotate(0deg)", opacity: "0" },
          "20%": { opacity: "0.6" },
          "80%": { opacity: "0.4" },
          "100%": { transform: "translateY(-120vh) translateX(20px) rotate(360deg)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
