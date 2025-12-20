"use client";

import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import DiveView from "@/components/DiveView";
import LiquidTabBar, { ViewState } from "@/components/LiquidTabBar";
import AuthView from "@/components/AuthView";

/**
 * 首頁元件
 * 整合身分驗證、導航欄與各視圖內容，提供完整的 App 體驗
 */
export default function Home() {
  // 身分驗證狀態
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 管理當前視圖狀態
  const [currentView, setCurrentView] = useState<ViewState>("dive");

  /**
   * 監聽 Supabase Auth 狀態變化
   * 當使用者登入或登出時，自動更新 session 狀態
   */
  useEffect(() => {
    // 取得目前的 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 監聽 Auth 狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 清理監聽器
    return () => subscription.unsubscribe();
  }, []);

  /**
   * 處理使用者送出觀點的回呼函式
   * 將氣泡寫入 Supabase 資料庫
   * 
   * @param content - 使用者輸入的思考內容
   */
  const handleSend = async (content: string) => {
    // 確認使用者已登入
    if (!session?.user?.id) {
      console.error("使用者未登入，無法發送氣泡");
      return;
    }

    // 根據企劃書，預設分類為 'Blue'
    const category = "Blue";

    // 隨機生成位置 (0 到 100 範圍的浮點數)
    const xPosition = Math.random() * 100;
    const yPosition = Math.random() * 100;

    const { error } = await supabase.from("bubbles").insert([
      {
        content: content,
        category: category,
        x_position: xPosition,
        y_position: yPosition,
        user_id: session.user.id, // 使用真實的使用者 ID
      },
    ]);

    if (error) {
      // 錯誤處理：使用 Yellow (#FFC678) 提示
      console.error("氣泡寫入失敗:", error.message);
    } else {
      console.log("氣泡已成功寫入資料庫");
      // Task 3: 發送成功後顯示提示
      alert("泡泡已浮起");
    }
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
          <div className="w-full h-full flex flex-col items-center justify-center gap-6">
            <p className="text-blue-300 text-lg">我的糧倉 - 建置中</p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 text-yellow-500/80 border border-yellow-500/20 rounded-xl transition-all active:scale-95 text-sm tracking-widest font-light"
            >
              終止潛行 (登出)
            </button>
          </div>
        );
      default:
        return <DiveView onSend={handleSend} />;
    }
  };

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-blue-900 flex items-center justify-center">
        <p className="text-blue-300 text-lg animate-pulse">載入中...</p>
      </div>
    );
  }

  // 未登入：顯示登入/註冊畫面
  if (!session) {
    return <AuthView />;
  }

  // 已登入：顯示主要內容
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
