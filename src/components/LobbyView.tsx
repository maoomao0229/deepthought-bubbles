"use client";

import React, { useState, useEffect } from "react";
import { Waves, Search, Filter, X, Send, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface LobbyViewProps {
    bubbles: any[];
    onSend: (content: string, parentId?: string | null, category?: string) => Promise<void>;
}

/**
 * 泡泡大廳視圖
 * 顯示所有海域的主泡泡，支援分類過濾與深度回覆
 */
const LobbyView = ({ bubbles, onSend }: LobbyViewProps) => {
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [selectedBubble, setSelectedBubble] = useState<any | null>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 分類清單
    const categories = [
        { id: "all", name: "所有海域" },
        { id: "blue", name: "時事海域" },
        { id: "philosophy", name: "心理海域" },
        { id: "culture", name: "文化海域" },
    ];

    /**
     * 抓取選中氣泡的所有回覆
     */
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

    /**
     * 發送回覆邏輯
     * 統一使用父組件傳入的 onSend 以維持邏輯一致性（含訪客提示與同步機制）
     */
    const handleSendReply = async () => {
        if (!replyContent.trim() || !selectedBubble || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // 傳遞內容、父 ID 以及繼承主泡泡的分類
            await onSend(replyContent, selectedBubble.id, selectedBubble.category);
            setReplyContent("");
            fetchReplies(selectedBubble.id); // 成功後重新整理回覆列表
        } catch (err) {
            console.error("回覆發送過程出錯:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 根據分類過濾主泡泡
    const filteredBubbles = activeCategory === "all"
        ? bubbles
        : bubbles.filter(b => b.category?.toLowerCase() === activeCategory);

    return (
        <div className="w-full h-full bg-blue-900/40 backdrop-blur-sm overflow-y-auto pb-24">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-blue-900/60 backdrop-blur-md px-6 py-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Waves className="text-blue-400" />
                        意識大廳
                    </h1>
                    <div className="p-2 bg-white/5 rounded-full text-blue-300">
                        <Search size={20} />
                    </div>
                </div>

                {/* 分類切換 */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all
                ${activeCategory === cat.id
                                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-white/5 text-blue-300 hover:bg-white/10"
                                }
              `}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bubble Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBubbles.length > 0 ? (
                    filteredBubbles.map((bubble) => (
                        <div
                            key={bubble.id}
                            onClick={() => setSelectedBubble(bubble)}
                            className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md uppercase tracking-widest font-bold">
                                    {bubble.category || "General"}
                                </span>
                                <span className="text-[10px] text-blue-400/60">
                                    {new Date(bubble.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-blue-50 text-sm leading-relaxed line-clamp-3 mb-4 font-light">
                                {bubble.content}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-700 border border-blue-900 flex items-center justify-center text-[10px] text-white">
                                        鯨
                                    </div>
                                    <span className="text-[10px] text-blue-300/60">獵手</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-blue-400/40">
                                    <MessageSquare size={10} />
                                    <span>對話中</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <Filter className="text-blue-300/30" />
                        </div>
                        <p className="text-blue-300/50 text-sm">目前該海域尚無氣泡浮起</p>
                    </div>
                )}
            </div>

            {/* Reply Thread Drawer/Modal */}
            {selectedBubble && (
                <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center p-0 md:p-4">
                    <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md" onClick={() => setSelectedBubble(null)} />

                    <div className="relative w-full max-w-2xl bg-blue-900/90 backdrop-blur-2xl border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
                        {/* Modal Header */}
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

                        {/* Modal Content - Scrollable Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                            {/* Host Bubble */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 uppercase font-bold">
                                        主泡泡
                                    </span>
                                </div>
                                <p className="text-lg text-white font-light leading-relaxed">
                                    {selectedBubble.content}
                                </p>
                                <div className="text-[10px] text-blue-400/60 pb-4 border-b border-white/5">
                                    發佈於 {new Date(selectedBubble.created_at).toLocaleString()}
                                </div>
                            </div>

                            {/* Replies List */}
                            <div className="space-y-6">
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
                            </div>
                        </div>

                        {/* Reply Input Area - Fixed at Bottom */}
                        <div className="p-4 bg-blue-950/50 border-t border-white/10 backdrop-blur-md">
                            <div className="relative flex items-end gap-2 bg-white/5 rounded-2xl p-2 focus-within:bg-white/10 transition-colors border border-white/5">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="輸入你的共鳴..."
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
                                按下發送以匯入意識流
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LobbyView;
