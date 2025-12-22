'use client';

import React, { useMemo } from 'react';
import { WeeklyWaveData } from '../types';

interface WeeklyWaveProps {
    data: WeeklyWaveData;
}

const WeeklyWave: React.FC<WeeklyWaveProps> = ({ data }) => {
    // 計算主題分佈的 conic-gradient
    const topicGradient = useMemo(() => {
        const total = data.topics.reduce((acc, t) => acc + t.interactionCount, 0);
        if (total === 0) return 'conic-gradient(#316794 0% 100%)';

        let currentPercent = 0;
        const gradientStops = data.topics.map((topic) => {
            const start = currentPercent;
            const percent = (topic.interactionCount / total) * 100;
            currentPercent += percent;
            return `${topic.color} ${start}% ${currentPercent}%`;
        });
        return `conic-gradient(${gradientStops.join(', ')})`;
    }, [data.topics]);

    // 計算回聲層數 (根據 responses + resonance)
    const echoLevel = useMemo(() => {
        const total = data.responses + data.resonance;
        // 層數範圍 1-5
        return Math.min(Math.max(Math.ceil(total / 15), 1), 5);
    }, [data.responses, data.resonance]);

    return (
        <div>
            <h2 className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-2 opacity-50">
                <span className="w-8 h-px bg-blue-500/30"></span>
                Weekly Wave
                <span className="flex-1 h-px bg-blue-500/30"></span>
            </h2>

            <div className="bg-blue-900/20 backdrop-blur-md rounded-2xl p-6 border border-white/5 grid grid-cols-2 gap-6 items-center">
                {/* 聲納覆蓋域 (Donut Chart) */}
                <div
                    className="relative aspect-square rounded-full flex items-center justify-center"
                    style={{ background: topicGradient }}
                >
                    <div className="absolute inset-2 bg-[#0a101f] rounded-full flex items-center justify-center text-xs text-white/60">
                        聲納分佈
                    </div>
                </div>

                {/* 回聲定位 (Ripple Effect) */}
                <div className="relative aspect-square flex items-center justify-center">
                    {/* 多層波紋動畫 */}
                    {[...Array(echoLevel)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute border border-blue-300/30 rounded-full animate-ping opacity-20"
                            style={{
                                width: `${(i + 1) * 20}%`,
                                height: `${(i + 1) * 20}%`,
                                animationDuration: `${2 + i}s`,
                            }}
                        />
                    ))}
                    <div className="z-10 text-center">
                        <div className="text-gray-50 font-bold text-lg">Impact</div>
                        <div className="text-xs text-blue-300/60 mt-1">
                            {data.myBubbles} 泡泡 / {data.responses + data.resonance} 回響
                        </div>
                    </div>
                </div>
            </div>

            {/* 主題圖例 */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {data.topics.map((topic) => (
                    <div key={topic.name} className="flex items-center gap-1 text-xs text-white/60">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: topic.color }}
                        ></span>
                        {topic.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeeklyWave;
