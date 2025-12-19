"use client";

import { useState } from "react";
import DiveView from "@/src/components/DiveView";
import LiquidTabBar, { ViewState } from "@/components/LiquidTabBar";

/**
 * 首頁元件
 * 整合導航欄與各視圖內容，提供完整的 App 導航體驗
 */
export default function Home() {
  // 管理當前視圖狀態
  const [currentView, setCurrentView] = useState<ViewState>("dive");

  /**
   * 處理使用者送出觀點的回呼函式
   * 當使用者在 DiveView 中輸入並送出思考內容時觸發
   * 
   * @param content - 使用者輸入的思考內容
   */
  const handleSend = (content: string) => {
    // 暫時使用 console.log 輸出內容，後續可接後端 API
    console.log("使用者送出的觀點：", content);
  };

  /**
   * 根據當前視圖渲染對應的內容
   * DiveView 需要佔滿全螢幕，其他視圖暫時顯示建置中提示
   */
  const renderContentView = () => {
    switch (currentView) {
      case "dive":
        return <DiveView onSend={handleSend} />;
      case "lobby":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-blue-300 text-lg">氣泡大廳 - 建置中</p>
          </div>
        );
      case "sonar":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-blue-300 text-lg">深海聲納 - 建置中</p>
          </div>
        );
      case "pantry":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-blue-300 text-lg">我的糧倉 - 建置中</p>
          </div>
        );
      default:
        return <DiveView onSend={handleSend} />;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 主要內容區域：根據 currentView 切換顯示 */}
      <div className="w-full h-full relative z-0">
        {renderContentView()}
      </div>

      {/* 導航欄：固定在畫面最底部，z-index 高於內容區域 */}
      <LiquidTabBar currentView={currentView} onChange={setCurrentView} />
    </div>
  );
}
