"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Waves, LayoutGrid, Activity, Fish } from "lucide-react";

// 定義視圖狀態類型並 export
export type ViewState = "dive" | "lobby" | "sonar" | "pantry";

// 定義組件 Props 類型
interface LiquidTabBarProps {
  currentView: ViewState;
  onChange: (view: ViewState) => void;
  isUnlocked?: boolean;
}

// 定義選單項目類型
interface MenuItem {
  id: ViewState;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  color: string;
  label: string;
}

const LiquidTabBar: React.FC<LiquidTabBarProps> = ({ currentView, onChange, isUnlocked = false }) => {
  // 使用 useMemo 優化選單配置，避免每次渲染都重新建立
  const menus = useMemo<MenuItem[]>(
    () => [
      { id: "dive", icon: Waves, color: "text-green-400", label: "每日潛入" },
      { id: "lobby", icon: LayoutGrid, color: "text-blue-400", label: "氣泡大廳" },
      { id: "sonar", icon: Activity, color: "text-indigo-400", label: "深海聲納" },
      { id: "pantry", icon: Fish, color: "text-yellow-400", label: "我的糧倉" },
    ],
    []
  );

  // 找出當前啟用的選單索引
  const activeIndex = menus.findIndex((m) => m.id === currentView);

  // 使用 ref 來獲取每個選單項目的實際 DOM 位置
  const menuRefs = useRef<(HTMLLIElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [indicatorLeft, setIndicatorLeft] = useState(0);

  // 計算圓圈位置：基於實際 DOM 元素的位置
  useEffect(() => {
    const updateIndicatorPosition = () => {
      if (menuRefs.current[activeIndex] && containerRef.current) {
        const activeItem = menuRefs.current[activeIndex];
        const container = containerRef.current;

        if (activeItem) {
          // 獲取選單項目的實際位置
          const itemRect = activeItem.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          // 計算相對於容器的中心位置（減去圓圈寬度的一半）
          const itemCenterX = itemRect.left + itemRect.width / 2 - containerRect.left;
          const circleRadius = 32.5; // 65px / 2

          setIndicatorLeft(itemCenterX - circleRadius);
        }
      }
    };

    // 初始計算
    updateIndicatorPosition();

    // 監聽視窗大小變化，重新計算位置
    window.addEventListener("resize", updateIndicatorPosition);

    // 使用 requestAnimationFrame 確保 DOM 已更新
    const timeoutId = setTimeout(updateIndicatorPosition, 0);

    return () => {
      window.removeEventListener("resize", updateIndicatorPosition);
      clearTimeout(timeoutId);
    };
  }, [activeIndex]);

  const handleTabClick = (viewId: ViewState) => {
    // 每日解鎖邏輯：未解鎖前只能留在「每日潛入」
    if (!isUnlocked && viewId !== "dive") {
      alert("🌊 潛入深海需要先完成今日的呼吸頻率思考喔！");
      return;
    }
    onChange(viewId);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
      {/* 1. SVG Filter Definition (Hidden) */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* 導航列容器 */}
      <div ref={containerRef} id="main-nav-bar" className="relative h-20 w-full transition-transform duration-500 ease-in-out">

        {/* Layer A: Liquid Visuals (Background + Ball) - Apply Filter Here */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ filter: "url(#goo)" }}
        >
          {/* The Bar Shape */}
          <div className="w-full h-full bg-[#204a6e] rounded-3xl" />

          {/* The Moving Ball */}
          <div
            className="absolute w-[65px] h-[65px] bg-[#204a6e] rounded-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              left: `${indicatorLeft}px`,
              top: "-20px", // 調整此值讓球體與本體融合
            }}
          />
        </div>

        {/* Layer B: Content (Icons) - NO FILTER */}
        <ul className="absolute inset-0 grid grid-cols-4 w-full h-full z-10">
          {menus.map((menu, i) => {
            const isActive = i === activeIndex;
            const isLocked = !isUnlocked && menu.id !== "dive";
            const IconComponent = menu.icon;

            return (
              <li
                key={menu.id}
                ref={(el) => {
                  menuRefs.current[i] = el;
                }}
                className={`relative h-full flex flex-col items-center justify-center cursor-pointer group ${isLocked ? "opacity-40" : ""}`}
                onClick={() => handleTabClick(menu.id)}
              >
                {/* 圖標容器：啟用時會向上移動並放大 */}
                <div
                  className={`relative flex items-center justify-center z-20 transition-all duration-500 ease-out ${isActive ? "-translate-y-[28px] scale-110" : "translate-y-0 text-white/50"
                    }`}
                >
                  <IconComponent
                    size={26}
                    className={`transition-colors duration-300 ${isActive ? menu.color : "text-inherit"}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isLocked && !isActive && (
                    <div className="absolute -top-1 -right-1 text-[8px] bg-blue-900/80 rounded-full p-0.5">
                      🔒
                    </div>
                  )}
                </div>

                {/* 標籤文字：啟用時顯示，未啟用時隱藏 */}
                <span
                  className={`absolute bottom-3 text-[10px] font-bold tracking-widest transition-all duration-500 delay-100 ${isActive ? "opacity-100 translate-y-0 text-white" : "opacity-0 translate-y-4"
                    }`}
                >
                  {menu.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default LiquidTabBar;

