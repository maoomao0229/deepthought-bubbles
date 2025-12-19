import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 設定 Turbopack 根目錄，解決中文路徑問題
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
