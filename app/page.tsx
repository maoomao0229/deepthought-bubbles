"use client";

import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import DiveView from "@/components/DiveView";
import SonarView from "@/components/SonarView";
import LiquidTabBar, { ViewState } from "@/components/LiquidTabBar";
import AuthView from "@/components/AuthView";
import LobbyView from "@/components/LobbyView";
import PantryView from "@/components/PantryView";
import { ShaderGradientCanvas, ShaderGradient } from "shadergradient";
import * as reactSpring from "@react-spring/three";
import * as drei from "@react-three/drei";
import * as fiber from "@react-three/fiber";
import { LogOut } from "lucide-react";

/**
 * 首頁元件
 * 整合身分驗證、導航欄與各視圖內容，提供完整的 App 體驗
 */
/**
 * 輔助函式：洗牌演算法 (Fisher-Yates Shuffle)
 * 用於從大量氣泡中隨機選取顯示內容
 */
const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// [Config] 定義主題列表
const TOPIC_LIST = ["科普", "生活", "時事", "奇想", "哲學", "議題"];

export default function Home() {
  // 身分驗證狀態
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 視圖與資料狀態
  const [currentView, setCurrentView] = useState<ViewState>("dive");
  const [bubbles, setBubbles] = useState<any[]>([]); // DiveView 用的隨機/精選氣泡
  const [allBubbles, setAllBubbles] = useState<any[]>([]); // LobbyView 用的完整歷史
  const [isUnlocked, setIsUnlocked] = useState(false);

  // 導航欄隱藏狀態 (Focus Mode)
  const [isNavHidden, setIsNavHidden] = useState(false);

  // 初始化與監聽 Auth 狀態
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 檢查每日解鎖狀態
  const checkUnlockStatus = async () => {
    if (!session?.user) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Local time start of day

    const { data } = await supabase
      .from("bubbles")
      .select("id")
      .eq("user_id", session.user.id)
      .gte("created_at", startOfDay.toISOString()) // 注意：Supabase 存 UTC，這裡可能會有時區誤差，但在 MVP 可接受
      .limit(1);

    if (data && data.length > 0) {
      setIsUnlocked(true);
    }
  };

  // 獲取氣泡資料
  const fetchBubbles = async () => {
    // 1. 取得所有歷史氣泡 (給 Lobby)
    const { data: allData, error } = await supabase
      .from("bubbles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bubbles:", error);
      return;
    }
    setAllBubbles(allData || []);

    // 2. 準備 DiveView 資料 (包含部分隨機性)
    if (allData) {
      // 過濾出主氣泡 (非回覆)
      const mainBubbles = allData.filter((b: any) => !b.parent_id);
      // 簡單洗牌
      setBubbles(shuffleArray(mainBubbles));
    }
  };

  // 資料載入 Effect
  useEffect(() => {
    if (session) {
      fetchBubbles();
      checkUnlockStatus();
    }
  }, [session]);

  // 處理發送氣泡/回覆
  const handleSend = async (content: string, parentId?: string | null, topic?: string | null, title?: string | null) => {
    if (!session?.user) return;

    // 隨機座標 (0-100)
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;

    const { error } = await supabase.from("bubbles").insert({
      content,
      parent_id: parentId || null,
      title: title || null,
      topic: topic || "科普",
      user_id: session.user.id,
      x_position: randomX,
      y_position: randomY,
    });

    if (error) {
      console.error("Error sending bubble:", error);
      alert("發送失敗，請稍後再試。");
    } else {
      // 成功發送後：
      // 1. 立即解鎖
      setIsUnlocked(true);
      // 2. 重新獲取資料
      await fetchBubbles();
    }
  };


  const renderContentView = () => {
    switch (currentView) {
      case "dive":
        return <DiveView bubbles={bubbles} onSend={handleSend} isUnlocked={isUnlocked} />;
      case "lobby":
        return <LobbyView bubbles={allBubbles} onSend={handleSend} isUnlocked={isUnlocked} />;
      case "sonar":
        return <SonarView user={session?.user} />;
      case "pantry":
        return <PantryView user={session?.user} onEditingChange={setIsNavHidden} />;
      default:
        return <DiveView bubbles={bubbles} onSend={handleSend} isUnlocked={isUnlocked} />;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-blue-200">
        載入中...
      </div>
    );
  }

  // 未登入顯示 AuthView
  if (!session) {
    return <AuthView />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Global Background Shader */}
      <div className="fixed inset-0 -z-50 pointer-events-none" style={{ position: 'fixed' }}>
        <ShaderGradientCanvas
          // @ts-ignore
          importedFiber={{ ...fiber, ...drei, ...reactSpring }}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <ShaderGradient
            animate="on"
            brightness={1.2}
            cAzimuthAngle={180}
            cDistance={3.2}
            cPolarAngle={90}
            cameraZoom={2.8}
            color1="#5B8BB4"
            color2="#54B39E"
            color3="#FFDFB3"
            envPreset="city"
            grain="on"
            lightType="3d"
            positionX={-1.4}
            positionY={0}
            positionZ={0}
            reflection={0.1}
            rotationX={0}
            rotationY={10}
            rotationZ={50}
            shader="defaults"
            type="waterPlane"
            uAmplitude={1}
            uDensity={1}
            uFrequency={5.5}
            uSpeed={0.01}
            uStrength={1.1}
            uTime={0}
            wireframe={false}
          />
        </ShaderGradientCanvas>
      </div>

      {/* Global Floating Actions - Only for Guest */}
      {session?.user?.is_anonymous && (
        <button
          onClick={() => supabase.auth.signOut()}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 rounded-full backdrop-blur-md text-xs font-bold transition-all group pointer-events-auto"
        >
          <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>終止潛行</span>
        </button>
      )}

      {/* 主要內容區域：根據 currentView 切換顯示 */}
      <div className="w-full h-full relative z-0">
        {renderContentView()}
      </div>

      {/* 導航欄：固定在畫面最底部，z-index 高於內容區域 */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-in-out ${isNavHidden ? 'translate-y-[150%]' : 'translate-y-0'}`}>
        <LiquidTabBar currentView={currentView} onChange={setCurrentView} isUnlocked={isUnlocked} />
      </div>
    </div>
  );
}
