"use client";

import React, { useState, useEffect } from "react";

// 定義 6 個變體的 SVG 路徑
// 注意：由於 Figma MCP 只返回圖片 URL 而非 SVG 路徑，此處使用圖片作為臨時方案
// 如需使用真正的 SVG，請從 Figma 導出 SVG 並替換下方的 variantSvgs 陣列
const variantImages = [
  "https://www.figma.com/api/mcp/asset/27f5a89d-4e62-4310-a3d2-21ce0919e2f9", // Default
  "https://www.figma.com/api/mcp/asset/1f4ed1ee-7385-47f1-8465-eb4d1f46f99c", // Variant2
  "https://www.figma.com/api/mcp/asset/e7b438c2-dbfe-4eb6-9f07-e0267ff50396", // Variant3
  "https://www.figma.com/api/mcp/asset/246c41f1-10d7-4f71-b77e-edfcc963d5d6", // Variant4
  "https://www.figma.com/api/mcp/asset/1a2301c4-e90d-4684-acba-3cb5ead85070", // Variant5
  "https://www.figma.com/api/mcp/asset/bfbe1ec5-a636-4e81-a060-9fcc8f9c3a1b", // Variant6
];

interface LoadingWhaleProps {
  className?: string;
}

const LoadingWhale: React.FC<LoadingWhaleProps> = ({ className = "w-16 h-16 text-blue-200" }) => {
  // 當前顯示的變體索引（0-5）
  const [currentVariant, setCurrentVariant] = useState(0);

  // 使用 useEffect 設定計時器，每 150ms 切換到下一個變體
  useEffect(() => {
    const interval = setInterval(() => {
      // 循環切換：0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 0
      setCurrentVariant((prev) => (prev + 1) % variantImages.length);
    }, 150); // 150ms 間隔

    // 清理計時器
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className}>
      {/* 
        TODO: 替換為真正的 SVG 路徑
        目前使用圖片作為臨時方案，因為 Figma MCP 只返回圖片 URL
        如需使用 SVG，請從 Figma 導出 SVG 並使用以下結構：
        <svg viewBox="0 0 263 263" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="..." fill="currentColor" />
        </svg>
      */}
      <img
        src={variantImages[currentVariant]}
        alt="Loading whale animation"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default LoadingWhale;

