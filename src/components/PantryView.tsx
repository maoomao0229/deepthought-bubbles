"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Share2, Edit2, Save, X, Settings, Camera } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface PantryViewProps {
    user?: any;
}

// ==========================================
// Constants
// ==========================================
// Generate list of 40 personal icons
const AVATAR_LIST = Array.from({ length: 40 }, (_, i) => `/avatars/personal_icon_${i + 1}.png`);

// ==========================================
// TimelineTrack: 模擬 Plurk 河道 (無限橫向畫布)
// Ported from LobbyView.tsx
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
    const BOUNCE_DAMPING = 0.1;
    const DRAG_DAMPING = 1.0;

    const getBounds = () => {
        if (!trackRef.current || !containerRef.current) return { min: 0, max: 0 };
        const contentWidth = trackRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        const minPan = Math.min(0, containerWidth - contentWidth - 40);
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
        const { min, max } = getBounds();
        if (newPan > max) {
            newPan = max + (newPan - max) * 0.3;
        } else if (newPan < min) {
            newPan = min + (newPan - min) * 0.3;
        }
        if (dt > 0) {
            velocity.current = newPan - panX;
        }
        setPanX(newPan);
    };

    const handleEnd = () => {
        isDragging.current = false;
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
        const loop = () => {
            if (isDragging.current) return;
            const { min, max } = getBounds();
            setPanX(prevPan => {
                let nextPan = prevPan + velocity.current;
                velocity.current *= FRICTION;
                if (nextPan > max) {
                    velocity.current += (max - nextPan) * BOUNCE_DAMPING;
                    velocity.current *= 0.9;
                } else if (nextPan < min) {
                    velocity.current += (min - nextPan) * BOUNCE_DAMPING;
                    velocity.current *= 0.9;
                }
                if (Math.abs(velocity.current) < 0.1) {
                    if (Math.abs(nextPan - max) < 1) nextPan = max;
                    if (Math.abs(nextPan - min) < 1) nextPan = min;
                    const isOutOfBounds = nextPan > max + 0.5 || nextPan < min - 0.5;
                    if (!isOutOfBounds) {
                        rafId.current = null;
                        return nextPan;
                    }
                }
                rafId.current = requestAnimationFrame(loop);
                return nextPan;
            });
        };
        rafId.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-[500px] relative overflow-hidden cursor-grab active:cursor-grabbing select-none py-14"
            onMouseDown={(e) => handleStart(e.clientX)}
            onMouseMove={(e) => handleMove(e.clientX)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            onTouchEnd={handleEnd}
        >
            <div
                ref={trackRef}
                className="absolute top-10 left-0 h-[500px] grid grid-rows-[repeat(3,140px)] grid-flow-col gap-y-8 px-10 transition-transform duration-75 ease-out will-change-transform"
                style={{
                    transform: `translate3d(${panX}px, 0, 0)`,
                    width: 'max-content'
                }}
            >
                {children}
            </div>
        </div>
    );
};

// ==========================================
// BubbleCard: 隨機寬度卡片
// Ported from LobbyView.tsx
// ==========================================
interface BubbleCardProps {
    bubble: any;
    onClick: () => void;
}

const BubbleCard = ({ bubble, onClick }: BubbleCardProps) => {
    const { width, marginRight, translateY } = useMemo(() => {
        const idStr = String(bubble.id);
        const seed = idStr.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        return {
            width: 260 + (seed % 140),
            marginRight: 60 + (seed % 180),
            translateY: -40 + (seed % 120)
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
            className="shrink-0 h-[140px] relative bg-blue-900/30 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-blue-800/50 hover:scale-[1.02] transition-all shadow-lg cursor-pointer flex flex-col justify-between group overflow-hidden"
        >
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500/20 rounded-r-full" />
            <div className="pl-3 flex justify-between items-center opacity-70 mb-1">
                <span className="text-[10px] bg-blue-500/10 px-2 py-0.5 rounded text-blue-200 border border-blue-500/20 tracking-wider">
                    {bubble.topic}
                </span>
                <span className="text-[9px] text-blue-400 font-mono">
                    {new Date(bubble.created_at).toLocaleDateString()}
                </span>
            </div>
            <div className="pl-3 flex-1 flex flex-col justify-center min-h-0 w-full overflow-hidden">
                <h3 className="text-white text-sm font-bold truncate leading-tight mb-1">
                    {bubble.title}
                </h3>
                <p className="text-blue-100/60 text-xs line-clamp-2 font-light leading-relaxed">
                    {bubble.content}
                </p>
            </div>
        </div>
    );
};

const PantryView: React.FC<PantryViewProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'bubbles' | 'replies' | 'saved'>('bubbles');

    // Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [profile, setProfile] = useState({
        display_name: "",
        user_id: "",
        bio: "",
        avatar_url: AVATAR_LIST[0]
    });
    // Removed loading state as we rely on effect
    // const [loading, setLoading] = useState(true);

    // Fetch Profile Data
    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            // setLoading(true); // Removed to avoid linting warning for unused
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile({
                        display_name: data.display_name || user.user_metadata?.name || "深海旅人",
                        user_id: data.user_id || user.email?.split('@')[0] || "deep_thinker",
                        bio: data.bio || "正在尋找思想的迴響...",
                        avatar_url: data.avatar_url || AVATAR_LIST[0]
                    });
                } else {
                    setProfile({
                        display_name: user.user_metadata?.name || "深海旅人",
                        user_id: user.email?.split('@')[0] || "deep_thinker",
                        bio: "正在尋找思想的迴響...",
                        avatar_url: AVATAR_LIST[0]
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setProfile({
                    display_name: user.user_metadata?.name || "深海旅人",
                    user_id: user.email?.split('@')[0] || "deep_thinker",
                    bio: "正在尋找思想的迴響...",
                    avatar_url: AVATAR_LIST[0]
                });
            } finally {
                // setLoading(false);
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
                avatar_url: profile.avatar_url,
                updated_at: new Date().toISOString(),
            });

            if (error) throw error;
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("更新失敗，請檢查 User ID 是否重複或是網路問題");
        }
    };

    // Mock Bubbles for demo (different count for each tab)
    const displayBubbles = useMemo(() => {
        const count = activeTab === 'bubbles' ? 20 : activeTab === 'replies' ? 12 : 5;
        const topicMap = { 'bubbles': '個人', 'replies': '回覆', 'saved': '收藏' };

        return Array.from({ length: count }).map((_, i) => ({
            id: `pantry-${activeTab}-${i}`,
            topic: topicMap[activeTab],
            title: `${topicMap[activeTab]} 氣泡 #${i + 1}`,
            content: `這是 ${activeTab} 的測試內容。在這片深海中，我們保留著每一個思考的軌跡，等待著某天能夠再次浮上水面，與其他意識共鳴。`,
            created_at: new Date(Date.now() - i * 86400000).toISOString()
        }));
    }, [activeTab]);

    return (
        <div className="w-full h-full flex flex-col pt-24 pb-24 font-sans overflow-hidden">

            {/* 1. Header Area (Centered Layout) */}
            <div className="w-full max-w-md mx-auto px-6 z-10 shrink-0">

                {/* Profile Card */}
                <div className="bg-blue-950/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 mb-4 shadow-xl relative overflow-hidden transition-all">
                    {/* Decor: light leak */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

                    <div className="flex items-start gap-4 relative z-10 mb-4">
                        {/* Avatar */}
                        <div className="shrink-0 w-20 h-20 rounded-full border-2 border-white/20 shadow-[0_0_20px_rgba(56,189,248,0.5)] flex items-center justify-center bg-black/40 overflow-hidden relative group">
                            <img
                                src={profile.avatar_url || AVATAR_LIST[0]}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                            {/* Edit Overlay */}
                            {isEditing && (
                                <button
                                    onClick={() => setShowAvatarModal(true)}
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                                >
                                    <Camera size={24} className="text-white drop-shadow-md" />
                                </button>
                            )}
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
                                    <h2 className="text-xl font-bold text-white tracking-wide truncate pr-8">{profile.display_name}</h2>
                                    <p className="text-blue-300 text-xs font-mono mb-2 truncate">@{profile.user_id}</p>
                                    <p className="text-blue-100/80 text-sm leading-relaxed whitespace-normal wrap-break-word line-clamp-3">{profile.bio}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-full text-xs transition-colors">
                                        <Save size={12} /> 儲存
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 rounded-full text-xs transition-colors">
                                        <X size={12} /> 取消
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/30 rounded-full text-xs transition-colors group">
                                    <Edit2 size={12} className="group-hover:scale-110 transition-transform" /> 編輯資料
                                </button>
                            )}
                        </div>

                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group">
                            <Share2 size={16} className="text-blue-200 group-hover:text-white transition-colors" />
                        </button>
                    </div>

                    {/* Settings Icon (Decor) */}
                    <div className="absolute top-0 right-0 p-4 opacity-20 hover:opacity-40 transition-opacity cursor-pointer">
                        <Settings className="text-white" size={18} />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-2">
                    {(['bubbles', 'replies', 'saved'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 pb-3 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            {tab === 'bubbles' ? '我的發布' : tab === 'replies' ? '回覆紀錄' : '收藏庫'}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-full shadow-[0_0_10px_#60A5FA]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Timeline Area (Full Width) */}
            <TimelineTrack>
                {displayBubbles.map((bubble) => (
                    <BubbleCard
                        key={bubble.id}
                        bubble={bubble}
                        onClick={() => { }}
                    />
                ))}
            </TimelineTrack>

            {/* Avatar Selection Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowAvatarModal(false)}>
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white text-lg font-bold mb-4 text-center tracking-wide">選擇你的深海替身</h3>
                        <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-4 p-2 custom-scrollbar">
                            {AVATAR_LIST.map((src, index) => (
                                <button
                                    key={src}
                                    onClick={() => {
                                        setProfile({ ...profile, avatar_url: src });
                                        setShowAvatarModal(false);
                                    }}
                                    className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] ${profile.avatar_url === src ? 'border-blue-400 ring-2 ring-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.5)]' : 'border-white/10 hover:border-white/50'
                                        }`}
                                >
                                    <img
                                        src={src}
                                        alt={`Avatar Option ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowAvatarModal(false)}
                            className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-colors text-sm font-bold"
                        >
                            取消
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PantryView;
