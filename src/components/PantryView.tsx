"use client";

import React, { useState } from "react";
import { Share2 } from "lucide-react";

interface PantryViewProps {
    user?: any;
}

const PantryView: React.FC<PantryViewProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'bubbles' | 'replies' | 'saved'>('bubbles');

    // Mock User Data (Fallbacks)
    const displayName = user?.user_metadata?.name || "深海旅人";
    const username = user?.email?.split('@')[0] || "deep_thinker";
    const bio = "正在尋找思想的迴響...";

    return (
        <div className="w-full h-full pt-20 pb-32 px-4 overflow-y-auto no-scrollbar font-sans">
            {/* 1. Profile Card */}
            <div className="bg-blue-950/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-8 shadow-xl animate-fade-in relative overflow-hidden">
                {/* Decor: light leak */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />

                <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-linear-to-tr from-blue-400 to-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.5)] border-2 border-white/20 flex items-center justify-center text-2xl font-bold text-white">
                            {displayName[0]}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-wide">{displayName}</h2>
                            <p className="text-blue-300 text-xs font-mono mb-2">@{username}</p>
                            <p className="text-blue-100/80 text-sm max-w-[200px] leading-relaxed">{bio}</p>
                        </div>
                    </div>
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group">
                        <Share2 size={18} className="text-blue-200 group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Sonar Stats Placeholder */}
                <div className="mt-6 p-3 bg-black/20 rounded-xl border border-white/5 flex gap-4 items-center overflow-hidden relative group cursor-default">
                    <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-blue-500/10 blur-xl group-hover:w-full transition-all duration-1000" />
                    <div className="z-10 text-xs text-blue-300 flex items-center gap-4 w-full">
                        <span className="opacity-70">📡 聲納分析</span>
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-white font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> 哲學 45%
                        </span>
                        <span className="text-white font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> 生活 30%
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Tabs */}
            <div className="flex border-b border-white/10 mb-6 sticky top-0 bg-[#050B1A]/80 backdrop-blur-xl z-20 -mx-4 px-4 pt-4 pb-0">
                {(['bubbles', 'replies', 'saved'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 pb-3 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        {tab === 'bubbles' && '發布'}
                        {tab === 'replies' && '回覆'}
                        {tab === 'saved' && '收藏'}

                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-full shadow-[0_0_10px_#60A5FA]" />
                        )}
                    </button>
                ))}
            </div>

            {/* 3. Content Area */}
            <div className="grid grid-cols-1 gap-4 min-h-[300px] animate-slide-up">
                {/* Mock Content */}
                <div className="text-center text-white/20 py-10 flex flex-col items-center justify-center gap-4">
                    {/* Static Bubble Cards for Demo */}
                    {activeTab === 'bubbles' && (
                        <>
                            <div className="w-full bg-blue-900/20 border border-white/5 p-4 rounded-2xl text-left">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">哲學</span>
                                    <span className="text-[10px] text-blue-400/50">2025/12/20</span>
                                </div>
                                <h3 className="text-white font-bold text-sm mb-1">思考的本質是什麼？</h3>
                                <p className="text-blue-100/60 text-xs line-clamp-2">當我們在思考的時候，是誰在觀察這個思考？</p>
                            </div>
                            <div className="w-full bg-blue-900/20 border border-white/5 p-4 rounded-2xl text-left">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] bg-green-500/10 text-green-300 px-2 py-0.5 rounded border border-green-500/20">生活</span>
                                    <span className="text-[10px] text-blue-400/50">2025/12/18</span>
                                </div>
                                <h3 className="text-white font-bold text-sm mb-1">今天的咖啡好苦</h3>
                                <p className="text-blue-100/60 text-xs line-clamp-2">也許這就是成長的味道吧，不得不吞下的苦澀。</p>
                            </div>
                        </>
                    )}

                    {activeTab !== 'bubbles' && (
                        <p className="text-xs tracking-widest uppercase opacity-50">
                            {activeTab === 'replies' && "尚無回覆紀錄"}
                            {activeTab === 'saved' && "尚無收藏氣泡"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PantryView;
