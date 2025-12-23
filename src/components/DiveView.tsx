"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { Move, X, Feather, Waves, Send, MessageSquare, Plus, Bookmark, Fish, ToggleLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ==========================================
// Types & Interfaces
// ==========================================

interface SeedTopic {
  id: string;
  x: number; // 畫布上的 X 座標
  y: number; // 畫布上的 Y 座標
  zIndex: number;
  topic?: string;
  title?: string;
  depthLevel: "Surface" | "Midzone" | "Depth";
  speed: number;
  content: string;
  size: "sm" | "md" | "lg";
}

interface DepthConfig {
  label: string;
  color: string;
}

const BUBBLE_STYLES = {
  Surface: {
    // Modified first gradient to 0.1 opacity
    background: "linear-gradient(0deg, rgba(255, 251, 246, 0.1), rgba(255, 251, 246, 0.1)), radial-gradient(85.64% 85.64% at 20.51% 15.33%, rgba(101, 113, 188, 0.5) 0%, rgba(91, 139, 180, 0) 64.68%), linear-gradient(291.42deg, rgba(159, 193, 221, 0.1) 14%, rgba(0, 0, 0, 0) 73.01%), radial-gradient(47.37% 47.37% at 41.8% 41.02%, rgba(0, 0, 0, 0) 54.81%, rgba(155, 221, 206, 0.1) 100%), rgba(91, 139, 180, 0.4)",
    backgroundBlendMode: "soft-light, plus-lighter, normal, plus-lighter, normal",
  },
  Midzone: {
    // Modified first gradient to 0.2 opacity
    background: "linear-gradient(0deg, rgba(255, 251, 246, 0.2), rgba(255, 251, 246, 0.2)), radial-gradient(85.64% 85.64% at 20.51% 15.33%, rgba(101, 113, 188, 0.5) 0%, rgba(91, 139, 180, 0) 64.68%), radial-gradient(47.37% 47.37% at 41.8% 41.02%, rgba(0, 0, 0, 0) 54.81%, rgba(155, 221, 206, 0.1) 100%), rgba(67, 118, 160, 0.4)",
    backgroundBlendMode: "soft-light, plus-lighter, plus-lighter, normal",
  },
  Depth: {
    // Keep original (Already dark enough)
    background: "radial-gradient(85.64% 85.64% at 20.51% 15.33%, rgba(101, 113, 188, 0.5) 0%, rgba(91, 139, 180, 0) 64.68%), linear-gradient(291.42deg, rgba(159, 193, 221, 0.1) 14%, rgba(0, 0, 0, 0) 73.01%), radial-gradient(47.37% 47.37% at 41.8% 41.02%, rgba(0, 0, 0, 0) 54.81%, rgba(155, 221, 206, 0.1) 100%), rgba(49, 103, 148, 0.4)",
    backgroundBlendMode: "plus-lighter, normal, plus-lighter, normal",
  }
};

// ==========================================
// Helper Functions
// ==========================================

const TOPIC_OPTIONS = ['科普', '生活', '時事', '奇想', '哲學', '議題'];

const calculateDepth = (topic: string): number => {
  if (["生活", "奇想"].includes(topic)) return 0; // Surface
  if (["時事", "科普"].includes(topic)) return 1; // Midzone
  if (["哲學", "議題"].includes(topic)) return 2; // Depth
  return 0; // Default Surface
};

const getDepthConfig = (depth: number): DepthConfig => {
  switch (depth) {
    case 0: return { label: "上層", color: "bg-cyan-200/20 text-cyan-300" };
    case 1: return { label: "中層", color: "bg-blue-500/20 text-blue-300" };
    case 2: return { label: "深層", color: "bg-indigo-900/40 text-indigo-200 border border-indigo-500/30" };
    default: return { label: "上層", color: "bg-cyan-200/20 text-cyan-300" };
  }
};

// 新增 Helper: 偽隨機產生器
const seededRandom = (seed: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) / 4294967296);
};

// ==========================================
// 子元件 (Sub-Components)
// ==========================================

// 多層次複雜陰影 (Flutter 轉換 - 向下投影柔和版)
const COMPLEX_BUBBLE_SHADOW = "0px 23px 25px 0px rgba(0, 0, 0, 0.1), 0px 36px 30px 0px rgba(0, 0, 0, 0.05), 0px 79px 40px 0px rgba(0, 0, 0, 0.02), 0px 2px 1px 0px rgba(0, 0, 0, 0.05)";

interface TopicBubbleProps {
  topic: SeedTopic;
  onClick: () => void;
  isHovered?: boolean;
}

const TopicBubble = forwardRef<HTMLDivElement, TopicBubbleProps>(
  ({ topic, onClick, isHovered }, ref) => {
    // @ts-ignore
    const visualStyle = BUBBLE_STYLES[topic.depthLevel] || BUBBLE_STYLES.Surface;

    const sizeClasses = {
      sm: "w-24 h-24 text-[10px]",
      md: "w-32 h-32 text-xs",
      lg: "w-40 h-40 text-sm",
    };

    return (
      <div
        ref={ref}
        data-speed={topic.speed}
        className="relative group cursor-pointer transition-transform duration-300 ease-out"
        style={{
          transform: isHovered ? "scale(1.15)" : "scale(1)",
          // 外層 z-index 由 DiveView 控制，此處不重複設定以面層級混亂
        }}

      >
        <div className={`
          ${sizeClasses[topic.size]}
          rounded-full flex flex-col items-center justify-center text-center p-4
          backdrop-blur-xl
          shadow-lg 
          transition-all duration-300 animate-float
        `}
          style={{
            ...visualStyle,
            boxShadow: isHovered ? "0 0 40px rgba(255,255,255,0.4)" : COMPLEX_BUBBLE_SHADOW
          }}
        >
          <span className="block font-bold mb-0.5 opacity-90 uppercase tracking-widest text-[10px] md:text-xs text-blue-100/80">
            {topic.topic}
          </span>
          <h3 className="font-bold leading-tight px-1 drop-shadow-md select-none line-clamp-2 text-base text-blue-50">
            {topic.title || "探索思考"}
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
  onSend: (content: string, parentId?: string | null, topic?: string | null, title?: string | null) => Promise<void>;
  isUnlocked: boolean;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [isIdentityVisible, setIsIdentityVisible] = useState(false);

  const depth = calculateDepth(topic.topic || "");
  const depthConfig = getDepthConfig(depth);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    fetchReplies();

    // [Mobile UX] 監聽 Visual Viewport 以解決鍵盤遮擋問題
    const handleResize = () => {
      if (!window.visualViewport) return;
      const inputContainer = document.getElementById('dive-input-container');
      if (inputContainer) {
        // 當鍵盤彈出時，visualViewport height 會變小
        // 我們可以動態調整 bottom 位置
        const offset = window.innerHeight - window.visualViewport.height;
        // 簡單處理：如果 offset > 0 (鍵盤出現)，則將容器 bottom 設為 offset
        // 但因為我們使用 fixed bottom-0，通常瀏覽器會自動推上去，但在某些 iOS 版本需要手動
        // 這裡暫時保留標準 CSS approach (pb-safe)，若無效再開啟此邏輯
        // inputContainer.style.bottom = `${Math.max(0, offset)}px`;
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    return () => {
      document.body.style.overflow = "";
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, [topic.id]);

  const fetchReplies = async () => {
    const { data, error } = await supabase
      .from("bubbles")
      .select("*")
      .eq("parent_id", topic.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      // [Fix] Client-side join
      const repliesWithProfiles = await Promise.all(
        data.map(async (reply) => {
          if (!reply.user_id) return reply;
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url, level')
            .eq('id', reply.user_id)
            .single();
          return { ...reply, profiles: profile };
        })
      );
      setReplies(repliesWithProfiles);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSend(inputValue, topic.id, topic.topic);
      setInputValue("");
      fetchReplies(); // 刷新回覆清單
    } catch (err) {
      console.error("發送失敗:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-xl animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-blue-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-4xl flex flex-col overflow-hidden animate-scale-up max-h-[85vh]">

        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-blue-200`}>
            <Feather size={12} />
            <span className="text-[10px] font-bold tracking-widest uppercase">{topic.topic}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-blue-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
          {/* Main Content */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className={`text-[10px] font-bold tracking-widest uppercase text-blue-200 opacity-60`}>
                {topic.topic}
              </span>
              <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
                {topic.title || "無標題的思考"}
              </h2>
            </div>

            <div className="bg-blue-950/40 rounded-3xl p-6 border border-white/5 group relative">
              <p className="text-blue-50 text-base leading-relaxed whitespace-pre-wrap font-light">
                {topic.content}
              </p>
              {/* Icons Group: Resonance (Bookmark) & Shrimp (Donation) */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="p-2 rounded-full hover:bg-white/5 text-blue-400/40 hover:text-blue-400 transition-colors" title="收藏共鳴">
                  <Bookmark size={18} />
                </button>
                <button className="p-2 rounded-full hover:bg-white/5 text-yellow-500/50 hover:text-yellow-500 transition-colors flex items-center justify-center" title="給予蝦米支持">
                  <img src="/prawn.png" alt="蝦米" className="w-[18px] h-[18px] object-contain opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          </div>

          {/* Replies Thread: 僅在解鎖後顯示 */}
          {isUnlocked ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] text-blue-400/40 font-bold uppercase tracking-[0.2em]">共鳴回響 ({replies.length})</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                {/* Identity Toggle */}
                <button
                  onClick={() => setIsIdentityVisible(!isIdentityVisible)}
                  className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <span className="text-[10px] text-blue-400/60 w-12 text-right">
                    {isIdentityVisible ? "顯示身份" : "匿名"}
                  </span>
                  {isIdentityVisible ? (
                    <img src="/whale.png" alt="顯示身份" className="w-5 h-5 object-contain opacity-80" />
                  ) : (
                    <img src="/tail-of-whale.png" alt="匿名" className="w-5 h-5 object-contain opacity-50" />
                  )}
                </button>
              </div>

              {replies.length > 0 ? (
                <div className="space-y-4">
                  {replies.sort((a, b) => {
                    const getLevel = (content: string) => {
                      const len = content.length;
                      if (len <= 20) return 1; // Surface
                      if (len <= 150) return 2; // Midzone
                      return 3; // Depth
                    };
                    return getLevel(a.content) - getLevel(b.content);
                  }).map((reply) => (
                    <div key={reply.id} className="flex gap-4 animate-fade-in">
                      {/* Anonymous UI: Toggle Icon */}
                      {isIdentityVisible && (
                        <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-scale-up">
                          <Waves size={14} />
                        </div>
                      )}

                      <div className="flex-1 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4">
                        <p className="text-sm text-blue-50 font-light leading-relaxed">{reply.content}</p>

                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[9px] text-blue-400/30">
                            <span className="mr-2 text-blue-300 font-bold">
                              {reply.profiles?.username || 'Unknown Diver'}
                            </span>
                            {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isIdentityVisible && (
                            <span className="text-[9px] text-indigo-300/50">潛水員</span>
                          )}
                        </div>
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
            <div className="py-8 flex flex-col items-center justify-center space-y-6">
              <div className="h-px w-full bg-white/5" />
              <div className="flex flex-col items-center space-y-6 w-full">
                <div className="text-center space-y-2">
                  <h3 className="text-white font-medium">觀測點已鎖定</h3>
                  <p className="text-xs text-blue-300/40 leading-relaxed max-w-[240px]">
                    參與這場跨越時空的意識共振，<br />解鎖更多回聲。
                  </p>
                </div>
                <button
                  onClick={() => document.querySelector('textarea')?.focus()}
                  className="px-8 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-bold transition-all animate-bounce"
                >
                  發表回覆以解鎖
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {/* Input Area: Adjusted for Mobile Keyboard & Safe Area */}
        <div
          id="dive-input-container"
          className="p-4 bg-blue-950/90 border-t border-white/5 backdrop-blur-xl transition-all duration-300 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex items-end gap-3 bg-white/5 rounded-2xl p-3 border border-white/5 focus-within:bg-white/10 transition-colors focus-within:ring-1 focus-within:ring-blue-400/30">
            {/* Shrimp (Donation) Icon Removed */}
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isUnlocked ? "輸入你的見解..." : "回應此觀點以解鎖更多回聲..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-base text-blue-50 placeholder-blue-400/20 p-1 min-h-[44px] max-h-32 resize-none leading-relaxed"
              rows={1}
              style={{ fontSize: '16px' }} // 防止 iOS 自動縮放
            />
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isSubmitting}
              className={`p-3 rounded-xl transition-all min-w-[48px] min-h-[48px] flex items-center justify-center ${inputValue.trim() && !isSubmitting
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
                : "bg-white/5 text-blue-400/20 cursor-not-allowed"
                }`}
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex justify-between items-center mt-2 px-2">
            <p className="text-[10px] text-blue-400/40 tracking-wider">回應將標註為靛色</p>
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
const NewBubbleModal = ({ onClose, onSend }: { onClose: () => void; onSend: (content: string, parentId?: string | null, topic?: string | null, title?: string | null) => Promise<void>; }) => {
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("科普");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const depth = calculateDepth(topic);
  const depthConfig = getDepthConfig(depth);

  const handleSubmit = async () => {
    if (!content.trim() || !topic.trim() || !title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      console.log("Submitting new bubble:", { title, topic });
      await onSend(content, null, topic, title);
      console.log("Bubble submitted successfully");
    } catch (e) {
      console.error("Error submitting bubble:", e);
      // 保留輸入內容讓使用者重試
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center px-4">
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

        <div className="w-full space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-blue-400/60 font-bold uppercase tracking-widest ml-1">主題 Topic</label>
              <label className="text-[10px] text-blue-400/60 font-bold uppercase tracking-widest ml-1">主題 Topic</label>
              <div className="relative">
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-blue-950/30 rounded-xl px-4 py-3 text-sm text-gray-50 border border-white/5 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer"
                >
                  {TOPIC_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-blue-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-300/50">
                  <span className="text-xs">▼</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-blue-400/60 font-bold uppercase tracking-widest ml-1">標題 Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="為你的思考定一個標題..."
                className="w-full bg-blue-950/30 rounded-xl px-4 py-3 text-sm text-gray-50 placeholder-blue-400/20 border border-white/5 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-blue-400/60 font-bold uppercase tracking-widest ml-1">內文 Content</label>
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="在此刻，捕捉你的意識流..."
                  className="w-full h-32 bg-blue-950/30 rounded-2xl p-4 text-gray-50 placeholder-blue-400/20 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/30 border border-white/5 leading-relaxed transition-all"
                />
                <div className="absolute bottom-3 right-3 py-0.5 px-2 rounded-full text-[9px] pointer-events-none transition-colors duration-300" style={{ backgroundColor: depthConfig.color.split(' ')[0] }}>
                  <span className={depthConfig.color.split(' ')[1]}>{depthConfig.label}級思維</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || !topic.trim() || !title.trim() || isSubmitting}
            className={`w-full py-4 rounded-full text-base font-bold tracking-widest transition-all shadow-xl ${content.trim() && topic.trim() && title.trim() && !isSubmitting
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
}: {
  bubbles?: any[],
  onSend: (content: string, parentId?: string | null, topic?: string | null, title?: string | null) => Promise<void>,
  isUnlocked?: boolean,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<SeedTopic | null>(null);
  const [isNewBubbleOpen, setIsNewBubbleOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isPointerDown = useRef(false);
  const isDragging = useRef(false);
  const startDragClientPos = useRef({ x: 0, y: 0 });
  const startPanOffset = useRef({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // If a topic is selected (modal open), add the class to hide nav
    if (selectedTopic || isNewBubbleOpen) {
      document.body.classList.add('nav-hidden');
    } else {
      document.body.classList.remove('nav-hidden');
    }

    // Cleanup on unmount
    return () => document.body.classList.remove('nav-hidden');
  }, [selectedTopic, isNewBubbleOpen]);


  // 使用 useMemo 鎖定計算結果，避免拖曳時重算導致閃爍
  const mappedTopics = React.useMemo(() => {
    const topics: SeedTopic[] = [];
    if (!bubbles) return topics;

    // [Optimize 1] 限制泡泡總數為最多 20 個
    const displayBubbles = bubbles.slice(0, 20);

    displayBubbles.forEach((b, index) => {
      // 基礎座標映射 (0-100 -> 畫布偏移)
      let finalX = (b.x_position - 50) * 8;
      let finalY = (b.y_position - 50) * 8;

      // 碰撞檢查與偏移 (使用偽隨機 seededRandom)
      const threshold = 140; // 稍微加大間距
      let collisionDetected = true;
      let attempts = 0;

      while (collisionDetected && attempts < 5) {
        collisionDetected = topics.some(t => {
          const dx = t.x - finalX;
          const dy = t.y - finalY;
          return Math.sqrt(dx * dx + dy * dy) < threshold;
        });

        if (collisionDetected) {
          // 使用 b.id + attempts 作為種子，確保每次算出來的偏移量都一樣
          const rngX = seededRandom(b.id + 'x' + attempts);
          const rngY = seededRandom(b.id + 'y' + attempts);
          finalX += (rngX - 0.5) * 120;
          finalY += (rngY - 0.5) * 120;
        }
        attempts++;
      }

      topics.push({
        id: b.id,
        x: finalX,
        y: finalY,
        // [Optimize 2] 堆疊層級限制：限制為 3 層 (10, 20, 30)
        zIndex: (index % 3 + 1) * 10,
        topic: b.topic,
        title: b.title,
        depthLevel: ["哲學", "議題"].includes(b.topic) ? "Depth" : ["時事", "科普"].includes(b.topic) ? "Midzone" : "Surface",
        // 固定速度參數
        speed: 0.4 + seededRandom(b.id + 'speed') * 0.4,
        content: b.content,
        size: b.content.length > 80 ? "lg" : b.content.length > 30 ? "md" : "sm",
      });
    });

    return topics;
  }, [bubbles]); // 關鍵：只有 bubbles 資料變動時才重新計算

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
      if (rafId.current) cancelAnimationFrame(rafId.current);

      rafId.current = requestAnimationFrame(() => {
        const moveDist = Math.sqrt(
          Math.pow(clientX - startDragClientPos.current.x, 2) +
          Math.pow(clientY - startDragClientPos.current.y, 2)
        );

        // [FIX] 將閾值從 5 提高到 15，避免點擊微動被誤判為拖曳
        if (moveDist > 15) isDragging.current = true;

        if (isDragging.current) {
          setPanPosition({ x: clientX - startPanOffset.current.x, y: clientY - startPanOffset.current.y });
        }
      });
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
    if (rafId.current) cancelAnimationFrame(rafId.current);
    setTimeout(() => { isDragging.current = false; }, 50);
  };

  const handleWelcomeClick = () => {
    if (!showWelcome || isFading) return;
    setIsFading(true);
    setTimeout(() => { setShowWelcome(false); setIsFading(false); }, 300);
  };

  useEffect(() => {
    const handleGlobalUp = () => {
      isPointerDown.current = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      setTimeout(() => (isDragging.current = false), 50);
    };
    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("touchend", handleGlobalUp);
    return () => { window.removeEventListener("mouseup", handleGlobalUp); window.removeEventListener("touchend", handleGlobalUp); };
  }, []);

  return (
    <div className="h-full relative overflow-hidden bg-transparent font-sans">
      {/* 歡迎界面 (僅在未解鎖或初回顯示) */}
      {showWelcome && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-blue-900/30 backdrop-blur-xl transition-opacity duration-300 ease-out ${isFading ? "opacity-0" : "opacity-100"} cursor-pointer`} onClick={handleWelcomeClick}>
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
          onClick={() => setHoveredId(null)} // 點擊背景重置狀態
        >
          {/* 背景模糊層：未解鎖時增加氛圍感 */}
          {!isUnlocked && !showWelcome && (
            <div className="absolute inset-0 z-0 bg-blue-900/10 backdrop-blur-[1px] pointer-events-none" />
          )}

          {/* 視差圖層渲染 (Deep Parallax Rendering) */}
          {mappedTopics.map((topic, index) => {
            // 視差計算：Z-Index 越大 (越上層)，移動係數越大
            // zIndex 範圍約 1~4
            const parallaxFactor = 0.2 + (topic.zIndex * 0.3); // 0.5x ~ 1.4x 速度差

            // 計算最終顯示位置 (使用 translate3d 啟用 GPU 加速)
            const displayX = topic.x + (panPosition.x * parallaxFactor);
            const displayY = topic.y + (panPosition.y * parallaxFactor);

            // 智慧層級：懸停時強制置頂
            const isHovered = hoveredId === topic.id;
            const currentZIndex = isHovered ? 1000 : topic.zIndex;

            return (
              <div
                key={topic.id}
                className="absolute transition-transform duration-75 ease-out will-change-transform cursor-pointer"
                style={{
                  transform: `translate3d(${displayX}px, ${displayY}px, 0)`,
                  left: "50%",
                  top: "50%",
                  zIndex: currentZIndex
                }}
                onMouseEnter={() => setHoveredId(topic.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => {
                  e.stopPropagation(); // 阻止背景 Click
                  if (isDragging.current) return;

                  // [FIX] 設備邏輯分流：滑鼠直接開啟，手機端首下浮起、次下開啟
                  const isMouse = (e.nativeEvent as PointerEvent).pointerType === 'mouse';

                  if (isMouse || hoveredId === topic.id) {
                    setSelectedTopic(topic);
                  } else {
                    setHoveredId(topic.id);
                  }
                }}
              >
                <div style={{ transform: "translate(-50%, -50%)" }}>
                  <TopicBubble
                    ref={(el) => { bubblesRef.current[index] = el; }}
                    topic={topic}
                    onClick={() => { }} // 點擊邏輯已移至外層 div
                    isHovered={isHovered}
                  />
                </div>
                {!isUnlocked && (
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center">
                    {/* 鎖定狀態遮罩 */}
                  </div>
                )}
              </div>
            );
          })}

          {/* 背景裝飾 (同樣可以套用簡單視差) */}
          <div
            className="absolute top-[-304px] left-[-200px] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10 transition-transform duration-100 ease-out"
            style={{ transform: `translate3d(${panPosition.x * 0.1}px, ${panPosition.y * 0.1}px, 0)` }}
          />
          <div
            className="absolute top-[100px] left-[200px] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none -z-10 transition-transform duration-100 ease-out"
            style={{ transform: `translate3d(${panPosition.x * 0.15}px, ${panPosition.y * 0.15}px, 0)` }}
          />
        </div>
      </div>

      {/* 右下角 FAB: 始終顯示，引導發布 */}
      {!showWelcome && (
        <button
          onClick={() => setIsNewBubbleOpen(true)}
          className={`fixed bottom-24 right-6 z-40 p-5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group animate-fade-in touch-manipulation ${isUnlocked
            ? "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30"
            : "bg-yellow-500 hover:bg-yellow-400 text-blue-900 shadow-yellow-500/40 ring-4 ring-yellow-500/20"
            }`}
          title={isUnlocked ? "釋放新的思考" : "發布今日首個氣泡以解鎖"}
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }} // 簡單的 Safe Area 處理
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
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
          onSend={onSend}
        />
      )}
    </div>
  );
};

export default DiveView;
