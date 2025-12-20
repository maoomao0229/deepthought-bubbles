"use client";

import React, { useState } from "react";
import { Waves, Search, Filter } from "lucide-react";

interface LobbyViewProps {
    bubbles: any[];
}

/**
 * 泡泡大廳視圖
 * 顯示所有海域的主泡泡，支援分類過濾
 */
const LobbyView = ({ bubbles }: LobbyViewProps) => {
    const [activeCategory, setActiveCategory] = useState<string>("all");

    // 分類清單
    const categories = [
        { id: "all", name: "所有海域" },
        { id: "blue", name: "時事海域" },
        { id: "philosophy", name: "心理海域" },
        { id: "culture", name: "文化海域" },
    ];

    // 根據分類過濾泡泡
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
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-700 border border-blue-900 flex items-center justify-center text-[10px] text-white">
                                        鯨
                                    </div>
                                </div>
                                <div className="text-[10px] text-blue-400/40">
                                    12 筆共鳴
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
        </div>
    );
};

export default LobbyView;
