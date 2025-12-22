'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { DailyStats } from '../types';
import { calculatePressure, calculateDailyXP } from '../constants';
import { Activity, Sparkles } from 'lucide-react';
import { BubbleComposition } from './BubbleComposition';

interface Props {
    stats: DailyStats;
}

export const DailyPing: React.FC<Props> = ({ stats }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // 計算邏輯
    const currentXP = useMemo(() => calculateDailyXP(stats), [stats]);
    const pressure = useMemo(() => calculatePressure(stats), [stats]);
    const weightedTotal = stats.originalWords + stats.replyWords;
    const target = 300; // 每日目標字數
    const percentage = Math.min((weightedTotal / target) * 100, 100);

    // SVG 圓形進度條設定
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-full min-h-[500px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 p-6 flex flex-col justify-between">
            {/* 頂部標題區 */}
            <div className="flex justify-between items-start z-10">
                <div>
                    <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-teal-300" />
                        肺活量監測
                    </h2>
                    <p className="text-slate-300 text-sm mt-1">動態氧氣瓶狀態</p>
                </div>
                <div className="text-3xl font-mono font-bold text-teal-300">
                    {currentXP} <span className="text-sm text-slate-300">XP</span>
                </div>
            </div>

            {/* 主視覺：氧氣瓶圓形進度條 */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-8">
                <div className="relative flex items-center justify-center">
                    <svg className="w-[320px] h-[320px] transform -rotate-90 drop-shadow-[0_0_15px_rgba(84,179,158,0.2)]">
                        {/* 背景圓環 */}
                        <circle
                            cx="160"
                            cy="160"
                            r={radius}
                            className="stroke-slate-800 fill-slate-900/50"
                            strokeWidth="16"
                        />
                        {/* 進度圓環 */}
                        <circle
                            cx="160"
                            cy="160"
                            r={radius}
                            className="stroke-teal-500 drop-shadow-[0_0_10px_rgba(84,179,158,0.8)]"
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={mounted ? strokeDashoffset : circumference}
                            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                            fill="transparent"
                        />
                    </svg>
                    {/* 中心數據 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-6xl font-mono font-bold text-slate-50">{weightedTotal}</span>
                        <span className="text-sm font-bold text-teal-300 uppercase tracking-widest mt-2 border-t border-teal-500/30 pt-1">
                            OXYGEN LEVEL
                        </span>
                    </div>
                </div>
            </div>

            {/* 底部詳情區 */}
            <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-4 h-32">
                {/* 泡泡組成分析 */}
                <BubbleComposition originalCount={stats.originalWords} replyCount={stats.replyWords} />

                {/* 共鳴訊號卡片 */}
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-3 border border-slate-500/30 flex flex-col justify-center items-center">
                    <Sparkles className="w-5 h-5 text-amber-500 mb-1" />
                    <div className="text-xl font-bold text-white">{stats.resonance}</div>
                    <div className="text-[10px] text-slate-400">共鳴訊號</div>
                </div>
            </div>
        </div>
    );
};

export default DailyPing;
