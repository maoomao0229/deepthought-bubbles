'use client';

import React, { useEffect, useState } from 'react';

interface Props {
    originalCount: number;
    replyCount: number;
}

// SVG 輔助函數：極座標轉笛卡爾座標
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};

// SVG 輔助函數：繪製弧線路徑
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
};

// 泡泡組成分析圖表
export const BubbleComposition: React.FC<Props> = ({ originalCount, replyCount }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    const total = originalCount + replyCount || 1;
    const width = 200, height = 110, cx = width / 2, cy = height - 10, radius = 55, strokeWidth = 22;
    const originalRatio = originalCount / total;
    // 180 度半圓，留 3 度間隙
    const originalAngleSpan = Math.max((180 * originalRatio) - 3, 0);

    const path1 = describeArc(cx, cy, radius, 0, originalAngleSpan);
    const path2 = describeArc(cx, cy, radius, originalAngleSpan + 3, 180);

    return (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-500/30 w-full min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden">
            {/* 標題 */}
            <div className="absolute top-2 left-4 text-[10px] text-slate-300 uppercase tracking-widest font-bold">Composition</div>

            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible max-h-[120px] pt-2">
                {/* 原創字數弧線 (綠色) */}
                <path
                    d={path1}
                    fill="none"
                    stroke="#54B39E"
                    strokeWidth={strokeWidth}
                    className="drop-shadow-lg"
                    style={{ opacity: mounted ? 1 : 0, transition: 'opacity 1s' }}
                />
                {/* 回覆字數弧線 (紫色) */}
                <path
                    d={path2}
                    fill="none"
                    stroke="#6571BC"
                    strokeWidth={strokeWidth}
                    className="drop-shadow-lg"
                    style={{ opacity: mounted ? 1 : 0, transition: 'opacity 1s' }}
                />

                {/* 中心標籤 */}
                <text x={cx} y={cy - 5} textAnchor="middle" className="fill-slate-400 text-[8px] uppercase">Total</text>
                <text x={cx} y={cy - 18} textAnchor="middle" className="fill-white text-lg font-bold font-mono">{total}</text>

                <g transform={`translate(${cx - 45}, ${cy + 3})`}>
                    <circle cx="0" cy="0" r="3" fill="#54B39E" />
                    <text x="6" y="3" className="fill-slate-400 text-[7px]">原創 {originalCount}</text>
                </g>
                <g transform={`translate(${cx + 15}, ${cy + 3})`}>
                    <circle cx="0" cy="0" r="3" fill="#6571BC" />
                    <text x="6" y="3" className="fill-slate-400 text-[7px]">回覆 {replyCount}</text>
                </g>
            </svg>
        </div>
    );
};

export default BubbleComposition;
