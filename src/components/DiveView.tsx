"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { Move, X, Feather, Waves, Send, MessageSquare, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ==========================================
// Types & Interfaces
// ==========================================

interface SeedTopic {
  id: string;
  x: number; // 畫布上的 X 座標
  y: number; // 畫布上的 Y 座標
  title: string;
  category: "philosophy" | "ocean" | "thought" | "depth" | string;
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

const getCategoryConfig = (category: string): CategoryConfig => {
  const cat = category.toLowerCase();
  switch (cat) {
    case "philosophy":
    case "心理":
      return { name: "心理", color: "text-indigo-200", bg: "from-indigo-500/20 to-indigo-700/30" };
    case "blue":
    case "時事":
      return { name: "時事", color: "text-blue-200", bg: "from-blue-500/20 to-blue-700/30" };
    case "culture":
    case "文化":
      return { name: "文化", color: "text-green-200", bg: "from-green-500/20 to-green-700/30" };
    default:
      return { name: "探索", color: "text-blue-200", bg: "from-blue-500/20 to-blue-700/30" };
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
            {catConfig.name}
          </span>
          <h3 className="font-medium text-blue-50 leading-tight px-1 drop-shadow-md select-none line-clamp-2">
            {topic.title}
          </h3>
        </div>
      </div>
    );
  }
);
TopicBubble.displayName = "TopicBubble";

/**
 * 潛入明細 Modal
 * 支援查看主氣泡內容、回覆清單以及發表新回覆
 */
const DiveModal = ({
  topic,
  onClose,
  onSend,
  isUnlocked
}: {
  topic: SeedTopic;
  onClose: () => void;
  onSend: (content: string, parentId?: string | null, category?: string) => Promise<void>;
  isUnlocked: boolean;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);

  const catConfig = getCategoryConfig(topic.category);
  const depth = calculateDepth(inputValue);
  const depthConfig = getDepthConfig(depth);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    fetchReplies();
    return () => { document.body.style.overflow = ""; };
  }, [topic.id]);

  const fetchReplies = async () => {
    const { data, error } = await supabase
      .from("bubbles")
      .select("*")
      .eq("parent_id", topic.id)
      .order("created_at", { ascending: true });

    if (!error) setReplies(data || []);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSend(inputValue, topic.id, topic.category);
      setInputValue("");
      fetchReplies(); // 刷新回覆清單
    } catch (err) {
      console.error("發送失敗:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-xl animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-blue-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-4xl flex flex-col overflow-hidden animate-scale-up max-h-[85vh]">

        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 ${catConfig.color}`}>
            <Feather size={12} />
            <span className="text-[10px] font-bold tracking-widest uppercase">{catConfig.name}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-blue-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
          {/* Main Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">{topic.title}</h2>
            <div className="bg-blue-950/40 rounded-2xl p-5 border border-white/5 group">
              <p className="text-blue-50 text-base leading-relaxed whitespace-pre-wrap font-light">
                {topic.content}
              </p>
            </div>
          </div>

          {/* Replies Thread: 僅在解鎖後顯示 */}
          {isUnlocked ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] text-blue-400/40 font-bold uppercase tracking-[0.2em]">共鳴回響 ({replies.length})</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {replies.length > 0 ? (
                <div className="space-y-4">
                  {replies.map((reply) => (
                    <div key={reply.id} className="flex gap-4 animate-fade-in">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Waves size={14} />
                      </div>
                      <div className="flex-1 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4">
                        <p className="text-sm text-blue-50 font-light leading-relaxed">{reply.content}</p>
                        <span className="text-[9px] text-blue-400/30 mt-2 block">
                          {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 opacity-20 italic text-sm text-blue-200">
                  深海寂靜，正在等待你的共鳴...
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-white/20">
                <MessageSquare size={20} />
              </div>
              <p className="text-[10px] text-blue-400/30 font-bold uppercase tracking-[0.2em] text-center">
                完成今日換氣後<br />即可觀測他人的意識回響
              </p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-blue-950/50 border-t border-white/5 backdrop-blur-md">
          <div className="flex items-end gap-2 bg-white/5 rounded-2xl p-2 border border-white/5 focus-within:bg-white/10 transition-colors">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="輸入你的見解..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-blue-50 placeholder-blue-400/20 p-2 min-h-[44px] max-h-32 resize-none leading-relaxed"
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isSubmitting}
              className={`p-3 rounded-xl transition-all ${inputValue.trim() && !isSubmitting
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
                : "bg-white/5 text-blue-400/20 cursor-not-allowed"
                }`}
            >
              <Send size={18} />
            </button>
          </div>
          <div className="flex justify-between items-center mt-2 px-2">
            <p className="text-[9px] text-blue-400/40 tracking-wider">回應將標註為靛色</p>
            <span className={`text-[9px] px-2 py-0.5 rounded-full ${depthConfig.color}`}>{depthConfig.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 建立新氣泡 Modal
 */
const NewBubbleModal = ({ onClose, onSend }: { onClose: () => void; onSend: (content: string) => Promise<void>; }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const depth = calculateDepth(content);
  const depthConfig = getDepthConfig(depth);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onSend(content);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-xl animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-blue-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-4xl p-8 flex flex-col items-center animate-scale-up">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-blue-200">
          <X size={24} />
        </button>
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
          <Plus size={32} className="text-blue-300" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">釋放新的思考氣泡</h2>
        <p className="text-blue-300/60 text-sm mb-8">主題貼文將漂浮在所有潛水員的視野中</p>

        <div className="w-full space-y-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在此刻，捕捉你的意識流..."
              className="w-full h-40 bg-blue-950/30 rounded-2xl p-5 text-gray-50 placeholder-blue-400/30 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 border border-white/10 leading-relaxed transition-all"
              autoFocus
            />
            <div className="absolute bottom-4 right-4 py-1 px-3 rounded-full text-[10px] pointer-events-none transition-colors duration-300" style={{ backgroundColor: depthConfig.color.split(' ')[0] }}>
              <span className={depthConfig.color.split(' ')[1]}>{depthConfig.label}級思維</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className={`w-full py-4 rounded-full text-base font-bold tracking-widest transition-all shadow-xl ${content.trim() && !isSubmitting
              ? "bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transform hover:scale-[1.02]"
              : "bg-blue-800/50 text-blue-500/50 cursor-not-allowed border border-white/5"
              }`}
          >
            {isSubmitting ? "正在浮出水面..." : "釋放氣泡"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 主要視圖元件 (Main View)
// ==========================================

const DiveView = ({
  bubbles = [],
  onSend,
  isUnlocked = false,
  onLogout
}: {
  bubbles?: any[],
  onSend: (content: string, parentId?: string | null, category?: string) => Promise<void>,
  isUnlocked?: boolean,
  onLogout?: () => void
}) => {
  const [selectedTopic, setSelectedTopic] = useState<SeedTopic | null>(null);
  const [isNewBubbleOpen, setIsNewBubbleOpen] = useState(false);
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
    title: b.content.substring(0, 15) + (b.content.length > 15 ? "..." : ""),
    category: b.category || "ocean",
    speed: 0.4 + Math.random() * 0.4,
    content: b.content,
    size: b.content.length > 80 ? "lg" : b.content.length > 30 ? "md" : "sm",
  }));

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    // 即使未解鎖也允許拖曳與瀏覽
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
    <div className="h-full relative overflow-hidden bg-blue-900/50 font-sans">
      {/* 頂部選單與狀態列 (逃生路徑) */}
      {!showWelcome && (
        <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-40 bg-linear-to-b from-blue-950/60 to-transparent pointer-events-none">
          <div className="flex flex-col gap-1 pointer-events-auto">
            <h1 className="text-white font-bold text-lg tracking-tight">深思氣泡</h1>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
              <span className="text-blue-300/80 text-[9px] font-bold tracking-widest uppercase">
                {isUnlocked ? '已完成今日共鳴' : '尚未潛入海域'}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 text-blue-200/50 hover:text-white text-[9px] tracking-[0.2em] uppercase rounded-xl transition-all active:scale-95 pointer-events-auto"
          >
            終止潛行
          </button>
        </div>
      )}

      {/* 歡迎界面 (僅在未解鎖或初回顯示) */}
      {showWelcome && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-blue-900/80 backdrop-blur-xl transition-opacity duration-300 ease-out ${isFading ? "opacity-0" : "opacity-100"} cursor-pointer`} onClick={handleWelcomeClick}>
          <div className="text-center px-6 py-8 pointer-events-none">
            <h2 className="text-2xl md:text-3xl font-light text-blue-100 leading-relaxed drop-shadow-lg mb-4">
              {isUnlocked ? "歡迎回到呼吸頻率。" : "開始潛入海域。"}
              <br />
              捕捉此刻的<span className="text-yellow-300 font-medium">{isUnlocked ? "深刻共鳴" : "第一抹清醒"}</span>。
            </h2>
            <p className="text-xs text-blue-300/80 mt-4 tracking-widest flex justify-center items-center gap-2">
              <Move size={12} className="animate-pulse" />點擊任意處進入
            </p>
          </div>
        </div>
      )}

      {/* 畫布內容 */}
      <div className={`w-full h-full transition-all duration-700 ${showWelcome ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}>
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
          {/* 背景模糊層：未解鎖時增加氛圍感 */}
          {!isUnlocked && !showWelcome && (
            <div className="absolute inset-0 z-0 bg-blue-900/10 backdrop-blur-[1px] pointer-events-none" />
          )}

          <div className="absolute top-1/2 left-1/2 w-0 h-0 transition-transform duration-75 ease-out" style={{ transform: `translate(${panPosition.x}px, ${panPosition.y}px)` }}>
            {/* 顯示所有泡泡 (不論是否解鎖) */}
            {mappedTopics.map((topic, index) => (
              <div key={topic.id} className="absolute" style={{ left: `${topic.x}px`, top: `${topic.y}px`, transform: "translate(-50%, -50%)" }}>
                <TopicBubble
                  ref={(el) => { bubblesRef.current[index] = el; }}
                  topic={topic}
                  onClick={() => !isDragging.current && setSelectedTopic(topic)}
                />
                {!isUnlocked && (
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center">
                    {/* 可以在這裡加一個鎖定圖標或微弱的光暈 */}
                  </div>
                )}
              </div>
            ))}
            {/* 背景裝飾 */}
            <div className="absolute top-[-304px] left-[-200px] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute top-[100px] left-[200px] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />
          </div>
        </div>
      </div>

      {/* 右下角 FAB: 始終顯示，引導發布 */}
      {!showWelcome && (
        <button
          onClick={() => setIsNewBubbleOpen(true)}
          className={`fixed bottom-24 right-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group animate-fade-in ${isUnlocked
            ? "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30"
            : "bg-yellow-500 hover:bg-yellow-400 text-blue-900 shadow-yellow-500/40 ring-4 ring-yellow-500/20"
            }`}
          title={isUnlocked ? "釋放新的思考" : "發布今日首個氣泡以解鎖"}
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          {!isUnlocked && (
            <span className="absolute -top-12 right-0 bg-yellow-500 text-blue-900 text-[10px] font-bold py-1 px-3 rounded-full whitespace-nowrap shadow-lg animate-bounce">
              釋放新氣泡
            </span>
          )}
        </button>
      )}

      {/* Modals */}
      {selectedTopic && (
        <DiveModal
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onSend={onSend}
          isUnlocked={isUnlocked}
        />
      )}
      {isNewBubbleOpen && (
        <NewBubbleModal
          onClose={() => setIsNewBubbleOpen(false)}
          onSend={(content) => onSend(content, null)}
        />
      )}
    </div>
  );
};

export default DiveView;
