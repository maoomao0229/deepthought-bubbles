"use client";

import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
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

  // 目標位置與動畫位置
  const [targetX, setTargetX] = useState(0);
  const [displayX, setDisplayX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // 計算目標位置
  useEffect(() => {
    const updateTargetPosition = () => {
      if (menuRefs.current[activeIndex] && containerRef.current) {
        const activeItem = menuRefs.current[activeIndex];
        const container = containerRef.current;

        if (activeItem) {
          const itemRect = activeItem.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const itemLeftRelative = itemRect.left - containerRect.left;
          const itemCenter = itemLeftRelative + itemRect.width / 2;
          setTargetX(itemCenter);
          setContainerWidth(containerRect.width);
        }
      }
    };

    updateTargetPosition();
    window.addEventListener("resize", updateTargetPosition);
    const timeoutId = setTimeout(updateTargetPosition, 50);
    return () => {
      window.removeEventListener("resize", updateTargetPosition);
      clearTimeout(timeoutId);
    };
  }, [activeIndex]);

  // 有機動畫 (慢速插值)
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setDisplayX((prev) => {
        const diff = targetX - prev;
        // 0.06 factor 讓動畫非常緩慢且有機
        if (Math.abs(diff) < 0.5) return targetX;
        return prev + diff * 0.06;
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetX]);

  const handleTabClick = (viewId: ViewState) => {
    if (!isUnlocked && viewId !== "dive") {
      alert("🌊 潛入深海需要先完成今日的呼吸頻率思考喔！");
      return;
    }
    onChange(viewId);
  };

  // SVG Path 生成器：使用 Cubic Bezier 實現圓滑凹陷
  const getPath = useCallback((w: number, x: number) => {
    const r = 38; // 凹洞半徑
    const c = 20; // 圓角 fillet 大小
    const h = 70; // Bar 高度

    // 使用 Cubic Bezier (C 指令) 創造更平滑的曲線過渡
    // Q 用於頂部圓角，C 用於凹陷曲線
    return `
      M 0,0 
      L ${x - r - c},0 
      Q ${x - r},0 ${x - r},${c * 0.8} 
      C ${x - r},${r + c * 0.5} ${x + r},${r + c * 0.5} ${x + r},${c * 0.8}
      Q ${x + r},0 ${x + r + c},0 
      L ${w},0 
      L ${w},${h} 
      L 0,${h} 
      Z
    `;
  }, []);

  // 球體左邊界 (寬度 56px，半徑 28px)
  const ballLeft = displayX - 28;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">

      {/* 導航列容器 */}
      <div
        ref={containerRef}
        id="main-nav-bar"
        className="relative h-[70px] w-full"
      >

        {/* 1. SVG Bar Background with Smooth Indentation */}
        <svg
          className="absolute inset-0 w-full h-full drop-shadow-2xl"
          viewBox={`0 0 ${containerWidth || 400} 70`}
          preserveAspectRatio="none"
        >
          <path
            d={getPath(containerWidth || 400, displayX)}
            fill="#204a6e"
          />
        </svg>

        {/* 2. Floating Active Ball */}
        <div
          className="absolute w-[56px] h-[56px] bg-[#204a6e] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] border-[3px] border-[#1a3b59]"
          style={{
            left: `${ballLeft}px`,
            top: "-24px",
          }}
        >
          <div className="absolute inset-0 rounded-full bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
        </div>

        {/* 3. Icons Layer */}
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
                <div
                  className={`relative flex items-center justify-center transition-all duration-500 ease-out ${isActive
                    ? "-translate-y-[34px] scale-110"
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
