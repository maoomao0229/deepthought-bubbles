'use client';

import React, { useMemo } from 'react';
import { DailyXP, UserLevel, DailyStats } from '../types';
import { COLORS } from '../constants';
import { MigrationRhythm } from './MigrationRhythm';
import { EvolutionPath } from './EvolutionPath';

interface DeepArchiveProps {
    monthlyData: DailyXP[];
    userLevel: UserLevel;
    dailyStats: DailyStats;
}

const DeepArchive: React.FC<DeepArchiveProps> = ({ monthlyData, userLevel, dailyStats }) => {
    // 計算進度百分比
    const progressPercent = useMemo(() => {
        const progress = (userLevel.currentXP / userLevel.nextLevelXP) * 100;
        return Math.min(progress, 100);
    }, [userLevel]);

    return (
        <div className="space-y-6">
            <h2 className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-2 opacity-50">
                <span className="w-8 h-px bg-blue-500/30"></span>
                Deep Archive
                <span className="flex-1 h-px bg-blue-500/30"></span>
            </h2>

            {/* 演化歷程 - 使用新組件 (移到上方) */}
            <EvolutionPath userLevel={userLevel} dailyStats={dailyStats} />

            {/* 洄游節奏熱力圖 - 使用新組件 */}
            <MigrationRhythm data={monthlyData} />

            {/* 海溝探勘紀錄 - 深度圖表 */}
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-700 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6 z-10 relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-indigo-300"
                    >
                        <path d="M2 12h5l3 5 5-10 4 5h3" />
                    </svg>
                    <h3 className="text-lg font-bold text-slate-50">海溝探勘紀錄</h3>
                </div>

                <div className="relative h-64 w-full">
                    {/* SVG Chart */}
                    <svg className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="depthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLORS.ocean500} stopOpacity="0.5" />
                                <stop offset="100%" stopColor={COLORS.abyss500} stopOpacity="0.1" />
                            </linearGradient>
                        </defs>

                        {/* Area Path */}
                        <path
                            d={`M 0,256 ${monthlyData.slice(-30).map((d, i) => {
                                const x = (i / 29) * 100; // Percentage width
                                const y = 256 - (d.maxDepth / 1200) * 200; // Scale height (max 1200m -> 200px height)
                                return `L ${x}%,${y}`;
                            }).join(' ')} L 100%,256 Z`}
                            fill="url(#depthGradient)"
                        />

                        {/* Line Path */}
                        <path
                            d={`M 0,256 ${monthlyData.slice(-30).map((d, i) => {
                                const x = (i / 29) * 100;
                                const y = 256 - (d.maxDepth / 1200) * 200;
                                return `L ${x}%,${y}`;
                            }).join(' ')}`}
                            fill="none"
                            stroke={COLORS.ocean500}
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* Data Points (Scatter) */}
                        {monthlyData.slice(-30).map((d, i) => {
                            const x = (i / 29) * 100;
                            const y = 256 - (d.maxDepth / 1200) * 200;
                            if (i % 5 !== 0 && i !== 29) return null; // Show only some points to avoid clutter
                            return (
                                <circle
                                    key={i}
                                    cx={`${x}%`}
                                    cy={y}
                                    r="3"
                                    fill={COLORS.sand50}
                                    className="transition-all hover:r-4"
                                />
                            );
                        })}
                    </svg>

                    {/* Y-Axis Labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-500 font-mono pointer-events-none pb-8 pt-4">
                        <span>1200m</span>
                        <span>600m</span>
                        <span>0m</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeepArchive;
