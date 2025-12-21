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
        <div className="w-full h-full min-h-screen overflow-hidden bg-black">
          {children}
        </div>
      </body>
    </html>
  );
}
