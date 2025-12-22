"use client";

import React, { useState, useEffect } from "react";
import { Share2, Edit2, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface PantryViewProps {
    user?: any;
}

const PantryView: React.FC<PantryViewProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'bubbles' | 'replies' | 'saved'>('bubbles');

    // Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        display_name: "",
        user_id: "",
        bio: ""
    });
    const [loading, setLoading] = useState(true);

    // Fetch Profile Data
    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile({
                        display_name: data.display_name || user.user_metadata?.name || "深海旅人",
                        user_id: data.user_id || user.email?.split('@')[0] || "deep_thinker",
                        bio: data.bio || "正在尋找思想的迴響..."
                    });
                } else {
                    // Fallback to Auth Metadata if no profile exists yet
                    setProfile({
                        display_name: user.user_metadata?.name || "深海旅人",
                        user_id: user.email?.split('@')[0] || "deep_thinker",
                        bio: "正在尋找思想的迴響..."
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                // Fallback on error
                setProfile({
                    display_name: user.user_metadata?.name || "深海旅人",
                    user_id: user.email?.split('@')[0] || "deep_thinker",
                    bio: "正在尋找思想的迴響..."
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    // Handle Save
    const handleSave = async () => {
        if (!user) return;

        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                display_name: profile.display_name,
                user_id: profile.user_id,
                bio: profile.bio,
                updated_at: new Date().toISOString(),
            });

            if (error) throw error;
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("更新失敗，請檢查 User ID 是否重複或是網路問題");
        }
    };

    return (
        <div className="w-full h-full pt-20 pb-32 px-4 overflow-y-auto no-scrollbar font-sans">
            {/* 1. Profile Card */}
            <div className="bg-blue-950/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-8 shadow-xl animate-fade-in relative overflow-hidden transition-all duration-300">
                {/* Decor: light leak */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

                <div className="flex items-start justify-between relative z-10 mb-4">
                    <div className="flex items-start gap-4 flex-1">
                        {/* Avatar */}
                        <div className="shrink-0 w-16 h-16 rounded-full bg-linear-to-tr from-blue-400 to-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.5)] border-2 border-white/20 flex items-center justify-center text-2xl font-bold text-white">
                            {profile.display_name?.[0] || "?"}
                        </div>

                        {/* Info / Edit Form */}
                        <div className="flex-1 min-w-0 space-y-2">
                            {isEditing ? (
                                <div className="space-y-3 animate-fade-in">
                                    <input
                                        value={profile.display_name}
                                        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                                        className="w-full bg-blue-950/50 border border-blue-400/30 rounded px-2 py-1 text-white font-bold tracking-wide focus:outline-none focus:border-blue-400"
                                        placeholder="暱稱 Display Name"
                                    />
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-300/50 text-xs">@</span>
                                        <input
                                            value={profile.user_id}
                                            onChange={(e) => setProfile({ ...profile, user_id: e.target.value })}
                                            className="w-full bg-blue-950/50 border border-blue-400/30 rounded pl-6 pr-2 py-1 text-blue-300 text-xs font-mono focus:outline-none focus:border-blue-400"
                                            placeholder="User ID"
                                        />
                                    </div>
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        className="w-full bg-blue-950/50 border border-blue-400/30 rounded px-2 py-1 text-blue-100/80 text-sm resize-none focus:outline-none focus:border-blue-400"
                                        rows={2}
                                        placeholder="簡介 Bio"
                                    />
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <h2 className="text-xl font-bold text-white tracking-wide truncate">{profile.display_name}</h2>
                                    <p className="text-blue-300 text-xs font-mono mb-2 truncate">@{profile.user_id}</p>
                                    <p className="text-blue-100/80 text-sm leading-relaxed line-clamp-3">{profile.bio}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-full text-xs transition-colors"
                                >
                                    <Save size={12} /> 儲存
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 rounded-full text-xs transition-colors"
                                >
                                    <X size={12} /> 取消
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/30 rounded-full text-xs transition-colors group"
                            >
                                <Edit2 size={12} className="group-hover:scale-110 transition-transform" /> 編輯資料
                            </button>
                        )}
                    </div>

                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group">
                        <Share2 size={16} className="text-blue-200 group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Sonar Stats Placeholder */}
                <div className="mt-4 p-3 bg-black/20 rounded-xl border border-white/5 flex gap-4 items-center overflow-hidden relative group cursor-default">
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
                            <div className="w-full bg-blue-900/20 border border-white/5 p-4 rounded-2xl text-left hover:bg-blue-900/30 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">哲學</span>
                                    <span className="text-[10px] text-blue-400/50">2025/12/20</span>
                                </div>
                                <h3 className="text-white font-bold text-sm mb-1">思考的本質是什麼？</h3>
                                <p className="text-blue-100/60 text-xs line-clamp-2">當我們在思考的時候，是誰在觀察這個思考？</p>
                            </div>
                            <div className="w-full bg-blue-900/20 border border-white/5 p-4 rounded-2xl text-left hover:bg-blue-900/30 transition-colors">
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
