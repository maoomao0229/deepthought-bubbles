import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const deepThoughtFont = localFont({
  src: [
    {
      path: "../src/app/fonts/GenSenRounded2TW-EL.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../src/app/fonts/GenSenRounded2TW-L.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../src/app/fonts/GenSenRounded2TW-R.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../src/app/fonts/GenSenRounded2TW-M.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../src/app/fonts/GenSenRounded2TW-B.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../src/app/fonts/GenSenRounded2TW-H.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-deepthought",
  display: "swap",
});

export const metadata: Metadata = {
  title: "深思氣泡",
  description: "深思氣泡 - Deep Thought Bubbles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        className={`${deepThoughtFont.variable} antialiased bg-blue-900 text-gray-50`}
        suppressHydrationWarning
      >
        {/* 外層容器：全螢幕背景，Desktop 時加上模糊效果或深色遮罩 */}
        <div className="min-h-screen bg-blue-900 md:bg-blue-900/80 md:backdrop-blur-md">
          {/* Desktop 深色遮罩層，讓中間容器更突出 */}
          <div className="hidden md:block fixed inset-0 bg-black/20 pointer-events-none" />

          {/* 內層主容器：RWD 響應式設計 */}
          <div className="min-h-screen bg-blue-900 md:max-w-[430px] md:mx-auto md:shadow-2xl">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
