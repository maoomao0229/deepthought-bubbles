'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { WeeklyWaveData, WeeklyTopic } from '../types';
import { Share2, Activity, Info } from 'lucide-react';

interface Props {
    data: WeeklyWaveData;
}

// --- 輔助函數：根據主題名稱取得顏色 ---
const getTopicColor = (topicName: string) => {
    if (topicName.includes('科技') || topicName.includes('時事')) {
        return { text: 'text-emerald-400', stroke: '#34D399', bg: 'bg-emerald-400' };
    }
    if (topicName.includes('哲學') || topicName.includes('議題') || topicName.includes('心理')) {
        return { text: 'text-violet-400', stroke: '#A78BFA', bg: 'bg-violet-400' };
    }
    if (topicName.includes('文化') || topicName.includes('生活')) {
        return { text: 'text-sky-300', stroke: '#7DD3FC', bg: 'bg-sky-300' };
    }
    return { text: 'text-amber-300', stroke: '#FCD34D', bg: 'bg-amber-300' };
};

// --- 子組件：聲納雷達 ---
const SonarRadar: React.FC<{ data: WeeklyWaveData }> = ({ data }) => {
    // 根據 responses 和 resonance 生成雷達上的點
    const blips = useMemo(() => {
        const items = [];
        const totalDuration = 4;

        const createBlip = (id: string, colorClass: string) => {
            const angle = Math.random() * 360;
            const normalizedRadius = 0.3 + Math.random() * 0.6;
            const radians = (angle * Math.PI) / 180;
            const x = 50 + normalizedRadius * 50 * Math.sin(radians);
            const y = 50 - normalizedRadius * 50 * Math.cos(radians);
            const delay = (angle / 360) * totalDuration;
            return { id, x, y, delay, color: colorClass };
        };

        // 一般回響 (青色)
        for (let i = 0; i < data.responses; i++) {
            items.push(createBlip(`res-${i}`, 'bg-teal-300 shadow-[0_0_8px_#75C9B6]'));
        }
        // 高價共鳴 (金色)
        for (let i = 0; i < data.resonance; i++) {
            items.push(createBlip(`high-${i}`, 'bg-amber-500 shadow-[0_0_12px_#FFC678]'));
        }

        return items;
    }, [data]);

    return (
        <div className="relative w-full aspect-square max-w-[320px] mx-auto">
            <div className="absolute inset-0 bg-slate-900 rounded-full border-2 border-slate-700 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* 網格層 */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full border border-teal-500/10"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full border border-teal-500/10"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full border border-teal-500/20 border-dashed"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-teal-500/10"></div>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-teal-500/10"></div>
                </div>

                {/* 掃描線動畫 */}
                <div
                    className="absolute inset-0 z-10 pointer-events-none origin-center"
                    style={{ animation: 'spin 4s linear infinite' }}
                >
                    <div
                        className="w-full h-full rounded-full"
                        style={{
                            background:
                                'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, rgba(84, 179, 158, 0.05) 300deg, rgba(84, 179, 158, 0.4) 360deg)',
                        }}
                    />
                    <div className="absolute top-0 left-1/2 h-1/2 w-0.5 bg-teal-400 shadow-[0_0_10px_#54B39E] origin-bottom transform -translate-x-1/2"></div>
                </div>

                {/* 雷達點 */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {blips.map((blip) => (
                        <div
                            key={blip.id}
                            className={`absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse ${blip.color}`}
                            style={{
                                top: `${blip.y}%`,
                                left: `${blip.x}%`,
                                transform: 'translate(-50%, -50%)',
                                animationDelay: `${blip.delay}s`,
                            }}
                        />
                    ))}
                </div>

                {/* 中心核心 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                    <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-slate-800/90 backdrop-blur rounded-full border border-teal-500/30 shadow-[0_0_20px_rgba(49,103,148,0.5)]">
                        <div className="text-center">
                            <span className="block text-xl md:text-2xl font-mono font-bold text-slate-50 leading-none">
                                {data.myBubbles}
                            </span>
                            <span className="block text-[8px] text-teal-300 uppercase tracking-widest mt-1">CORE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 掃描動畫 CSS */}
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

// --- 主組件 ---
export const WeeklyWave: React.FC<Props> = ({ data }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setTimeout(() => setMounted(true), 100);
    }, []);

    // 依互動次數排序主題
    const sortedTopics = useMemo(
        () => [...data.topics].sort((a, b) => b.interactionCount - a.interactionCount),
        [data.topics]
    );

    const totalInteractions = sortedTopics.reduce((acc, t) => acc + t.interactionCount, 0);

    // SVG 甜甜圈圖設定
    const size = 260;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const gapLength = 6;

    // 計算各區段
    let currentOffset = 0;
    const segments = sortedTopics.map((topic) => {
        const percentage = topic.interactionCount / totalInteractions;
        const arcLength = circumference * percentage;
        const visibleLength = Math.max(0, arcLength - gapLength);
        const startAngle = (currentOffset / circumference) * 360;
        currentOffset += arcLength;
        return {
            ...topic,
            percentage: Math.round(percentage * 100),
            visibleLength,
            startAngle,
            colors: getTopicColor(topic.name),
        };
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* 卡片 1: 聲納覆蓋域 */}
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-6 z-10">
                    <Activity className="w-5 h-5 text-teal-300" />
                    <h3 className="text-lg font-bold text-slate-50">聲納覆蓋域</h3>
                    <Info className="w-4 h-4 text-slate-500 cursor-help" />
                </div>

                <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
                    {/* 甜甜圈圖 */}
                    <div className="relative" style={{ width: size, height: size }}>
                        {/* 中心數據 */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                            <span className="text-3xl font-bold text-slate-50 font-mono">
                                {hoveredIndex !== null ? segments[hoveredIndex].percentage : 100}
                                <span className="text-sm align-top opacity-60">%</span>
                            </span>
                            <span
                                className={`text-xs uppercase tracking-widest mt-1 ${hoveredIndex !== null ? segments[hoveredIndex].colors.text : 'text-slate-300'
                                    }`}
                            >
                                {hoveredIndex !== null ? segments[hoveredIndex].name : 'Total Coverage'}
                            </span>
                        </div>

                        <svg width={size} height={size} className="transform -rotate-90">
                            {/* 背景圓環 */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth={strokeWidth}
                                className="opacity-50"
                            />
                            {/* 各區段 */}
                            {segments.map((segment, index) => (
                                <circle
                                    key={segment.name}
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    fill="none"
                                    stroke={segment.colors.stroke}
                                    strokeWidth={hoveredIndex === index ? strokeWidth + 4 : strokeWidth}
                                    strokeLinecap="round"
                                    strokeDasharray={`${segment.visibleLength} ${circumference}`}
                                    strokeDashoffset={mounted ? 0 : segment.visibleLength}
                                    transform={`rotate(${segment.startAngle} ${size / 2} ${size / 2})`}
                                    className="transition-all duration-500 ease-out cursor-pointer hover:opacity-100"
                                    style={{
                                        opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.3 : 1,
                                    }}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                />
                            ))}
                        </svg>
                    </div>

                    {/* 圖例 */}
                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                        {segments.map((segment, index) => (
                            <div
                                key={segment.name}
                                className={`flex items-center justify-between gap-4 p-2 rounded-lg transition-all cursor-pointer border border-transparent ${hoveredIndex === index
                                        ? 'bg-slate-800 border-slate-600 shadow-lg scale-105'
                                        : 'hover:bg-slate-800/50'
                                    }`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${segment.colors.bg}`}></div>
                                    <span className="text-sm text-slate-100 font-medium">{segment.name}</span>
                                </div>
                                <span className={`text-sm font-mono font-bold ${segment.colors.text}`}>
                                    {segment.percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 卡片 2: 回聲定位反饋 */}
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <Share2 className="w-5 h-5 text-indigo-300" />
                    <h3 className="text-lg font-bold text-slate-50">回聲定位反饋</h3>
                </div>
                <div className="flex-1 flex items-center justify-center py-4">
                    <SonarRadar data={data} />
                </div>
            </div>
        </div>
    );
};

export default WeeklyWave;
