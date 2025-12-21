"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Waves, LayoutGrid, Activity, Fish } from "lucide-react";

export type ViewState = "dive" | "lobby" | "sonar" | "pantry";

interface LiquidTabBarProps {
  currentView: ViewState;
  onChange: (view: ViewState) => void;
  isUnlocked?: boolean;
}

interface MenuItem {
  id: ViewState;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  color: string;
  label: string;
}

const LiquidTabBar: React.FC<LiquidTabBarProps> = ({ currentView, onChange, isUnlocked = false }) => {
  const menus = useMemo<MenuItem[]>(
    () => [
      { id: "dive", icon: Waves, color: "text-green-400", label: "每日潛入" },
      { id: "lobby", icon: LayoutGrid, color: "text-blue-400", label: "氣泡大廳" },
      { id: "sonar", icon: Activity, color: "text-indigo-400", label: "深海聲納" },
      { id: "pantry", icon: Fish, color: "text-yellow-400", label: "我的糧倉" },
    ],
    []
  );

  const activeIndex = menus.findIndex((m) => m.id === currentView);
  const menuRefs = useRef<(HTMLLIElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [indicatorLeft, setIndicatorLeft] = useState(0);

  // 重新計算指示器位置
  useEffect(() => {
    const updateIndicatorPosition = () => {
      if (menuRefs.current[activeIndex] && containerRef.current) {
        const activeItem = menuRefs.current[activeIndex];
        const container = containerRef.current;

        if (activeItem) {
          const itemRect = activeItem.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          // 計算相對於容器的左邊距
          const itemLeftRelative = itemRect.left - containerRect.left;
          // 計算該 Item 的中心點
          const itemCenter = itemLeftRelative + itemRect.width / 2;

          // 設定球體左邊界 (球寬 56px，所以減去 28)
          setIndicatorLeft(itemCenter - 28);
        }
      }
    };

    updateIndicatorPosition();
    window.addEventListener("resize", updateIndicatorPosition);
    // 使用 setTimeout 確保渲染後計算
    const timeoutId = setTimeout(updateIndicatorPosition, 50);
    return () => {
      window.removeEventListener("resize", updateIndicatorPosition);
      clearTimeout(timeoutId);
    };
  }, [activeIndex]);

  const handleTabClick = (viewId: ViewState) => {
    if (!isUnlocked && viewId !== "dive") {
      alert("🌊 潛入深海需要先完成今日的呼吸頻率思考喔！");
      return;
    }
    onChange(viewId);
  };

  // 計算凹陷遮罩的中心點 (球體左側 + 半徑)
  const maskCenter = indicatorLeft + 28;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">

      {/* 導航列容器：高度降為 70px */}
      <div
        ref={containerRef}
        id="main-nav-bar"
        className="relative h-[70px] w-full"
      >

        {/* 1. Bar Background with Indentation (凹陷背景) */}
        {/* 我們使用 CSS Mask 來動態挖洞 */}
        <div
          className="absolute inset-0 w-full h-full bg-[#204a6e] rounded-3xl shadow-2xl transition-all duration-500 ease-out"
          style={{
            // 定義遮罩：背景是黑色(不透明)，中間挖一個透明圓孔
            // 圓孔半徑 38px，稍微比球體大一點點，創造呼吸感
            maskImage: `radial-gradient(circle 38px at ${maskCenter}px 0px, transparent 98%, black 100%)`,
            WebkitMaskImage: `radial-gradient(circle 38px at ${maskCenter}px 0px, transparent 98%, black 100%)`,
          }}
        />

        {/* 2. Floating Active Ball (懸浮球體) */}
        {/* 這顆球代表「跳出來」的 Bar 區塊 */}
        <div
          className="absolute w-[56px] h-[56px] bg-[#204a6e] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] border-[3px] border-[#1a3b59]"
          style={{
            left: `${indicatorLeft}px`,
            top: "-28px", // 讓球體浮在 Bar 上方一半的位置
            transition: "left 0.5s cubic-bezier(0.23, 1, 0.32, 1)", // 彈跳物理質感
          }}
        >
          {/* 這裡是球體內部的裝飾光暈，讓它看起來更有立體感 */}
          <div className="absolute inset-0 rounded-full bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
        </div>

        {/* 3. Icons Layer (圖示層) */}
        <ul className="absolute inset-0 grid grid-cols-4 w-full h-full z-20">
          {menus.map((menu, i) => {
            const isActive = i === activeIndex;
            const isLocked = !isUnlocked && menu.id !== "dive";
            const IconComponent = menu.icon;

            return (
              <li
                key={menu.id}
                ref={(el) => { menuRefs.current[i] = el; }}
                className={`relative h-full flex flex-col items-center justify-center cursor-pointer select-none ${isLocked ? "opacity-40" : ""}`}
                onClick={() => handleTabClick(menu.id)}
              >
                {/* Icon Container */}
                {/* 啟用時：Icon 會往上飛進懸浮球體內 (translate-y-[-28px]) */}
                {/* 未啟用時：Icon 留在 Bar 裡面 */}
                <div
                  className={`relative flex items-center justify-center transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) ${isActive
                    ? "-translate-y-[38px] scale-110" // 往上移動對齊懸浮球
                    : "translate-y-0 text-white/40 hover:text-white/70"
                    }`}
                >
                  <IconComponent
                    size={24}
                    className={`transition-colors duration-300 ${isActive ? menu.color : "text-inherit"}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {isLocked && !isActive && (
                    <div className="absolute -top-1 -right-1 text-[8px] bg-blue-900/80 rounded-full p-0.5">🔒</div>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`absolute bottom-2 text-[10px] font-bold tracking-widest transition-all duration-300 ${isActive
                    ? "opacity-100 translate-y-0 text-white"
                    : "opacity-0 translate-y-2"
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
