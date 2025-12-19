"use client";

import { useState } from "react";
import LiquidTabBar, { ViewState } from "@/components/LiquidTabBar";

export default function Home() {
  // 管理當前視圖狀態
  const [currentView, setCurrentView] = useState<ViewState>("dive");

  return (
    <div className="relative min-h-screen pb-24">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">深思氣泡</h1>
        <p className="text-gray-50/80">當前視圖：{currentView}</p>
      </div>

      {/* 液態導航列 */}
      <LiquidTabBar currentView={currentView} onChange={setCurrentView} />
    </div>
  );
}
