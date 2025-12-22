'use client';

import React, { useMemo } from 'react';
import { DailyStats, UserLevel } from '../types';
import { Fish, Zap, Brain, CheckCircle, Feather, Anchor, Crown } from 'lucide-react';

interface Props {
    userLevel: UserLevel;
    dailyStats: DailyStats;
}

// Level Configuration
const LEVELS = [
    { lv: 1, name: '新手海狗', minXP: 0, iconScale: 1.0, glow: 'blue-300', image: '/seal.png' },
    { lv: 2, name: '瓶鼻海豚', minXP: 5000, iconScale: 1.0, glow: 'blue-500', image: '/dolphin.png' },
    { lv: 3, name: '虎鯨', minXP: 20000, iconScale: 1.2, glow: 'indigo-300' },
    { lv: 4, name: '座頭鯨', minXP: 50000, iconScale: 1.4, glow: 'indigo-500' },
    { lv: 5, name: '終極藍鯨', minXP: 150000, iconScale: 1.6, glow: 'blue-700' },
];

const calculateStreakBonus = (days: number) => Math.min((days - 1) * 10, 300);

export const EvolutionPath: React.FC<Props> = ({ userLevel, dailyStats }) => {
    const currentTotalXP = userLevel.currentXP;

    // Find Level Logic
    const currentLevelIndex = useMemo(() => {
        const idx = [...LEVELS].reverse().findIndex(l => currentTotalXP >= l.minXP);
        return idx >= 0 ? (LEVELS.length - 1 - idx) : 0;
    }, [currentTotalXP]);

    const currentLevel = LEVELS[currentLevelIndex];
    const nextLevel = LEVELS[currentLevelIndex + 1] || null;
    const rangeStart = currentLevel.minXP;
    const rangeEnd = nextLevel ? nextLevel.minXP : rangeStart * 1.5;
    const progressPercent = Math.min(Math.max(((currentTotalXP - rangeStart) / (rangeEnd - rangeStart)) * 100), 100);

    // Stats Sources
    const sources = [
        { label: '輸出', val: dailyStats.originalWords + dailyStats.replyWords, icon: Feather, color: 'text-green-300' },
        { label: '深度', val: (dailyStats.readDeep * 50) + (dailyStats.readMedium * 15) + (dailyStats.readShallow * 5), icon: Anchor, color: 'text-indigo-300' },
        { label: '任務', val: dailyStats.isTaskComplete ? 100 : 0, icon: CheckCircle, color: 'text-blue-300' },
        { label: '連續技', val: calculateStreakBonus(dailyStats.streak), icon: Zap, color: 'text-yellow-500' },
    ];

    const isMilestoneStreak = [7, 14, 30].includes(dailyStats.streak);

    return (
        <div className="relative bg-blue-900/20 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-blue-700/30 overflow-hidden mb-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-100" />
                    <h3 className="text-lg font-bold text-gray-50 tracking-wider">演化歷程</h3>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isMilestoneStreak ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-blue-900/50 border-blue-700/50'}`}>
                    <Crown className={`w-3 h-3 ${isMilestoneStreak ? 'text-yellow-500' : 'text-blue-300'}`} />
                    <span className={`text-xs font-mono font-bold ${isMilestoneStreak ? 'text-yellow-500' : 'text-blue-300'}`}>
                        {dailyStats.streak} Days Streak
                    </span>
                </div>
            </div>

            {/* Main Visual */}
            <div className="flex items-center justify-between mb-8 px-4 relative h-40">
                {/* Current Species */}
                <div className="flex flex-col items-center justify-center relative z-10">
                    <div className="relative flex items-center justify-center transition-all duration-1000" style={{ transform: `scale(${currentLevel.iconScale})` }}>
                        <div className={`absolute inset-0 rounded-full opacity-40 blur-xl bg-${currentLevel.glow}`}></div>
                        {/* @ts-ignore */}
                        {currentLevel.image ? (
                            <img src={currentLevel.image} alt={currentLevel.name} className="w-24 h-24 object-contain drop-shadow-lg relative z-10" />
                        ) : (
                            <Fish className="w-24 h-24 text-gray-50 drop-shadow-lg" strokeWidth={1} fill="rgba(255,255,255,0.1)" />
                        )}
                    </div>
                    <div className="mt-4 text-center">
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-gray-50 to-blue-300">{currentLevel.name}</h2>
                        <span className="text-xs text-blue-300 font-mono tracking-widest uppercase">Current Form</span>
                    </div>
                </div>

                {/* Next Level Ghost */}
                {nextLevel && (
                    <div className="flex flex-col items-center justify-center opacity-30 grayscale blur-[1px] transform scale-90">
                        <div style={{ transform: `scale(${nextLevel.iconScale})` }}>
                            {/* @ts-ignore */}
                            {nextLevel.image ? (
                                <img src={nextLevel.image} alt={nextLevel.name} className="w-20 h-20 object-contain" />
                            ) : (
                                <Fish className="w-20 h-20 text-blue-500/50" strokeWidth={1} />
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <h3 className="text-lg font-bold text-blue-500/50">{nextLevel.name}</h3>
                            <span className="text-xs text-blue-700 font-mono uppercase">Next Evolution</span>
                        </div>
                    </div>
                )}
            </div>

            {/* XP Bar */}
            <div className="mb-6 relative">
                <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-green-300">{currentTotalXP.toLocaleString()} XP</span>
                    <span className="text-blue-300">{nextLevel ? nextLevel.minXP.toLocaleString() : 'MAX'} XP</span>
                </div>
                <div className="h-3 w-full bg-blue-900/50 rounded-full overflow-hidden border border-blue-700/50 shadow-inner relative">
                    <div className="h-full bg-linear-to-r from-green-500 via-blue-500 to-indigo-500 relative transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-blue-700/30">
                {sources.map((src, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-blue-300 uppercase">{src.label}</span>
                        <span className={`text-xs font-bold font-mono ${src.val > 0 ? 'text-gray-50' : 'text-blue-700'}`}>+{src.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
