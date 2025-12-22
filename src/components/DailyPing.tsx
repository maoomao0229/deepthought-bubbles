'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { DailyStats } from '../types';
import { calculatePressure, calculateDailyXP } from '../constants';
import { Activity } from 'lucide-react';
import { BubbleComposition } from './BubbleComposition';

interface Props {
    stats: DailyStats;
}

// Sub-component: Deep Sea Pressure Gauge
const PressureGauge: React.FC<{ pressure: number }> = ({ pressure }) => {
    const MAX_PRESSURE = 100; // Visual Scale limit
    // Angle calculation: map 0-MAX to -90deg to +90deg (Semi-circle)
    const clampedPressure = Math.min(pressure, MAX_PRESSURE);
    const rotation = -90 + (clampedPressure / MAX_PRESSURE) * 180;

    // Color logic: Green for low pressure, Yellow for high
    const isHighPressure = pressure > 60;
    const accentColor = isHighPressure ? '#F8B75C' : '#54B39E'; // Yellow-700 : Green-500
    const needleColor = isHighPressure ? '#E59F40' : '#75C9B6'; // Yellow-900 : Green-300

    // Ticks generation
    const ticks = Array.from({ length: 11 }).map((_, i) => {
        const angle = -90 + (i * 18); // 180 / 10 intervals = 18deg
        return (
            <line
                key={i}
                x1="100" y1="20"
                x2="100" y2={i % 5 === 0 ? "35" : "28"} // Major ticks longer
                stroke={i % 5 === 0 ? '#5B8BB4' : '#4376A0'}
                strokeWidth={i % 5 === 0 ? "2" : "1"}
                transform={`rotate(${angle} 100 100)`}
            />
        );
    });

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-end overflow-hidden rounded-xl bg-blue-900/40 border border-blue-700/50 shadow-inner min-h-[120px]">
            {/* Glass Reflection Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-white/5 to-transparent z-10 pointer-events-none" />

            {/* Gauge SVG */}
            <svg viewBox="0 0 200 110" className="w-full h-full max-h-[120px] pt-2">
                {/* Background Arc */}
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#316794" strokeWidth="2" strokeDasharray="4 4" />
                {ticks}
                <text x="25" y="105" fontSize="8" fill="#5B8BB4" fontFamily="monospace" textAnchor="middle">SURFACE</text>
                <text x="175" y="105" fontSize="8" fill="#3B489D" fontFamily="monospace" textAnchor="middle">ABYSS</text>

                {/* Needle Group with Rotation */}
                <g transform={`rotate(${rotation} 100 100)`} className="transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                    <polygon points="100,25 96,100 104,100" fill={needleColor} />
                    <circle cx="100" cy="100" r="6" fill="#161819" stroke={accentColor} strokeWidth="2" />
                </g>
            </svg>

            {/* Digital Readout */}
            <div className="absolute bottom-1 flex flex-col items-center z-20">
                <span className="text-[10px] text-blue-100 font-mono tracking-widest">PRESSURE</span>
                <span className="text-lg font-mono font-bold leading-none" style={{ color: accentColor }}>
                    {Math.round(pressure)} <span className="text-[10px] opacity-60">hPa</span>
                </span>
            </div>
        </div>
    );
};

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
        <div className="relative w-full min-h-[500px] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-blue-700/50 p-6 flex flex-col justify-between">
            {/* 頂部標題區 */}
            <div className="flex justify-between items-start z-10">
                <div>
                    <h2 className="text-2xl font-bold text-gray-50 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-green-300" />
                        肺活量監測
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">動態氧氣瓶狀態</p>
                </div>
                <div className="text-3xl font-mono font-bold text-green-300">
                    {currentXP} <span className="text-sm text-blue-100">XP</span>
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
                            className="stroke-blue-900 fill-blue-900/50"
                            strokeWidth="16"
                        />
                        {/* 進度圓環 */}
                        <circle
                            cx="160"
                            cy="160"
                            r={radius}
                            className="stroke-green-500 drop-shadow-[0_0_10px_rgba(84,179,158,0.8)]"
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
                        <span className="text-6xl font-mono font-bold text-gray-50">{weightedTotal}</span>
                        <span className="text-sm font-bold text-green-300 uppercase tracking-widest mt-2 border-t border-green-500/30 pt-1">
                            OXYGEN LEVEL
                        </span>
                    </div>
                </div>
            </div>

            {/* 底部詳情區 */}
            <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                {/* 泡泡組成分析 */}
                <BubbleComposition originalCount={stats.originalWords} replyCount={stats.replyWords} />

                {/* 深海壓力計 */}
                <PressureGauge pressure={pressure} />
            </div>
        </div>
    );
};

export default DailyPing;
