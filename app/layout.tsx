import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-blue-900 text-gray-50`}
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
