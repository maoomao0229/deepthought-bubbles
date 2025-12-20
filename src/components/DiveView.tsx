"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { Move, X, Feather, Waves } from "lucide-react";

// ==========================================
// Types & Interfaces
// ==========================================

/**
 * 種子議題介面定義
 * 用於表示在無限畫布上顯示的思想氣泡
 */
interface SeedTopic {
  id: string;
  x: number; // 畫布上的 X 座標（相對於中心點）
  y: number; // 畫布上的 Y 座標（相對於中心點）
  title: string; // 議題標題
  category: "philosophy" | "ocean" | "thought" | "depth"; // 分類
  speed: number; // 磁力互動速度係數（0-1）
  content: string; // 詳細內容描述
  size: "sm" | "md" | "lg"; // 氣泡大小
}

/**
 * 分類配置介面
 * 定義不同分類對應的顏色與名稱
 */
interface CategoryConfig {
  name: string;
  color: string; // Tailwind 文字顏色類別
  bg: string; // Tailwind 背景漸層類別
}

/**
 * 深度配置介面
 * 定義不同思考深度對應的標籤與顏色
 */
interface DepthConfig {
  label: string;
  color: string; // Tailwind 文字/背景顏色類別
}

// ==========================================
// Mock Data - 假資料
// ==========================================

/**
 * 種子議題假資料
 * 生成 7 個與「海洋、思考、哲學」相關的議題
 * 座標分散在畫面中心附近（-200px 到 +200px 範圍）
 */
const SEED_TOPICS: SeedTopic[] = [
  {
    id: "seed-1",
    x: -120,
    y: -80,
    title: "存在的意義",
    category: "philosophy",
    speed: 0.6,
    content: "我們為何存在？這個問題如同深海中的光點，引導我們探索生命的本質。在無邊的意識海域中，每個思考都是對存在的一次探問。",
    size: "md",
  },
  {
    id: "seed-2",
    x: 150,
    y: -60,
    title: "海洋的記憶",
    category: "ocean",
    speed: 0.5,
    content: "海洋承載著地球的記憶，每一滴海水都見證過歷史的流轉。當我們潛入深海，是否也在觸碰那些被遺忘的時光？",
    size: "lg",
  },
  {
    id: "seed-3",
    x: -80,
    y: 100,
    title: "思想的深度",
    category: "thought",
    speed: 0.7,
    content: "思考如同潛水，越深入越能發現隱藏的真相。表面的波瀾只是開始，真正的智慧藏在深處。",
    size: "sm",
  },
  {
    id: "seed-4",
    x: 180,
    y: 120,
    title: "時間的流動",
    category: "philosophy",
    speed: 0.4,
    content: "時間如水流，看似線性卻充滿迴旋。過去、現在、未來在思考中交織，形成獨特的時間維度。",
    size: "md",
  },
  {
    id: "seed-5",
    x: -200,
    y: 40,
    title: "深海的啟示",
    category: "depth",
    speed: 0.8,
    content: "深海中的生物適應了極端的環境，它們的存在提醒我們：生命總能找到出路，即使在最黑暗的時刻。",
    size: "sm",
  },
  {
    id: "seed-6",
    x: 60,
    y: -150,
    title: "意識的海洋",
    category: "thought",
    speed: 0.5,
    content: "每個人的意識都是一片獨特的海洋，思想在其中流動、碰撞、融合。當我們分享思考，就像氣泡升向海面。",
    size: "lg",
  },
  {
    id: "seed-7",
    x: -150,
    y: -120,
    title: "哲學的潛行",
    category: "philosophy",
    speed: 0.6,
    content: "哲學不是答案的集合，而是問題的探索。每一次潛行都是對未知的勇敢嘗試，每一次浮起都帶著新的理解。",
    size: "md",
  },
];

// ==========================================
// Helper Functions
// ==========================================

/**
 * 取得分類對應的配置（顏色與名稱）
 * 根據不同的分類回傳對應的 Tailwind 顏色類別
 * 
 * @param category - 議題分類
 * @returns 分類配置物件，包含名稱、文字顏色、背景漸層
 */
const getCategoryConfig = (category: SeedTopic["category"]): CategoryConfig => {
  switch (category) {
    case "philosophy":
      return {
        name: "哲學",
        color: "text-indigo-200",
        bg: "from-indigo-500/20 to-indigo-700/30",
      };
    case "ocean":
      return {
        name: "海洋",
        color: "text-blue-200",
        bg: "from-blue-500/20 to-blue-700/30",
      };
    case "thought":
      return {
        name: "思考",
        color: "text-green-200",
        bg: "from-green-500/20 to-green-700/30",
      };
    case "depth":
      return {
        name: "深度",
        color: "text-yellow-200",
        bg: "from-yellow-500/20 to-yellow-700/30",
      };
    default:
      return {
        name: "未知",
        color: "text-blue-200",
        bg: "from-blue-500/20 to-blue-700/30",
      };
  }
};

/**
 * 計算思考深度
 * 根據輸入文字長度判斷思考的深度層級
 * 
 * @param text - 使用者輸入的文字
 * @returns 深度層級（0-4，數字越大表示思考越深入）
 */
const calculateDepth = (text: string): number => {
  const length = text.trim().length;
  if (length === 0) return 0;
  if (length < 20) return 1; // 淺層
  if (length < 50) return 2; // 中層
  if (length < 100) return 3; // 深層
  return 4; // 極深層
};

/**
 * 取得深度對應的配置（標籤與顏色）
 * 根據思考深度回傳對應的視覺標籤
 * 
 * @param depth - 思考深度層級（0-4）
 * @returns 深度配置物件，包含標籤文字與顏色類別
 */
const getDepthConfig = (depth: number): DepthConfig => {
  switch (depth) {
    case 0:
      return {
        label: "表面",
        color: "bg-blue-500/20 text-blue-300",
      };
    case 1:
      return {
        label: "淺層",
        color: "bg-green-500/20 text-green-300",
      };
    case 2:
      return {
        label: "中層",
        color: "bg-indigo-500/20 text-indigo-300",
      };
    case 3:
      return {
        label: "深層",
        color: "bg-yellow-500/20 text-yellow-300",
      };
    case 4:
      return {
        label: "極深",
        color: "bg-yellow-700/30 text-yellow-200",
      };
    default:
      return {
        label: "未知",
        color: "bg-blue-500/20 text-blue-300",
      };
  }
};

// ==========================================
// 子視圖元件 (Sub-Views)
// ==========================================

/**
 * 每日潛入視圖元件
 * 提供無限畫布與拖曳探索功能，使用者可以拖曳畫布並點選氣泡進入詳細視圖
 * 
 * @param onSend - 當使用者提交思考內容時的回呼函式
 */
const DiveView = ({ onSend }: { onSend: (content: string) => void }) => {
  const [selectedTopic, setSelectedTopic] = useState<SeedTopic | null>(null);

  // 歡迎訊息狀態管理
  const [showWelcome, setShowWelcome] = useState(true); // 控制歡迎訊息顯示
  const [isFading, setIsFading] = useState(false); // 控制漸淡動畫狀態

  // 畫布位移狀態
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  // 互動狀態 Refs
  const isPointerDown = useRef(false);
  const isDragging = useRef(false);
  const startDragClientPos = useRef({ x: 0, y: 0 }); // 用於計算是否移動
  const startPanOffset = useRef({ x: 0, y: 0 }); // 用於計算新位置

  const containerRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<(HTMLDivElement | null)[]>([]);

  // 拖曳邏輯
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    isPointerDown.current = true;
    isDragging.current = false;

    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    startDragClientPos.current = { x: clientX, y: clientY };
    startPanOffset.current = {
      x: clientX - panPosition.x,
      y: clientY - panPosition.y,
    };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    // 處理拖曳 (Pan)
    if (isPointerDown.current) {
      // 檢查移動距離
      const moveDist = Math.sqrt(
        Math.pow(clientX - startDragClientPos.current.x, 2) +
        Math.pow(clientY - startDragClientPos.current.y, 2)
      );

      if (moveDist > 5) {
        isDragging.current = true;
      }

      setPanPosition({
        x: clientX - startPanOffset.current.x,
        y: clientY - startPanOffset.current.y,
      });
      return;
    }

    // 處理磁力 (Magnetic) - 僅在非按下且非觸控裝置時
    if ("touches" in e) return;

    bubblesRef.current.forEach((bubble) => {
      if (!bubble) return;

      const speedAttr = bubble.getAttribute("data-speed");
      const speed = speedAttr ? parseFloat(speedAttr) : 0.5;

      const rect = bubble.getBoundingClientRect();
      const bubbleCenterX = rect.left + rect.width / 2;
      const bubbleCenterY = rect.top + rect.height / 2;

      const deltaX = clientX - bubbleCenterX;
      const deltaY = clientY - bubbleCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const INTERACTION_RANGE = 200;

      if (distance < INTERACTION_RANGE) {
        const moveX = deltaX * speed * 0.15;
        const moveY = deltaY * speed * 0.15;
        bubble.style.transform = `translate(${moveX}px, ${moveY}px)`;
      } else {
        bubble.style.transform = `translate(0px, 0px)`;
      }
    });
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    // 延遲重置，確保 Click 事件讀取時狀態正確
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  };

  const handleBubbleClick = (topic: SeedTopic) => {
    // 只有在非拖曳狀態下才觸發
    if (!isDragging.current) {
      setSelectedTopic(topic);
    }
  };

  // 處理歡迎訊息點擊（點擊空白處漸淡消失）
  const handleWelcomeClick = () => {
    if (!showWelcome || isFading) return; // 如果已經隱藏或正在動畫中，不處理

    setIsFading(true); // 開始漸淡動畫

    // 300ms 後完全隱藏（動畫時長）
    setTimeout(() => {
      setShowWelcome(false);
      setIsFading(false);
    }, 300);
  };

  // 全域 MouseUp 監聽以確保拖曳結束
  useEffect(() => {
    const handleGlobalUp = () => {
      isPointerDown.current = false;
      setTimeout(() => (isDragging.current = false), 50);
    };
    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("touchend", handleGlobalUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("touchend", handleGlobalUp);
    };
  }, []);

  return (
    <div className="h-full relative overflow-hidden bg-blue-900/50">
      {/* 1. 歡迎訊息層 (初次進入時顯示，點擊後漸淡消失) */}
      {showWelcome && (
        <div
          className={`
            fixed inset-0 z-50 flex items-center justify-center
            bg-blue-900/80 backdrop-blur-xl
            transition-opacity duration-300 ease-out
            ${isFading ? "opacity-0" : "opacity-100"}
            cursor-pointer
          `}
          onClick={handleWelcomeClick}
        >
          <div className="text-center px-6 py-8 pointer-events-none">
            <h2 className="text-2xl md:text-3xl font-light text-blue-100 leading-relaxed drop-shadow-lg mb-4">
              歡迎，座頭鯨。
              <br />
              潛入海中<span className="text-yellow-300 font-medium">捕捉知識</span>。
            </h2>
            <p className="text-xs text-blue-300/80 mt-4 tracking-widest flex justify-center items-center gap-2">
              <Move size={12} className="animate-pulse" />
              點擊任意處開始狩獵
            </p>
          </div>
        </div>
      )}

      {/* 2. World 層 (可拖曳畫布) - 歡迎訊息消失後才顯示 */}
      <div
        className={`
          w-full h-full
          ${showWelcome ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}
          transition-opacity duration-300
        `}
      >
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <div
            className="absolute top-1/2 left-1/2 w-0 h-0 transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
            }}
          >
            {SEED_TOPICS.map((topic, index) => (
              <div
                key={topic.id}
                className="absolute"
                style={{
                  left: `${topic.x}px`,
                  top: `${topic.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <TopicBubble
                  ref={(el) => {
                    bubblesRef.current[index] = el;
                  }}
                  topic={topic}
                  onClick={() => handleBubbleClick(topic)}
                />
              </div>
            ))}

            {/* 裝飾性背景元素 */}
            <div className="absolute top-[-304px] left-[-200px] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute top-[100px] left-[200px] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />
          </div>
        </div>
      </div>

      {/* 3. 互動 Modal */}
      {selectedTopic && (
        <DiveModal
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onSend={(content) => {
            onSend(content);
            setTimeout(() => setSelectedTopic(null), 1500);
          }}
        />
      )}
    </div>
  );
};

// ==========================================
// 子元件 (Sub-Components)
// ==========================================

/**
 * 獨立氣泡元件
 * 使用 ForwardRef 以支援磁力互動邏輯
 * 
 * @param topic - 種子議題資料
 * @param onClick - 點擊事件處理函式
 */
interface TopicBubbleProps {
  topic: SeedTopic;
  onClick: () => void;
}

const TopicBubble = forwardRef<HTMLDivElement, TopicBubbleProps>(
  ({ topic, onClick }, ref) => {
    const catConfig = getCategoryConfig(topic.category);

    const sizeClasses = {
      sm: "w-24 h-24 text-[10px]",
      md: "w-32 h-32 text-xs",
      lg: "w-40 h-40 text-sm",
    };

    return (
      <div
        ref={ref}
        data-speed={topic.speed}
        className="relative group cursor-pointer p-2 z-10 hover:z-20 transition-transform duration-300 ease-out"
        // 使用標準 onClick，由父層控制是否觸發 (依據 isDragging)
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <div
          className={`
        ${sizeClasses[topic.size]}
        rounded-full flex flex-col items-center justify-center text-center p-3
        backdrop-blur-xl bg-gradient-to-br ${catConfig.bg}
        border ${catConfig.color.replace("text-", "border-").replace("200", "500").replace("100", "400")}/30
        shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
        transition-all duration-500
        hover:scale-105
        animate-float
      `}
        >
          <span
            className={`block font-bold mb-1 ${catConfig.color} opacity-80 uppercase tracking-widest text-[9px]`}
          >
            {catConfig.name.substring(0, 2)}
          </span>
          <h3 className="font-medium text-blue-50 leading-tight px-1 drop-shadow-md select-none">
            {topic.title}
          </h3>
        </div>
      </div>
    );
  }
);
TopicBubble.displayName = "TopicBubble";

/**
 * 全螢幕輸入 Modal
 * 當使用者點選氣泡時顯示，提供詳細內容與輸入介面
 * 
 * @param topic - 選中的種子議題
 * @param onClose - 關閉 Modal 的回呼函式
 * @param onSend - 提交內容的回呼函式
 */
const DiveModal = ({
  topic,
  onClose,
  onSend,
}: {
  topic: SeedTopic;
  onClose: () => void;
  onSend: (val: string) => void;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const catConfig = getCategoryConfig(topic.category);
  const depth = calculateDepth(inputValue);
  const depthConfig = getDepthConfig(depth);

  // 掛載時鎖定捲動
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setIsSubmitted(true);
    onSend(inputValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-blue-900/80 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />

      {/* 內容卡片 */}
      <div
        className="
        relative w-full max-w-lg bg-blue-900/90 backdrop-blur-2xl 
        border border-white/20 shadow-2xl rounded-4xl 
        flex flex-col items-center text-center overflow-hidden
        animate-scale-up p-6 md:p-8
      "
      >
        {/* Header */}
        <div className="mb-6 w-full relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-2 rounded-full hover:bg-white/10 text-blue-200 transition-colors"
          >
            <X size={24} />
          </button>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 ${catConfig.color} mb-3`}
          >
            <Feather size={12} />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              {catConfig.name}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {topic.title}
          </h2>
        </div>

        {/* Content */}
        <div className="w-full bg-blue-900/40 rounded-xl p-4 border border-white/5 mb-6 text-left">
          <p className="text-blue-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {topic.content}
          </p>
        </div>

        {/* Interaction Area */}
        {!isSubmitted ? (
          <div className="w-full space-y-4 animate-fade-in">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="在此刻，寫下你的想法..."
                className="w-full h-32 bg-blue-950/30 rounded-xl p-4 text-gray-50 placeholder-blue-400/40 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-white/10 leading-relaxed transition-all"
                autoFocus
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none">
                <span className={`text-[10px] px-2 py-1 rounded-full ${depthConfig.color}`}>
                  {depthConfig.label}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className={`w-full py-3 rounded-full text-base font-bold tracking-wide transition-all duration-300 shadow-lg ${inputValue.trim()
                ? "bg-linear-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white transform hover:scale-[1.02]"
                : "bg-blue-800 text-blue-500 cursor-not-allowed opacity-70"
                }`}
            >
              發送氣泡
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 animate-fade-in gap-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
              <Waves size={32} className="text-green-300 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white">氣泡已釋放</h3>
            <p className="text-blue-200 text-sm">你的聲音已匯入意識海域</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiveView;

