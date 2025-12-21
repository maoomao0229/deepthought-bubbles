"use client";

import React, { useState, useEffect } from "react";
import { Waves, Search, X, Send, MessageSquare, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface LobbyViewProps {
    bubbles: any[];
    onSend: (content: string, parentId?: string | null, category?: string, topic?: string | null, title?: string | null) => Promise<void>;
    isUnlocked?: boolean;
}

/**
 * 偽隨機函數：根據字串種子產生固定的 0~1 小數
 * 確保同一個泡泡 ID 永遠產生相同的隨機位置，解決拖曳閃爍問題
 */
const seededRandom = (seed: string) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return ((h >>> 0) / 4294967296);
};

const LobbyView = ({ bubbles, onSend, isUnlocked = false }: LobbyViewProps) => {
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [selectedBubble, setSelectedBubble] = useState<any | null>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isNewBubbleOpen, setIsNewBubbleOpen] = useState(false);

    // 畫布位置狀態
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const isPointerDown = React.useRef(false);
    const isDragging = React.useRef(false);
    const startDragClientPos = React.useRef({ x: 0, y: 0 });
    const startPanOffset = React.useRef({ x: 0, y: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);
    const rafId = React.useRef<number | null>(null);

    // 泡泡佈局快取
    const [bubbleLayouts, setBubbleLayouts] = useState<Map<string, { x: number, y: number, zIndex: number, floatDelay: number, floatDuration: number }>>(new Map());

    // 初始位置居中
    useEffect(() => {
        setPanPosition({ x: 0, y: 0 });
    }, []);

    // 計算固定佈局 (使用偽隨機確保位置鎖定)
    useEffect(() => {
        if (!bubbles || bubbles.length === 0) return;

        const newLayouts = new Map();
        const results: any[] = [];
        const threshold = 180;

        bubbles.forEach((b, index) => {
            // 固定座標轉換邏輯
            let finalX = (b.x_position - 50) * 16;
            let finalY = (b.y_position - 50) * 16;

            // 碰撞偵測與偏移 (改用 seededRandom)
            let collision = true;
            let attempts = 0;
            // 每個嘗試使用不同的種子後綴 'c1', 'c2'... 確保隨機性不同但固定
            while (collision && attempts < 5) {
                collision = results.some(r => {
                    const dx = r.x - finalX;
                    const dy = r.y - finalY;
                    return Math.sqrt(dx * dx + dy * dy) < threshold;
                });
                if (collision) {
                    const rngX = seededRandom(b.id + 'x' + attempts);
                    const rngY = seededRandom(b.id + 'y' + attempts);
                    finalX += (rngX - 0.5) * 150;
                    finalY += (rngY - 0.5) * 150;
                }
                attempts++;
            }

            // 計算懸浮動畫參數
            const floatDelay = seededRandom(b.id + 'delay') * 5; // 0-5s 延遲
            const floatDuration = 6 + seededRandom(b.id + 'dur') * 4; // 6-10s 週期

            const layout = {
                x: finalX,
                y: finalY,
                zIndex: (index % 4) + 1,
                floatDelay,
                floatDuration
            };
            newLayouts.set(b.id, layout);
            results.push(layout);
        });

        setBubbleLayouts(newLayouts);
    }, [bubbles]);

    // 分類清單
    const categories = [
        { id: "all", name: "所有海域" },
        { id: "blue", name: "時事海域" },
        { id: "philosophy", name: "心理海域" },
        { id: "culture", name: "文化海域" },
    ];

    useEffect(() => {
        if (selectedBubble) {
            fetchReplies(selectedBubble.id);
        } else {
            setReplies([]);
        }
    }, [selectedBubble]);

    const fetchReplies = async (parentId: string) => {
        const { data, error } = await supabase
            .from("bubbles")
            .select("*")
            .eq("parent_id", parentId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("抓取回覆失敗:", error.message);
        } else {
            setReplies(data || []);
        }
    };

    const handleSendReply = async () => {
        if (!replyContent.trim() || !selectedBubble || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSend(replyContent, selectedBubble.id, selectedBubble.category);
            setReplyContent("");
            fetchReplies(selectedBubble.id);
        } catch (err) {
            console.error("回覆發送過程出錯:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const processedBubbles = React.useMemo(() => {
        const filtered = activeCategory === "all"
            ? bubbles
            : bubbles.filter(b => {
                const cat = b.category?.toLowerCase();
                if (activeCategory === "blue") return cat === "blue" || cat === "時事";
                if (activeCategory === "philosophy") return cat === "philosophy" || cat === "心理";
                if (activeCategory === "culture") return cat === "culture" || cat === "文化";
                return cat === activeCategory;
            });

        return filtered.map(b => {
            const layout = bubbleLayouts.get(b.id) || { x: 0, y: 0, zIndex: 1, floatDelay: 0, floatDuration: 6 };
            return { ...b, ...layout };
        });
    }, [activeCategory, bubbles, bubbleLayouts]);

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        isPointerDown.current = true;
        isDragging.current = false;
        const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        startDragClientPos.current = { x: clientX, y: clientY };
        startPanOffset.current = { x: clientX - panPosition.x, y: clientY - panPosition.y };
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isPointerDown.current) return;

        const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        if (rafId.current) cancelAnimationFrame(rafId.current);

        rafId.current = requestAnimationFrame(() => {
            const moveDist = Math.sqrt(
                Math.pow(clientX - startDragClientPos.current.x, 2) +
                Math.pow(clientY - startDragClientPos.current.y, 2)
            );
            if (moveDist > 5) isDragging.current = true;

            setPanPosition({
                x: clientX - startPanOffset.current.x,
                y: clientY - startPanOffset.current.y
            });
        });
    };

    const handlePointerUp = () => {
        isPointerDown.current = false;
        if (rafId.current) cancelAnimationFrame(rafId.current);
        setTimeout(() => { isDragging.current = false; }, 50);
    };

    useEffect(() => {
        const handleGlobalUp = () => {
            isPointerDown.current = false;
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
        window.addEventListener("mouseup", handleGlobalUp);
        window.addEventListener("touchend", handleGlobalUp);
        return () => {
            window.removeEventListener("mouseup", handleGlobalUp);
            window.removeEventListener("touchend", handleGlobalUp);
        };
    }, []);

    return (
        <div className="w-full h-full bg-[#050B1A] overflow-hidden relative font-sans">
            <div className={`w-full h-full flex flex-col transition-all duration-700 ${!isUnlocked ? "blur-2xl scale-105 opacity-30 select-none pointer-events-none" : "blur-0 scale-100 opacity-100"}`}>
                <div className="absolute top-0 left-0 right-0 z-40 bg-blue-950/40 backdrop-blur-md px-6 py-4 border-b border-white/5 pointer-events-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <Waves className="text-blue-400" size={18} />
                            意識大廳
                        </h1>
                        <button
                            onClick={() => setIsNewBubbleOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-full text-[10px] font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            <Plus size={12} />
                            發起思考
                        </button>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${activeCategory === cat.id ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-white/5 text-blue-300 hover:bg-white/10"
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="w-full h-full cursor-grab active:cursor-grabbing touch-none relative z-10"
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                >
                    <div className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                            transform: `translate3d(${panPosition.x % 40}px, ${panPosition.y % 40}px, 0)`,
                            willChange: 'transform'
                        }}
                    />

                    <div
                        className={`absolute top-1/2 left-1/2 w-0 h-0 transition-transform ${isPointerDown.current ? 'duration-0' : 'duration-75 ease-out'}`}
                        style={{
                            transform: `translate3d(${panPosition.x}px, ${panPosition.y}px, 0)`,
                            willChange: 'transform'
                        }}
                    >
                        {processedBubbles.length > 0 ? (
                            processedBubbles.map((bubble) => (
                                // 外層：負責絕對定位 (Positioning) - 這裡的 transform 只處理中心點偏移
                                <div
                                    key={bubble.id}
                                    style={{
                                        left: `${bubble.x}px`,
                                        top: `${bubble.y}px`,
                                        zIndex: bubble.zIndex,
                                    }}
                                    className="absolute"
                                >
                                    {/* 內層：負責外觀與懸浮動畫 (Animation & Appearance) */}
                                    <div
                                        onClick={(e) => {
                                            if (isDragging.current) return;
                                            e.stopPropagation();
                                            setSelectedBubble(bubble);
                                        }}
                                        style={{
                                            animationDuration: `${bubble.floatDuration}s`,
                                            animationDelay: `${bubble.floatDelay}s`,
                                            animationName: "float-centered",
                                            animationTimingFunction: "ease-in-out",
                                            animationIterationCount: "infinite"
                                        }}
                                        className="group bg-blue-900/40 backdrop-blur-xl hover:bg-blue-800/60 border border-white/10 rounded-2xl p-5 transition-colors hover:scale-105 cursor-pointer min-w-[180px] max-w-[240px] shadow-2xl"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 uppercase tracking-widest font-bold">
                                                {bubble.topic || bubble.category || "General"}
                                            </span>
                                        </div>
                                        <h3 className="text-white text-sm font-bold mb-3 line-clamp-2 leading-snug">
                                            {bubble.title || "探索標題"}
                                        </h3>
                                        <div className="h-px w-6 bg-blue-500/40 mb-3" />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 opacity-60">
                                                <div className="w-5 h-5 rounded-full bg-blue-700 border border-blue-900 flex items-center justify-center text-[8px] text-white">
                                                    鯨
                                                </div>
                                                <span className="text-[8px] text-blue-300">潛者</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[8px] text-blue-400/40 font-bold uppercase tracking-wider">
                                                <MessageSquare size={8} />
                                                <span>對話</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <Search className="text-blue-300/10 mx-auto mb-4" size={48} />
                                <p className="text-blue-300/30 text-xs tracking-widest uppercase">此海域尚無意識浮起</p>
                            </div>
                        )}

                        <div className="absolute top-[-500px] left-[-400px] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                        <div className="absolute top-[200px] left-[300px] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
                    </div>
                </div>
            </div>

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

            {selectedBubble && (
                <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center p-0 md:p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md" onClick={() => setSelectedBubble(null)} />

                    <div className="relative w-full max-w-2xl bg-blue-900/90 backdrop-blur-2xl border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                <span className="text-xs text-blue-200 font-medium tracking-widest">深層對話</span>
                            </div>
                            <button
                                onClick={() => setSelectedBubble(null)}
                                className="p-2 hover:bg-white/5 rounded-full text-blue-300 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 uppercase font-bold">
                                        {selectedBubble.topic || "探索主題"}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    {selectedBubble.title || "無標題的思考"}
                                </h2>
                                <div className="bg-blue-950/40 rounded-2xl p-5 border border-white/5 group">
                                    <p className="text-base text-blue-50 font-light leading-relaxed whitespace-pre-wrap">
                                        {selectedBubble.content}
                                    </p>
                                </div>
                                <div className="text-[10px] text-blue-400/60 pb-4 border-b border-white/5">
                                    發佈於 {new Date(selectedBubble.created_at).toLocaleString()}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {isUnlocked ? (
                                    <>
                                        <h4 className="text-[10px] text-blue-300/40 uppercase tracking-[0.2em] font-bold">
                                            共鳴回覆 ({replies.length})
                                        </h4>

                                        {replies.length > 0 ? (
                                            replies.map((reply) => (
                                                <div key={reply.id} className="flex gap-4 group">
                                                    <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                                                        <Waves size={14} />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                                                                潛水員
                                                            </span>
                                                            <span className="text-[10px] text-blue-400/30">
                                                                {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl rounded-tl-none p-4 text-sm text-blue-50 leading-relaxed font-light">
                                                            {reply.content}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-10 text-center opacity-30">
                                                <p className="text-sm font-light italic">此海域尚無回聲...</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-8 flex flex-col items-center justify-center space-y-6">
                                        <div className="h-px w-full bg-white/5" />
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
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-blue-950/50 border-t border-white/10 backdrop-blur-md">
                            <div className="relative flex items-end gap-2 bg-white/5 rounded-2xl p-2 focus-within:bg-white/10 transition-colors border border-white/5">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={isUnlocked ? "輸入你的共鳴..." : "回應此觀點以解鎖更多回聲..."}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-blue-50 placeholder-blue-400/30 p-2 min-h-[44px] max-h-32 resize-none leading-relaxed"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSendReply}
                                    disabled={!replyContent.trim() || isSubmitting}
                                    className={`
                    p-3 rounded-xl transition-all
                    ${replyContent.trim() && !isSubmitting
                                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
                                            : "bg-white/5 text-blue-400/20 cursor-not-allowed"
                                        }
                  `}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="text-[9px] text-blue-400/40 mt-2 ml-2 tracking-wider">
                                回應將標註為靛色以示區隔
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
                                <input
                                    type="text"
                                    id="lobby-topic"
                                    placeholder="例如：哲學、心理、時事..."
                                    className="w-full bg-blue-950/30 rounded-xl px-4 py-3 text-sm text-gray-50 placeholder-blue-400/20 border border-white/5 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                />
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
                                    await onSend(replyContent, null, "Blue", topicValue, titleValue);
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
