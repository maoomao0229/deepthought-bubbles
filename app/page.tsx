"use client";

import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import DiveView from "@/components/DiveView";
import LiquidTabBar, { ViewState } from "@/components/LiquidTabBar";
import AuthView from "@/components/AuthView";
import LobbyView from "@/components/LobbyView";

/**
 * 首頁元件
 * 整合身分驗證、導航欄與各視圖內容，提供完整的 App 體驗
 */
export default function Home() {
  // 身分驗證狀態
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 解鎖狀態 (今日是否已潛入)
  const [isUnlocked, setIsUnlocked] = useState(false);

  // 管理當前視圖狀態
  const [currentView, setCurrentView] = useState<ViewState>("dive");

  // 泡泡資料狀態
  const [bubbles, setBubbles] = useState<any[]>([]);

  /**
   * 檢查當前使用者今天是否已完成潛入 (發布主題貼文)
   */
  const checkDailyDive = async (userId: string) => {
    // 取得今天的開始與結束時間
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from("bubbles")
      .select("id")
      .eq("user_id", userId)
      .is("parent_id", null)
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString())
      .limit(1);

    if (error) {
      console.error("查驗每日潛入狀態失敗:", error.message);
    } else {
      setIsUnlocked(data && data.length > 0);
    }
  };

  /**
   * 抓取所有主泡泡 (parent_id 為空)
   */
  const fetchBubbles = async () => {
    const { data, error } = await supabase
      .from("bubbles")
      .select("*")
      .is("parent_id", null) // 只讀取主泡泡
      .order("created_at", { ascending: false });

    if (error) {
      console.error("抓取泡泡失敗:", error.message);
    } else {
      setBubbles(data || []);
    }
  };

  /**
   * 監聽 Supabase Auth 狀態變化
   */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
      if (session) {
        fetchBubbles();
        checkDailyDive(session.user.id); // 查驗當日解鎖狀態
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchBubbles();
        checkDailyDive(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * 處理使用者送出觀點
   */
  const handleSend = async (content: string, parentId: string | null = null, category: string = "Blue") => {
    if (!session?.user?.id) return;

    const xPosition = Math.random() * 100;
    const yPosition = Math.random() * 100;

    const { error } = await supabase.from("bubbles").insert([
      {
        content: content,
        category: category,
        x_position: xPosition,
        y_position: yPosition,
        user_id: session.user.id,
        parent_id: parentId,
      },
    ]);

    if (error) {
      console.error("氣泡寫入失敗:", error.message);
      alert("⚠️ 氣泡回傳失敗，請稍後再試。");
    } else {
      console.log("氣泡已成功寫入資料庫");

      // 同步機制
      if (!parentId) {
        fetchBubbles();
        setIsUnlocked(true); // 完成今日潛入，解鎖所有功能
      }

      if (session.user.is_anonymous) {
        alert("這筆思考已紀錄！由於你是以訪客身分登入，建議註冊 Email 以永久保存你的肺活量與資料。");
      } else {
        alert("泡泡已浮起");
      }
    }
  };

  /**
   * 根據當前視圖渲染對應的內容
   * DiveView 需要佔滿全螢幕，其他視圖暫時顯示建置中提示
   */
  const renderContentView = () => {
    switch (currentView) {
      case "dive":
        // 每日潛入：顯示今日泡泡或精選主泡泡
        return <DiveView bubbles={bubbles} onSend={handleSend} isUnlocked={isUnlocked} />;
      case "lobby":
        // 泡泡大廳：顯示所有海域的主泡泡
        return <LobbyView bubbles={bubbles} onSend={handleSend} isUnlocked={isUnlocked} />;
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
        return <DiveView bubbles={bubbles} onSend={handleSend} />;
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
