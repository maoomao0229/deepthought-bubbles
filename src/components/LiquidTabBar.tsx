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
    <div className="absolute bottom-0 w-full px-4 pb-6 z-40">
      {/* 導航列容器：使用深藍色背景，圓角設計，加上陰影效果 */}
      <div ref={containerRef} className="relative h-20 bg-[#204a6e] rounded-t-2xl rounded-b-3xl flex items-center shadow-2xl px-6">
        {/* 液態指示器：使用動態計算的實際 DOM 位置確保完美置中 */}
        <div
          className="magic-indicator absolute w-[65px] h-[65px] bg-blue-900 rounded-full border-4 border-[#204a6e] transition-all duration-500 ease-out shadow-[0_4px_12px_0_rgba(0,0,0,0.15)]"
          style={{
            left: `${indicatorLeft}px`,
            top: "-32px",
          }}
        ></div>

        {/* 選單列表：使用 Grid 布局，平均分配四個選項 */}
        <ul className="grid grid-cols-4 w-full h-full relative z-10">
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
                {/* 圖標容器：啟用時會向上移動並放大，確保在圓圈內置中 */}
                <div
                  className={`relative flex items-center justify-center z-20 transition-all duration-500 ease-out ${isActive ? "-translate-y-[32px] scale-110" : "translate-y-0 text-white/50"
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

