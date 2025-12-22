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
// MasonryTrack 可拖曳水平瀑布流軌道元件 (TranslateX)
// ==========================================
interface MasonryTrackProps {
    children: React.ReactNode;
}

const MasonryTrack: React.FC<MasonryTrackProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const [position, setPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const startX = useRef(0);
    const startPosition = useRef(0);
    const velocity = useRef(0);
    const lastX = useRef(0);
    const rafId = useRef<number | null>(null);

    const handleDragStart = (clientX: number) => {
        setIsDragging(true);
        startX.current = clientX;
        startPosition.current = position;
        lastX.current = clientX;
        velocity.current = 0;
        if (rafId.current) cancelAnimationFrame(rafId.current);
    };

    const handleDragMove = (clientX: number) => {
        if (!isDragging) return;
        const diff = clientX - startX.current;
        velocity.current = clientX - lastX.current;
        lastX.current = clientX;

        // 計算邊界
        const trackWidth = trackRef.current?.scrollWidth || 0;
        const containerWidth = containerRef.current?.clientWidth || 0;
        const minPosition = Math.min(0, -(trackWidth - containerWidth + 40)); // 40px 邊距
        const maxPosition = 0;

        let newPosition = startPosition.current + diff;
        // 套用橡皮筋效果 (超出邊界時減速)
        if (newPosition > maxPosition) {
            newPosition = maxPosition + (newPosition - maxPosition) * 0.3;
        } else if (newPosition < minPosition) {
            newPosition = minPosition + (newPosition - minPosition) * 0.3;
        }

        setPosition(newPosition);
    };

    const handleDragEnd = () => {
        setIsDragging(false);

        // 慣性滑動
        const decelerate = () => {
            velocity.current *= 0.92; // 減速係數
            if (Math.abs(velocity.current) < 0.5) {
                // 邊界回彈
                const trackWidth = trackRef.current?.scrollWidth || 0;
                const containerWidth = containerRef.current?.clientWidth || 0;
                const minPosition = Math.min(0, -(trackWidth - containerWidth + 40));
                const maxPosition = 0;

                setPosition(prev => {
                    if (prev > maxPosition) return maxPosition;
                    if (prev < minPosition) return minPosition;
                    return prev;
                });
                return;
            }

            setPosition(prev => {
                const newPos = prev + velocity.current * 2;
                return newPos;
            });
            rafId.current = requestAnimationFrame(decelerate);
        };
        decelerate();
    };

    // Mouse Events
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleDragStart(e.clientX);
    };
    const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
    const handleMouseUp = () => handleDragEnd();
    const handleMouseLeave = () => { if (isDragging) handleDragEnd(); };

    // Touch Events
    const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
    const handleTouchEnd = () => handleDragEnd();

    return (
        <div
            ref={containerRef}
            className="overflow-hidden cursor-grab active:cursor-grabbing select-none relative h-[420px]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                ref={trackRef}
                className="grid grid-rows-[repeat(3,120px)] grid-flow-col gap-4 w-max px-6 items-center"
                style={{
                    transform: `translate3d(${position}px, 0, 0)`,
                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
            >
                {children}
            </div>
        </div>
    );
};

// ==========================================
// BubbleCard 卡片元件 (Horizontal Masonry)
// ==========================================
interface BubbleCardProps {
    bubble: any;
    onClick: () => void;
}

const BubbleCard: React.FC<BubbleCardProps> = ({ bubble, onClick }) => {
    // 產生穩定的隨機寬度 (220px - 400px)，避免 Hydration 不一致
    const cardWidth = React.useMemo(() => {
        if (!bubble.id) return 300;
        const idStr = String(bubble.id);
        const seed = idStr.charCodeAt(0) + (idStr.length > 5 ? idStr.charCodeAt(5) : 0);
        return 220 + (seed % 180);
    }, [bubble.id]);

    return (
        <div
            onClick={onClick}
            style={{ width: `${cardWidth}px`, height: '110px' }}
            className="shrink-0 relative bg-blue-900/40 backdrop-blur-md border border-white/10 rounded-xl p-3 hover:bg-blue-800/50 hover:scale-[1.02] transition-all cursor-pointer shadow-lg group overflow-hidden flex flex-col justify-between"
        >
            {/* Header: Topic + Time */}
            <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-200 rounded border border-blue-500/30 uppercase font-bold whitespace-nowrap">
                    {bubble.topic || "General"}
                </span>
                <span className="text-[9px] text-blue-400/60 font-mono">
                    {bubble.created_at ? new Date(bubble.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
            </div>

            <h3 className="text-white text-xs font-bold leading-tight line-clamp-1 mt-1">
                {bubble.title || "無題"}
            </h3>

            <p className="text-blue-200/70 text-[10px] leading-relaxed line-clamp-2">
                {bubble.content}
            </p>

            {/* Footer Decoration */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-blue-500/0 via-blue-400/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
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

                {/* Header */}
                <div className="fixed top-0 left-0 right-0 z-40 bg-blue-950/40 backdrop-blur-md px-6 py-4 border-b border-white/5 pointer-events-auto">
                    <div className="flex items-center justify-between">
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
                </div>

                {/* Content - Netflix Style Rows */}
                <div className="pt-24 pb-32 space-y-8 overflow-y-auto h-full">
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
                                <MasonryTrack>
                                    {topicBubbles.map((bubble) => (
                                        <BubbleCard
                                            key={bubble.id}
                                            bubble={bubble}
                                            onClick={() => setSelectedBubble(bubble)}
                                        />
                                    ))}
                                </MasonryTrack>
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
