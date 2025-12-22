'use client';

import React, { useState } from 'react';
import { DailyXP } from '../types';
import { Map, Info } from 'lucide-react';

interface Props {
    data: DailyXP[];
}

export const MigrationRhythm: React.FC<Props> = ({ data }) => {
    const [hoveredDay, setHoveredDay] = useState<{ date: string; xp: number; x: number; y: number } | null>(null);

    // 色階映射邏輯：根據 XP 值決定泡泡樣式
    const getBubbleStyle = (xp: number) => {
        if (xp === 0) return 'bg-blue-900/40 border border-blue-700/20';
        if (xp <= 100) return 'bg-green-500/40 border border-green-500/30';
        if (xp <= 300) return 'bg-green-500 shadow-[0_0_8px_rgba(84,179,158,0.6)] border border-green-300';
        return 'bg-yellow-500 shadow-[0_0_12px_rgba(255,198,120,0.9)] border border-yellow-300 animate-pulse';
    };

    const handleMouseEnter = (e: React.MouseEvent, day: DailyXP) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setHoveredDay({
            date: day.date,
            xp: day.xp,
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
        });
    };

    return (
        <div className="bg-gray-50/5 rounded-3xl p-6 shadow-xl border border-blue-700/30 relative flex flex-col h-full min-h-[300px]">
            {/* 標題區 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-green-300" />
                    <h3 className="text-lg font-bold text-gray-50">洄游節奏</h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-300">
                    <Info className="w-3 h-3" />
                    <span>近 112 天活躍紀錄</span>
                </div>
            </div>

            {/* 熱力圖網格容器 */}
            <div className="relative flex-1 w-full overflow-x-auto pb-4 cursor-grab active:cursor-grabbing no-scrollbar">
                <div className="grid grid-rows-7 grid-flow-col gap-2 min-w-max px-2">
                    {data.map((day, index) => (
                        <div
                            key={index}
                            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ease-out hover:scale-150 ${getBubbleStyle(day.xp)}`}
                            onMouseEnter={(e) => handleMouseEnter(e, day)}
                            onMouseLeave={() => setHoveredDay(null)}
                        />
                    ))}
                </div>
            </div>

            {/* 圖例 */}
            <div className="flex items-center justify-end gap-3 mt-4 text-[10px] text-blue-300 font-mono uppercase tracking-wider">
                <span>Less</span>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-900/40 border border-blue-700/20"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_5px_rgba(84,179,158,0.5)]"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(255,198,120,0.8)]"></div>
                </div>
                <span>More</span>
            </div>

            {/* 懸浮提示框 */}
            {hoveredDay && (
                <div
                    className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-2 bg-gray-900/95 backdrop-blur border border-blue-700/50 rounded-lg shadow-2xl text-xs"
                    style={{ top: hoveredDay.y, left: hoveredDay.x }}
                >
                    <div className="text-blue-100 font-mono mb-1">{hoveredDay.date}</div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${hoveredDay.xp > 300 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <span className="font-bold text-gray-50">{hoveredDay.xp} XP</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MigrationRhythm;
