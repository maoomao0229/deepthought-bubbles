"use client";

import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import DiveView from "@/components/DiveView";
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

  // 解鎖狀態 (今日是否已潛入)
  const [isUnlocked, setIsUnlocked] = useState(false);

  // 管理當前視圖狀態
  const [currentView, setCurrentView] = useState<ViewState>("dive");

  // 泡泡資料狀態
  const [bubbles, setBubbles] = useState<any[]>([]);
  // 大廳專用：所有歷史泡泡
  const [allBubbles, setAllBubbles] = useState<any[]>([]);

  /**
   * 檢查解鎖狀態：當前使用者今天是否有任何紀錄
   */
  const checkUnlockStatus = async (userId: string) => {
    // 使用本地時間判定今天是否存在紀錄 (避免 UTC 換日誤差)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    const { data, error } = await supabase
      .from("bubbles")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", todayStart)
      .lt("created_at", tomorrowStart)
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
    // [MODIFIED] 主題分批抓取模式 (Topic-Based Ratio Fetching)
    // 解決單一查詢可能只抓到最新特定主題的問題，確保首頁有多樣性
    const PER_TOPIC_COUNT = 5; // 每個主題各抓 5 篇，總池子約 30 篇

    try {
      // 平行發送 6 個請求 (Batch Fetching)
      const promises = TOPIC_LIST.map((topic) =>
        supabase
          .from("bubbles")
          .select("*")
          .is("parent_id", null) // 只抓主氣泡
          .eq("topic", topic) // 鎖定特定主題
          .order("created_at", { ascending: false }) // 抓該主題最新的
          .limit(PER_TOPIC_COUNT)
      );

      const results = await Promise.all(promises);

      // 合併資料
      let combinedBubbles: any[] = [];
      results.forEach(({ data, error }) => {
        if (!error && data) {
          combinedBubbles = [...combinedBubbles, ...data];
        }
      });

      // 全局洗牌並取出前 20 則
      // 這樣既保證了首頁有多個主題，每次重新整理順序又不同
      const finalBubbles = shuffleArray(combinedBubbles).slice(0, 20);

      setBubbles(finalBubbles);
    } catch (err) {
      console.error("Unexpected error fetching bubbles:", err);
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
        checkUnlockStatus(session.user.id); // 查驗解鎖狀態
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchBubbles();
        checkUnlockStatus(session.user.id);
      } else {
        setIsUnlocked(false);
        setBubbles([]);
      }
    });

    return () => subscription.unsubscribe(); return () => subscription.unsubscribe();
  }, []);

  /**
   * 當切換至 Lobby 時，抓取所有泡泡資料
   */
  useEffect(() => {
    if (currentView === "lobby") {
      const fetchAllBubbles = async () => {
        const { data, error } = await supabase
          .from("bubbles")
          .select("*")
          .is("parent_id", null) // [關鍵修正] 只抓沒有父層的主氣泡
          .order("created_at", { ascending: false });

        if (error) {
          console.error("抓取所有泡泡失敗:", error.message);
        } else if (data) {
          setAllBubbles(data);
        }
      };
      fetchAllBubbles();
    }
  }, [currentView]);

  /**
   * 處理使用者送出觀點
   */
  const handleSend = async (
    content: string,
    parentId: string | null = null,
    topic: string | null = null,
    title: string | null = null
  ) => {
    if (!session?.user?.id) return;

    const xPosition = Math.random() * 100;
    const yPosition = Math.random() * 100;

    // 計算深度等級 (Backend Logic)
    let depthLevel = "Surface";
    const t = topic || "";
    if (["哲學", "議題"].includes(t)) depthLevel = "Depth";
    else if (["時事", "科普"].includes(t)) depthLevel = "Midzone";
    else depthLevel = "Surface";

    const { error } = await supabase.from("bubbles").insert([
      {
        content: content,
        topic: topic,
        title: title,
        x_position: xPosition,
        y_position: yPosition,
        user_id: session.user.id,
        parent_id: parentId,
        depth_level: depthLevel,
      },
    ]);

    if (error) {
      console.error("氣泡寫入失敗:", error.message);
      alert("⚠️ 氣泡回傳失敗，請稍後再試。");
    } else {
      console.log("氣泡已成功寫入資料庫");

      // 同步機制：只要發送成功就解鎖
      setIsUnlocked(true);
      fetchBubbles();

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
        // 泡泡大廳：顯示所有海域的主泡泡 (使用 allBubbles)
        return <LobbyView bubbles={allBubbles} onSend={handleSend} isUnlocked={isUnlocked} />;
      case "sonar":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-blue-300 text-lg">深海聲納 - 建置中</p>
          </div>
        );
      case "pantry":
        return <PantryView user={session?.user} />;
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

  // Cast to any to avoid prop type errors (library types mismatch)
  // @ts-ignore
  const ShaderGradientAny = ShaderGradient as any;

  // 已登入：顯示主要內容
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Global Background Shader */}
      <div className="fixed inset-0 -z-50 pointer-events-none" style={{ position: 'fixed' }}>
        <ShaderGradientCanvas
          // @ts-ignore
          importedFiber={{ ...fiber, ...drei, ...reactSpring }}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <ShaderGradientAny
            animate="on"
            axesHelper="off"
            brightness={1.2}
            cAzimuthAngle={180}
            cDistance={3.2}
            cPolarAngle={90}
            cameraZoom={2.8}
            color1="#5B8BB4"
            color2="#54B39E"
            color3="#FFDFB3"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="on"
            lightType="3d"
            pixelDensity={1}
            positionX={-1.4}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
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
      <LiquidTabBar currentView={currentView} onChange={setCurrentView} isUnlocked={isUnlocked} />
    </div>
  );
}
