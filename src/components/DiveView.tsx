"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { Move, X, Feather, Waves } from "lucide-react";

// ==========================================
// Types & Interfaces
// ==========================================

/**
 * 種子議題介面定義
 */
interface SeedTopic {
  id: string;
  x: number; // 畫布上的 X 座標
  y: number; // 畫布上的 Y 座標
  title: string;
  category: "philosophy" | "ocean" | "thought" | "depth";
  speed: number;
  content: string;
  size: "sm" | "md" | "lg";
}

interface CategoryConfig {
  name: string;
  color: string;
  bg: string;
}

interface DepthConfig {
  label: string;
  color: string;
}

// ==========================================
// Helper Functions
// ==========================================

const getCategoryConfig = (category: SeedTopic["category"]): CategoryConfig => {
  switch (category) {
    case "philosophy":
      return { name: "哲學", color: "text-indigo-200", bg: "from-indigo-500/20 to-indigo-700/30" };
    case "ocean":
      return { name: "海洋", color: "text-blue-200", bg: "from-blue-500/20 to-blue-700/30" };
    case "thought":
      return { name: "思考", color: "text-green-200", bg: "from-green-500/20 to-green-700/30" };
    case "depth":
      return { name: "深度", color: "text-yellow-200", bg: "from-yellow-500/20 to-yellow-700/30" };
    default:
      return { name: "海洋", color: "text-blue-200", bg: "from-blue-500/20 to-blue-700/30" };
  }
};

const calculateDepth = (text: string): number => {
  const length = text.trim().length;
  if (length === 0) return 0;
  if (length < 20) return 1;
  if (length < 50) return 2;
  if (length < 100) return 3;
  return 4;
};

const getDepthConfig = (depth: number): DepthConfig => {
  switch (depth) {
    case 0: return { label: "表面", color: "bg-blue-500/20 text-blue-300" };
    case 1: return { label: "淺層", color: "bg-green-500/20 text-green-300" };
    case 2: return { label: "中層", color: "bg-indigo-500/20 text-indigo-300" };
    case 3: return { label: "深層", color: "bg-yellow-500/20 text-yellow-300" };
    case 4: return { label: "極深", color: "bg-yellow-700/30 text-yellow-200" };
    default: return { label: "未知", color: "bg-blue-500/20 text-blue-300" };
  }
};

// ==========================================
// 子元件 (Sub-Components)
// ==========================================

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
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <div className={`
          ${sizeClasses[topic.size]}
          rounded-full flex flex-col items-center justify-center text-center p-3
          backdrop-blur-xl bg-linear-to-br ${catConfig.bg}
          border ${catConfig.color.replace("text-", "border-").replace("200", "500")}/30
          shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
          transition-all duration-500 hover:scale-105 animate-float
        `}>
          <span className={`block font-bold mb-1 ${catConfig.color} opacity-80 uppercase tracking-widest text-[9px]`}>
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

const DiveModal = ({ topic, onClose, onSend }: { topic: SeedTopic; onClose: () => void; onSend: (val: string) => void; }) => {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const catConfig = getCategoryConfig(topic.category);
  const depth = calculateDepth(inputValue);
  const depthConfig = getDepthConfig(depth);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setIsSubmitted(true);
    onSend(inputValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-xl animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-blue-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-4xl flex flex-col items-center text-center overflow-hidden animate-scale-up p-6 md:p-8">
        <div className="mb-6 w-full relative">
          <button onClick={onClose} className="absolute -top-2 -right-2 p-2 rounded-full hover:bg-white/10 text-blue-200 transition-colors">
            <X size={24} />
          </button>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 ${catConfig.color} mb-3`}>
            <Feather size={12} />
            <span className="text-[10px] font-bold tracking-widest uppercase">{catConfig.name}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{topic.title}</h2>
        </div>
        <div className="w-full bg-blue-900/40 rounded-xl p-4 border border-white/5 mb-6 text-left">
          <p className="text-blue-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{topic.content}</p>
        </div>
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
                <span className={`text-[10px] px-2 py-1 rounded-full ${depthConfig.color}`}>{depthConfig.label}</span>
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

// ==========================================
// 主要視圖元件 (Main View)
// ==========================================

const DiveView = ({ bubbles = [], onSend }: { bubbles?: any[], onSend: (content: string) => void }) => {
  const [selectedTopic, setSelectedTopic] = useState<SeedTopic | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  const isPointerDown = useRef(false);
  const isDragging = useRef(false);
  const startDragClientPos = useRef({ x: 0, y: 0 });
  const startPanOffset = useRef({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<(HTMLDivElement | null)[]>([]);

  const mappedTopics: SeedTopic[] = bubbles.map((b) => ({
    id: b.id,
    x: (b.x_position - 50) * 8,
    y: (b.y_position - 50) * 8,
    title: b.content.substring(0, 10) + (b.content.length > 10 ? "..." : ""),
    category: (b.category?.toLowerCase() as any) || "ocean",
    speed: 0.4 + Math.random() * 0.4,
    content: b.content,
    size: b.content.length > 50 ? "lg" : b.content.length > 20 ? "md" : "sm",
  }));

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    isPointerDown.current = true;
    isDragging.current = false;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    startDragClientPos.current = { x: clientX, y: clientY };
    startPanOffset.current = { x: clientX - panPosition.x, y: clientY - panPosition.y };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    if (isPointerDown.current) {
      const moveDist = Math.sqrt(Math.pow(clientX - startDragClientPos.current.x, 2) + Math.pow(clientY - startDragClientPos.current.y, 2));
      if (moveDist > 5) isDragging.current = true;
      setPanPosition({ x: clientX - startPanOffset.current.x, y: clientY - startPanOffset.current.y });
      return;
    }
    if ("touches" in e) return;
    bubblesRef.current.forEach((bubble) => {
      if (!bubble) return;
      const speed = parseFloat(bubble.getAttribute("data-speed") || "0.5");
      const rect = bubble.getBoundingClientRect();
      const deltaX = clientX - (rect.left + rect.width / 2);
      const deltaY = clientY - (rect.top + rect.height / 2);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < 200) {
        bubble.style.transform = `translate(${deltaX * speed * 0.15}px, ${deltaY * speed * 0.15}px)`;
      } else {
        bubble.style.transform = `translate(0px, 0px)`;
      }
    });
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    setTimeout(() => { isDragging.current = false; }, 50);
  };

  const handleWelcomeClick = () => {
    if (!showWelcome || isFading) return;
    setIsFading(true);
    setTimeout(() => { setShowWelcome(false); setIsFading(false); }, 300);
  };

  useEffect(() => {
    const handleGlobalUp = () => { isPointerDown.current = false; setTimeout(() => (isDragging.current = false), 50); };
    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("touchend", handleGlobalUp);
    return () => { window.removeEventListener("mouseup", handleGlobalUp); window.removeEventListener("touchend", handleGlobalUp); };
  }, []);

  return (
    <div className="h-full relative overflow-hidden bg-blue-900/50">
      {showWelcome && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-blue-900/80 backdrop-blur-xl transition-opacity duration-300 ease-out ${isFading ? "opacity-0" : "opacity-100"} cursor-pointer`} onClick={handleWelcomeClick}>
          <div className="text-center px-6 py-8 pointer-events-none">
            <h2 className="text-2xl md:text-3xl font-light text-blue-100 leading-relaxed drop-shadow-lg mb-4">歡迎，座頭鯨。<br />潛入海中<span className="text-yellow-300 font-medium">捕捉知識</span>。</h2>
            <p className="text-xs text-blue-300/80 mt-4 tracking-widest flex justify-center items-center gap-2"><Move size={12} className="animate-pulse" />點擊任意處開始狩獵</p>
          </div>
        </div>
      )}
      <div className={`w-full h-full ${showWelcome ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"} transition-opacity duration-300`}>
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" onMouseDown={handlePointerDown} onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp} onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}>
          <div className="absolute top-1/2 left-1/2 w-0 h-0 transition-transform duration-75 ease-out" style={{ transform: `translate(${panPosition.x}px, ${panPosition.y}px)` }}>
            {mappedTopics.map((topic, index) => (
              <div key={topic.id} className="absolute" style={{ left: `${topic.x}px`, top: `${topic.y}px`, transform: "translate(-50%, -50%)" }}>
                <TopicBubble ref={(el) => { bubblesRef.current[index] = el; }} topic={topic} onClick={() => !isDragging.current && setSelectedTopic(topic)} />
              </div>
            ))}
            <div className="absolute top-[-304px] left-[-200px] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute top-[100px] left-[200px] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />
          </div>
        </div>
      </div>
      {selectedTopic && <DiveModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} onSend={(content) => { onSend(content); setTimeout(() => setSelectedTopic(null), 1500); }} />}
    </div>
  );
};

export default DiveView;
