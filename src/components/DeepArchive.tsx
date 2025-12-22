'use client';

import React, { useMemo } from 'react';
import { DailyXP, UserLevel, DailyStats } from '../types';
import { COLORS } from '../constants';

interface DeepArchiveProps {
    monthlyData: DailyXP[];
    userLevel: UserLevel;
    dailyStats: DailyStats;
}

const DeepArchive: React.FC<DeepArchiveProps> = ({ monthlyData, userLevel, dailyStats }) => {
    // 取最近 28 天的資料做熱力圖
    const heatmapData = useMemo(() => {
        const recent = monthlyData.slice(-28);
        // 找出最大 XP 值來做正規化
        const maxXP = Math.max(...recent.map((d) => d.xp), 1);
        return recent.map((d) => ({
            ...d,
            intensity: d.xp / maxXP, // 0~1
        }));
    }, [monthlyData]);

    // 計算進度百分比
    const progressPercent = useMemo(() => {
        const progress = (userLevel.currentXP / userLevel.nextLevelXP) * 100;
        return Math.min(progress, 100);
    }, [userLevel]);

    return (
        <div>
            <h2 className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-2 opacity-50">
                <span className="w-8 h-px bg-blue-500/30"></span>
                Deep Archive
                <span className="flex-1 h-px bg-blue-500/30"></span>
            </h2>

            {/* 洄游節奏熱力圖 */}
            <div className="mb-6">
                <div className="text-xs text-blue-300/60 mb-2">洄游節奏 (Migration Rhythm)</div>
                <div className="flex gap-1 justify-between">
                    {heatmapData.map((day, i) => (
                        <div
                            key={i}
                            className="flex-1 aspect-1/2 rounded-sm transition-all hover:scale-110"
                            style={{
                                backgroundColor: `rgba(91, 139, 180, ${0.1 + day.intensity * 0.9})`,
                                boxShadow: day.intensity > 0.8 ? `0 0 8px ${COLORS.ocean500}80` : 'none',
                            }}
                            title={`${day.date}: ${day.xp} XP`}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                    <span>4 週前</span>
                    <span>今天</span>
                </div>
            </div>

            {/* 演化歷程卡片 */}
            <div className="bg-linear-to-r from-blue-900/40 to-indigo-900/40 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="text-blue-300 text-xs mb-1">目前物種</div>
                        <div className="text-2xl font-bold text-gray-50">{userLevel.levelName}</div>
                        <div className="text-xs text-gray-50/40 mt-1">
                            {userLevel.currentXP.toLocaleString()} / {userLevel.nextLevelXP.toLocaleString()} XP
                        </div>
                        {/* 進度條 */}
                        <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${progressPercent}%`,
                                    background: `linear-gradient(90deg, ${COLORS.ocean500}, ${COLORS.abyss500})`,
                                }}
                            />
                        </div>
                    </div>
                    {/* 鯨魚圖示 (使用 Lucide 風格的 SVG 替代 Emoji) */}
                    <div className="ml-4 w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-10 h-10 text-blue-300/60"
                        >
                            {/* 簡化鯨魚輪廓 */}
                            <path d="M3 12c0-3 2-6 7-6s8 3 10 6c-2 3-5 6-10 6s-7-3-7-6z" />
                            <circle cx="7" cy="11" r="1" fill="currentColor" />
                            <path d="M20 12c1-1 2-1 3-0.5" />
                        </svg>
                    </div>
                </div>

                {/* 連續天數 */}
                {dailyStats.streak > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-white/40">連續潛水</span>
                        <span className="text-sm font-bold text-amber-400">{dailyStats.streak} 天</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeepArchive;
