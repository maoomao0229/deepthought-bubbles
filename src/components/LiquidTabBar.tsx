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
      { id: "lobby", icon: LayoutGrid, color: "text-blue-400", label: "泡泡大廳" },
      { id: "pantry", icon: Fish, color: "text-yellow-400", label: "個人頁面" },
      { id: "sonar", icon: Activity, color: "text-indigo-400", label: "深海聲納" },
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

  // SVG Path 生成器：Glassmorphism 圓角矩形 + 液態凹陷 (含邊緣安全裁切)
  const getPath = useCallback((w: number, h: number, x: number) => {
    const r = 24; // 圓角半徑 (降低以獲得更多邊緣空間)
    const holeW = 35; // 凹洞半寬
    const c = 12; // 曲線平滑寬度

    // 1. 計算標準點位置
    const rawLeftStart = x - holeW - c;
    const rawLeftCtrl1 = x - holeW;
    const rawLeftCtrl2 = x - holeW + 10;

    const rawRightCtrl1 = x + holeW - 10;
    const rawRightCtrl2 = x + holeW;
    const rawRightEnd = x + holeW + c;

    // 2. 安全裁切 (修正邊緣問題)
    // 確保沒有點位進入圓角區域 (0~r 或 w-r~w)
    // 當凹洞接近邊緣時會被「擠壓」在牆邊
    const leftStart = Math.max(r, rawLeftStart);
    const leftCtrl1 = Math.max(r, rawLeftCtrl1);
    const leftCtrl2 = Math.max(r, rawLeftCtrl2);

    const rightCtrl1 = Math.min(w - r, rawRightCtrl1);
    const rightCtrl2 = Math.min(w - r, rawRightCtrl2);
    const rightEnd = Math.min(w - r, rawRightEnd);

    // 3. 構建路徑
    return `
      M ${r} 0 
      L ${leftStart} 0 
      C ${leftCtrl1} 0, ${leftCtrl2} ${holeW}, ${x} ${holeW} 
      C ${rightCtrl1} ${holeW}, ${rightCtrl2} 0, ${rightEnd} 0 
      L ${w - r} 0 
      A ${r} ${r} 0 0 1 ${w} ${r} 
      L ${w} ${h - r} 
      A ${r} ${r} 0 0 1 ${w - r} ${h} 
      L ${r} ${h} 
      A ${r} ${r} 0 0 1 0 ${h - r} 
      L 0 ${r} 
      A ${r} ${r} 0 0 1 ${r} 0 Z
    `;
  }, []);

  const h = 70; // Bar 高度
  const pathString = getPath(containerWidth || 400, h, displayX);
  const ballLeft = displayX - 28;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">

      {/* 導航列容器 */}
      <div
        ref={containerRef}
        id="main-nav-bar"
        className="relative h-[70px] w-full"
      >

        {/* 1. Glassmorphism Layer (Frosted Glass with clip-path) */}
        <div
          className="absolute inset-0 w-full h-full bg-blue-900/40 backdrop-blur-xl"
          style={{
            clipPath: `path('${pathString.replace(/\s+/g, ' ').trim()}')`,
          }}
        />

        {/* 2. Border Overlay (SVG Stroke) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${containerWidth || 400} ${h}`}
          preserveAspectRatio="none"
        >
          <path
            d={pathString}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
        </svg>

        {/* 3. Floating Active Ball (Glowing) */}
        <div
          className="absolute w-[56px] h-[56px] bg-blue-500/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-white/20"
          style={{
            left: `${ballLeft}px`,
            top: "-24px",
          }}
        >
          <div className="absolute inset-0 rounded-full bg-linear-to-b from-white/20 to-transparent pointer-events-none" />
        </div>

        {/* 4. Icons Layer */}
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
                    : "translate-y-0 text-white/50 hover:text-white/80"
                    }`}
                >
                  <IconComponent
                    size={24}
                    className={`transition-colors duration-300 drop-shadow-lg ${isActive ? menu.color : "text-inherit"}`}
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
