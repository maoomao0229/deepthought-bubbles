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
    { lv: 1, name: '新手海狗', minXP: 0, iconScale: 0.8, glow: 'shadow-teal-300' },
    { lv: 2, name: '瓶鼻海豚', minXP: 5000, iconScale: 1.0, glow: 'shadow-sky-400' },
    { lv: 3, name: '虎鯨', minXP: 20000, iconScale: 1.2, glow: 'shadow-indigo-300' },
    { lv: 4, name: '座頭鯨', minXP: 50000, iconScale: 1.4, glow: 'shadow-violet-400' },
    { lv: 5, name: '終極藍鯨', minXP: 150000, iconScale: 1.6, glow: 'shadow-blue-400' },
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
        { label: '輸出', val: dailyStats.originalWords + dailyStats.replyWords, icon: Feather, color: 'text-teal-300' },
        { label: '深度', val: (dailyStats.readDeep * 50) + (dailyStats.readMedium * 15) + (dailyStats.readShallow * 5), icon: Anchor, color: 'text-indigo-300' },
        { label: '任務', val: dailyStats.isTaskComplete ? 100 : 0, icon: CheckCircle, color: 'text-slate-300' },
        { label: '連續技', val: calculateStreakBonus(dailyStats.streak), icon: Zap, color: 'text-amber-500' },
    ];

    const isMilestoneStreak = [7, 14, 30].includes(dailyStats.streak);

    return (
        <div className="relative bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-slate-700/50 overflow-hidden mb-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-slate-300" />
                    <h3 className="text-lg font-bold text-slate-50 tracking-wider">演化歷程</h3>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isMilestoneStreak ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-800 border-slate-600'}`}>
                    <Crown className={`w-3 h-3 ${isMilestoneStreak ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span className={`text-xs font-mono font-bold ${isMilestoneStreak ? 'text-amber-500' : 'text-slate-400'}`}>
                        {dailyStats.streak} Days Streak
                    </span>
                </div>
            </div>

            {/* Main Visual */}
            <div className="flex items-center justify-between mb-8 px-4 relative h-40">
                {/* Current Species */}
                <div className="flex flex-col items-center justify-center relative z-10">
                    <div className="relative flex items-center justify-center transition-all duration-1000" style={{ transform: `scale(${currentLevel.iconScale})` }}>
                        <div className={`absolute inset-0 rounded-full opacity-40 blur-xl bg-indigo-500`}></div>
                        <Fish className="w-24 h-24 text-slate-50 drop-shadow-lg" strokeWidth={1} fill="rgba(255,255,255,0.1)" />
                    </div>
                    <div className="mt-4 text-center">
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-slate-50 to-slate-300">{currentLevel.name}</h2>
                        <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">Current Form</span>
                    </div>
                </div>

                {/* Next Level Ghost */}
                {nextLevel && (
                    <div className="flex flex-col items-center justify-center opacity-30 grayscale blur-[1px] transform scale-90">
                        <div style={{ transform: `scale(${nextLevel.iconScale})` }}>
                            <Fish className="w-20 h-20 text-slate-500" strokeWidth={1} />
                        </div>
                        <div className="mt-4 text-center">
                            <h3 className="text-lg font-bold text-slate-500">{nextLevel.name}</h3>
                            <span className="text-xs text-slate-600 font-mono uppercase">Next Evolution</span>
                        </div>
                    </div>
                )}
            </div>

            {/* XP Bar */}
            <div className="mb-6 relative">
                <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-teal-300">{currentTotalXP.toLocaleString()} XP</span>
                    <span className="text-slate-400">{nextLevel ? nextLevel.minXP.toLocaleString() : 'MAX'} XP</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner relative">
                    <div className="h-full bg-linear-to-r from-teal-500 via-sky-500 to-indigo-500 relative transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-700/30">
                {sources.map((src, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-slate-400 uppercase">{src.label}</span>
                        <span className={`text-xs font-bold font-mono ${src.val > 0 ? 'text-slate-50' : 'text-slate-600'}`}>+{src.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
