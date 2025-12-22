"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Waves, Search, X, Send, MessageSquare, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface LobbyViewProps {
    bubbles: any[];
    onSend: (content: string, parentId?: string | null, topic?: string | null, title?: string | null) => Promise<void>;
    isUnlocked?: boolean;
}

const TOPIC_OPTIONS = ['科普', '生活', '時事', '奇想', '哲學', '議題'];

// ==========================================
// TimelineTrack: 模擬 Plurk 河道 (無限橫向畫布)
// ==========================================
interface TimelineTrackProps {
    children: React.ReactNode;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({ children }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [panX, setPanX] = useState(0);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startPan = useRef(0);
    const velocity = useRef(0);
    const lastMoveTime = useRef(0);
    const rafId = useRef<number | null>(null);

    // Physics constants
    const FRICTION = 0.95;
    const BOUNCE_DAMPING = 0.1; // Spring force when out of bounds
    const DRAG_DAMPING = 1.0;

    const getBounds = () => {
        if (!trackRef.current || !containerRef.current) return { min: 0, max: 0 };
        const contentWidth = trackRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        // minPan should be negative (scrolling left moves content to negative x)
        // If content is smaller than container, minPan is 0
        const minPan = Math.min(0, containerWidth - contentWidth - 40); // 40px padding buffer
        return { min: minPan, max: 0 };
    };

    const handleStart = (clientX: number) => {
        isDragging.current = true;
        startX.current = clientX;
        startPan.current = panX;
        velocity.current = 0;
        lastMoveTime.current = Date.now();
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }
        if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
    };

    const handleMove = (clientX: number) => {
        if (!isDragging.current) return;

        const now = Date.now();
        const dt = now - lastMoveTime.current;
        lastMoveTime.current = now;

        const delta = (clientX - startX.current) * DRAG_DAMPING;
        let newPan = startPan.current + delta;

        // Resistance when pulling out of bounds (Rubber band during drag)
        const { min, max } = getBounds();
        if (newPan > max) {
            newPan = max + (newPan - max) * 0.3;
        } else if (newPan < min) {
            newPan = min + (newPan - min) * 0.3;
        }

        // Calculate velocity (pixels per frame approx)
        if (dt > 0) {
            const movement = newPan - panX; // Immediate movement
            // Smooth velocity tracking
            velocity.current = movement;
        }

        setPanX(newPan);
    };

    const handleEnd = () => {
        isDragging.current = false;
        if (containerRef.current) containerRef.current.style.cursor = 'grab';

        // Start inertia loop
        const loop = () => {
            if (isDragging.current) return;

            const { min, max } = getBounds();
            let currentPan = 0;

            // Getting current state from setter callback to ensure freshness isn't enough, 
            // we need to track it manually or use ref. 
            // Since we setPanX every frame, we can just use the value we are about to calculate.
            // But React state might lag. Let's use a temp variable or verify logic.
            // Actually, best to read the current transform from ref or trust our calculation loop.
            // To be safe, let's just rely on velocity decay and current panX state via functional update?
            // No, purely functional update `setPanX(prev => ...)` is better for physics loop.

            setPanX(prevPan => {
                currentPan = prevPan;
                let nextPan = prevPan + velocity.current;

                // Friction
                velocity.current *= FRICTION;

                // Bounce back logic (Spring)
                if (nextPan > max) {
                    const force = (max - nextPan) * BOUNCE_DAMPING;
                    velocity.current += force;
                    // Apply stronger friction when out of bounds to stop quickly
                    velocity.current *= 0.9;
                } else if (nextPan < min) {
                    const force = (min - nextPan) * BOUNCE_DAMPING;
                    velocity.current += force;
                    velocity.current *= 0.9;
                }

                // Stop condition
                if (Math.abs(velocity.current) < 0.1) {
                    // Snap to bounds if close enough and stopped
                    if (Math.abs(nextPan - max) < 1) nextPan = max;
                    if (Math.abs(nextPan - min) < 1) nextPan = min;

                    // If strictly out of bounds and stopped, force snap (safety)
                    // But the spring logic above should handle it. 
                    // We only stop if velocity is tiny AND we are effectively Inside or Snapped.

                    const isOutOfBounds = nextPan > max + 0.5 || nextPan < min - 0.5;
                    if (!isOutOfBounds) {
                        rafId.current = null;
                        return nextPan; // Stop updating
                    }
                }

                rafId.current = requestAnimationFrame(loop);
                return nextPan;
            });
        };

        rafId.current = requestAnimationFrame(loop);
    };

    // Clean up raf
    useEffect(() => {
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        // Timeline Holder (視窗)
        <div
            ref={containerRef}
            className="relative w-full h-[700px] overflow-hidden cursor-grab active:cursor-grabbing select-none py-24"
            onMouseDown={(e) => handleStart(e.clientX)}
            onMouseMove={(e) => handleMove(e.clientX)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            onTouchEnd={handleEnd}
        >
            {/* Block Content (畫布) */}
            <div
                ref={trackRef}
                className="absolute top-0 left-0 h-full grid grid-rows-[repeat(3,120px)] grid-flow-col gap-y-6 px-10 transition-transform duration-75 ease-out will-change-transform width-max"
                style={{
                    transform: `translate3d(${panX}px, 0, 0)`,
                    width: 'max-content' // 自動撐開寬度
                }}
            >
                {children}
            </div>
        </div>
    );
};

// ==========================================
// BubbleCard: 隨機寬度卡片 (創造錯落感)
// ==========================================
interface BubbleCardProps {
    bubble: any;
    onClick: () => void;
}

const BubbleCard = ({ bubble, onClick }: BubbleCardProps) => {
    // 根據 ID 產生穩定的隨機視覺參數
    const { width, marginRight, translateY } = React.useMemo(() => {
        if (!bubble.id) return { width: 300, marginRight: 20, translateY: 0 };
        const idStr = String(bubble.id);
        const seed = idStr.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

        return {
            width: 260 + (seed % 140),          // 寬度: 260px ~ 400px
            marginRight: 80 + (seed % 240),     // 右邊距: 80px ~ 320px (極大間距變異)
            translateY: -80 + (seed % 240)      // 垂直偏移: -80px ~ +160px (極大垂直浮動)
        };
    }, [bubble.id]);

    return (
        <div
            onClick={onClick}
            style={{
                width: `${width}px`,
                marginRight: `${marginRight}px`,
                transform: `translateY(${translateY}px)`
            }}
            className="shrink-0 h-[110px] relative bg-blue-900/30 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-blue-800/50 hover:scale-[1.02] transition-all shadow-lg cursor-pointer flex flex-col justify-between group overflow-hidden"
        >
            {/* 裝飾：左側光條 */}
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500/20 rounded-r-full" />

            <div className="pl-3 flex justify-between items-center opacity-70 mb-1">
                <span className="text-[10px] bg-blue-500/10 px-2 py-0.5 rounded text-blue-200 border border-blue-500/20 tracking-wider">
                    {bubble.topic || "General"}
                </span>
                <span className="text-[9px] text-blue-400 font-mono">
                    {bubble.created_at ? new Date(bubble.created_at).toLocaleDateString() : ''}
                </span>
            </div>

            <div className="pl-3 flex-1 flex flex-col justify-center min-h-0 w-full overflow-hidden">
                <h3 className="text-white text-sm font-bold truncate leading-tight mb-1">
                    {bubble.title || "無題"}
                </h3>
                <p className="text-blue-100/60 text-xs line-clamp-2 font-light leading-relaxed">
                    {bubble.content}
                </p>
            </div>
        </div>
    );
};

// ==========================================
// LobbyView 主元件
// ==========================================
const LobbyView = ({ bubbles, onSend, isUnlocked = false }: LobbyViewProps) => {
    const [selectedBubble, setSelectedBubble] = useState<any | null>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isNewBubbleOpen, setIsNewBubbleOpen] = useState(false);

    // 根據主題分組氣泡
    const groupedBubbles = TOPIC_OPTIONS.reduce((acc, topic) => {
        acc[topic] = bubbles.filter(b => b.topic === topic);
        return acc;
    }, {} as Record<string, any[]>);

    // 載入回覆
    useEffect(() => {
        if (!selectedBubble) {
            setReplies([]);
            return;
        }
        const fetchReplies = async () => {
            const { data, error } = await supabase
                .from("bubbles")
                .select("*")
                .eq("parent_id", selectedBubble.id)
                .order("created_at", { ascending: true });
            if (!error && data) setReplies(data);
        };
        fetchReplies();
    }, [selectedBubble]);

    // 發送回覆
    const handleSendReply = async () => {
        if (!replyContent.trim() || !selectedBubble || isSubmitting) return;
        setIsSubmitting(true);
        await onSend(replyContent, selectedBubble.id, null, null);
        setReplyContent("");
        // 重新載入回覆
        const { data } = await supabase
            .from("bubbles")
            .select("*")
            .eq("parent_id", selectedBubble.id)
            .order("created_at", { ascending: true });
        if (data) setReplies(data);
        setIsSubmitting(false);
    };

    return (
        <div className="w-full h-full bg-transparent overflow-hidden relative font-sans">
            <div className={`w-full h-full flex flex-col transition-all duration-700 ${!isUnlocked ? "blur-2xl scale-105 opacity-30 select-none pointer-events-none" : "blur-0 scale-100 opacity-100"}`}>

                {/* Header - Simplified */}
                <div className="relative flex items-center justify-center h-16 px-6 z-40 bg-blue-950/40 backdrop-blur-md border-b border-white/5 pointer-events-auto shrink-0">
                    {/* Centered Title */}
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Waves className="text-blue-400" size={18} />
                        泡泡大廳
                    </h1>

                    {/* Right Action Button */}
                    <button
                        onClick={() => setIsNewBubbleOpen(true)}
                        className="absolute right-6 flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-full text-[10px] font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus size={12} />
                        發起思考
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-8">
                    {TOPIC_OPTIONS.map(topic => {
                        const topicBubbles = groupedBubbles[topic];
                        if (!topicBubbles || topicBubbles.length === 0) return null;

                        return (
                            <section key={topic}>
                                <h3 className="text-lg font-bold text-white/80 px-6 mb-4 flex items-center gap-3">
                                    <span className="w-1 h-6 bg-blue-400 rounded-full"></span>
                                    {topic}
                                    <span className="text-xs text-blue-400/50 font-normal">
                                        {topicBubbles.length} 則思考
                                    </span>
                                </h3>
                                <TimelineTrack>
                                    {topicBubbles.map((bubble) => (
                                        <BubbleCard
                                            key={bubble.id}
                                            bubble={bubble}
                                            onClick={() => setSelectedBubble(bubble)}
                                        />
                                    ))}
                                </TimelineTrack>
                            </section>
                        );
                    })}

                    {/* Empty State */}
                    {bubbles.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Search className="text-blue-300/10 mx-auto mb-4" size={48} />
                            <p className="text-blue-300/30 text-xs tracking-widest uppercase">此海域尚無意識浮起</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Locked Overlay */}
            {!isUnlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-30 p-6 animate-fade-in">
                    <div className="bg-blue-900/60 backdrop-blur-2xl border border-white/10 p-10 rounded-4xl max-w-sm w-full shadow-2xl space-y-6 text-center">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-500/30">
                            <span className="text-4xl">🔒</span>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">海域深度鎖定中</h3>
                        <p className="text-blue-300/60 text-sm leading-relaxed">發布一個今日思考主題，即可解鎖意識海域與大廳對話。</p>
                    </div>
                </div>
            )}

            {/* Bubble Detail Modal */}
            {selectedBubble && (
                <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center p-0 md:p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md" onClick={() => setSelectedBubble(null)} />
                    <div className="relative w-full max-w-lg bg-blue-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-t-4xl md:rounded-4xl p-6 md:p-8 max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
                        <button onClick={() => setSelectedBubble(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-blue-200 z-10">
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <span className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 uppercase tracking-widest font-bold">
                                {selectedBubble.topic}
                            </span>
                            <h2 className="text-xl font-bold text-white mt-3 mb-2">{selectedBubble.title}</h2>
                            <p className="text-blue-200/80 text-sm leading-relaxed">{selectedBubble.content}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                            <h4 className="text-xs text-blue-400/60 font-bold uppercase tracking-widest sticky top-0 bg-blue-900/95 py-2">
                                回應 ({replies.length})
                            </h4>
                            {replies.map((reply) => (
                                <div key={reply.id} className="bg-indigo-900/30 backdrop-blur-md border border-indigo-400/20 rounded-2xl p-4">
                                    <p className="text-indigo-100/90 text-sm leading-relaxed">{reply.content}</p>
                                    <div className="flex items-center gap-2 mt-2 opacity-50">
                                        <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[6px] text-white">潛</div>
                                        <span className="text-[8px] text-indigo-300">潛水員</span>
                                    </div>
                                </div>
                            ))}
                            {replies.length === 0 && (
                                <p className="text-blue-400/30 text-xs text-center py-8">尚無回應，成為第一個回覆者</p>
                            )}
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <input
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendReply()}
                                    placeholder="加入這場對話..."
                                    className="flex-1 bg-blue-950/50 rounded-xl px-4 py-3 text-sm text-gray-50 placeholder-blue-400/30 border border-white/5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                                <button
                                    onClick={handleSendReply}
                                    disabled={!replyContent.trim() || isSubmitting}
                                    className={`p-3 rounded-xl transition-all ${replyContent.trim() && !isSubmitting
                                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
                                        : "bg-white/5 text-blue-400/20 cursor-not-allowed"
                                        }`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Bubble Modal */}
            {isNewBubbleOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md" onClick={() => setIsNewBubbleOpen(false)} />
                    <div className="relative w-full max-w-lg bg-blue-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-4xl p-8 flex flex-col items-center animate-scale-up">
                        <button onClick={() => setIsNewBubbleOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-blue-200">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">發起新的思考</h2>
                        <p className="text-blue-300/60 text-sm mb-6 text-center">在此海域釋放一個主氣泡，啟發更多潛水員的共鳴</p>

                        <div className="w-full space-y-4 mb-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-blue-400/60 font-bold uppercase tracking-widest ml-1">主題 Topic</label>
                                <div className="relative">
                                    <select
                                        id="lobby-topic"
                                        className="w-full bg-blue-950/30 rounded-xl px-4 py-3 text-sm text-gray-50 border border-white/5 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer"
                                        defaultValue="科普"
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
                                    id="lobby-title"
                                    placeholder="為你的思考定一個標題..."
                                    className="w-full bg-blue-950/30 rounded-xl px-4 py-3 text-sm text-gray-50 placeholder-blue-400/20 border border-white/5 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                />
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="捕捉你的意識流..."
                                className="w-full h-40 bg-blue-950/30 rounded-2xl p-5 text-gray-50 placeholder-blue-400/30 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 border border-white/10 leading-relaxed transition-all"
                                autoFocus
                            />
                            <button
                                onClick={async () => {
                                    const topicInput = document.getElementById("lobby-topic") as HTMLInputElement;
                                    const titleInput = document.getElementById("lobby-title") as HTMLInputElement;
                                    const topicValue = topicInput?.value || "";
                                    const titleValue = titleInput?.value || "";

                                    if (!replyContent.trim() || !topicValue.trim() || !titleValue.trim() || isSubmitting) return;
                                    setIsSubmitting(true);
                                    await onSend(replyContent, null, topicValue, titleValue);
                                    setReplyContent("");
                                    setIsSubmitting(false);
                                    setIsNewBubbleOpen(false);
                                }}
                                disabled={!replyContent.trim() || isSubmitting}
                                className={`w-full py-4 rounded-full text-base font-bold tracking-widest transition-all shadow-xl shadow-blue-500/10 ${replyContent.trim() && !isSubmitting
                                    ? "bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transform hover:scale-[1.02]"
                                    : "bg-blue-800/50 text-blue-500/50 cursor-not-allowed border border-white/5"
                                    }`}
                            >
                                {isSubmitting ? "正在浮出水面..." : "釋放氣泡"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LobbyView;
