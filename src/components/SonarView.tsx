import React, { useMemo } from 'react';
import { Activity, Wind, Anchor, Zap } from 'lucide-react';

// Using 'any' for the user prop for now as per the snippet, but typing it would be better later.
const SonarView = ({ user }: { user: any }) => {
    // [Mock Data] - Mirroring the PRD structure
    const stats = useMemo(() => ({
        daily: {
            lungCapacity: 75, // %, 呼吸圈大小
            pressure: 0.8,    // 0-1, 暗角濃度
            bioluminescence: 12, // 互動點數
            wordCount: 1240,
        },
        weekly: {
            topics: [
                // Using PRD/Tailwind colors:
                // Philosophy: Indigo-500 (#6571BC)
                // Current Events: Green-500 (#54B39E)
                // Life: Blue-500 (#5B8BB4)
                // Others: Yellow-500 (#FFC678)
                { name: '哲學', value: 40, color: '#6571BC' },
                { name: '時事', value: 30, color: '#54B39E' },
                { name: '生活', value: 20, color: '#5B8BB4' },
                { name: '其他', value: 10, color: '#FFC678' },
            ],
            echoLevel: 3, // 波紋層數
        },
        monthly: {
            heatmap: Array.from({ length: 28 }, () => Math.random()), // 0-1 活躍度
            evolution: '座頭鯨',
            level: 4,
        }
    }), []);

    return (
        <div className="w-full h-full relative overflow-y-auto overflow-x-hidden pt-20 pb-32 no-scrollbar">

            {/* 1. Water Pressure Overlay (水壓暗角) */}
            <div
                className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
                style={{
                    background: 'radial-gradient(circle at center, transparent 0%, #020617 120%)',
                    opacity: 0.5 + (stats.daily.pressure * 0.5) // 動態調整暗角濃度
                }}
            />

            <div className="relative z-10 px-6 space-y-12">

                {/* --- Layer 1: The Daily Ping --- */}
                <section className="text-center relative py-8">
                    <h2 className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-8 opacity-50">The Daily Ping</h2>

                    {/* Lung Capacity (Breathing Bubble) */}
                    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                        {/* 呼吸動畫圈 */}
                        <div
                            className="absolute inset-0 rounded-full border border-blue-300/30 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                            style={{
                                animation: `breathe 4s infinite ease-in-out`,
                                transformOrigin: 'center',
                                // 根據完成度調整基礎大小
                                transform: `scale(${0.8 + (stats.daily.lungCapacity / 100) * 0.4})`
                            }}
                        />
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-50 tabular-nums">{stats.daily.lungCapacity}%</div>
                            <div className="text-xs text-blue-300 mt-1">肺活量</div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <StatCard label="今日輸出" value={stats.daily.wordCount} icon={Wind} unit="字" />
                        <StatCard label="目前水壓" value={stats.daily.pressure * 1000} icon={Anchor} unit="hPa" />
                        <StatCard label="生物發光" value={stats.daily.bioluminescence} icon={Zap} unit="pts" />
                    </div>
                </section>

                {/* --- Layer 2: The Weekly Wave --- */}
                <section>
                    <h2 className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-2 opacity-50">
                        <span className="w-8 h-px bg-blue-500/30"></span>
                        Weekly Wave
                        <span className="flex-1 h-px bg-blue-500/30"></span>
                    </h2>

                    <div className="bg-blue-900/20 backdrop-blur-md rounded-2xl p-6 border border-white/5 grid grid-cols-2 gap-6 items-center">
                        {/* Sonar Coverage (Simple Donut via Conic Gradient) */}
                        <div className="relative aspect-square rounded-full flex items-center justify-center"
                            style={{
                                background: `conic-gradient(
                        ${stats.weekly.topics[0].color} 0% 40%, 
                        ${stats.weekly.topics[1].color} 40% 70%, 
                        ${stats.weekly.topics[2].color} 70% 90%, 
                        ${stats.weekly.topics[3].color} 90% 100%
                     )`
                            }}>
                            <div className="absolute inset-2 bg-[#0a101f] rounded-full flex items-center justify-center text-xs text-white/60">
                                聲納分佈
                            </div>
                        </div>

                        {/* Impact Echo (Ripples) */}
                        <div className="relative aspect-square flex items-center justify-center">
                            {/* 產生多層波紋 */}
                            {[...Array(stats.weekly.echoLevel)].map((_, i) => (
                                <div key={i} className="absolute border border-blue-300/30 rounded-full animate-ping opacity-20"
                                    style={{
                                        width: `${(i + 1) * 30}%`,
                                        height: `${(i + 1) * 30}%`,
                                        animationDuration: `${2 + i}s`
                                    }}
                                />
                            ))}
                            <div className="z-10 text-gray-50 font-bold text-lg">Impact</div>
                        </div>
                    </div>
                </section>

                {/* --- Layer 3: Deep Archive --- */}
                <section>
                    <h2 className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-2 opacity-50">
                        <span className="w-8 h-px bg-blue-500/30"></span>
                        Deep Archive
                        <span className="flex-1 h-px bg-blue-500/30"></span>
                    </h2>

                    {/* Heatmap */}
                    <div className="flex gap-1 justify-between mb-4">
                        {stats.monthly.heatmap.map((val, i) => (
                            <div key={i}
                                className="flex-1 aspect-1/2 rounded-sm transition-all hover:scale-110"
                                style={{
                                    backgroundColor: `rgba(96, 165, 250, ${0.1 + val * 0.9})`, // Using blue-500 roughly
                                    boxShadow: val > 0.8 ? '0 0 8px rgba(96, 165, 250, 0.5)' : 'none'
                                }}
                            />
                        ))}
                    </div>

                    {/* Evolution Status */}
                    <div className="bg-linear-to-r from-blue-900/40 to-indigo-900/40 rounded-2xl p-6 border border-white/10 flex items-center justify-between">
                        <div>
                            <div className="text-blue-300 text-xs mb-1">目前物種</div>
                            <div className="text-2xl font-bold text-gray-50">{stats.monthly.evolution}</div>
                            <div className="text-xs text-gray-50/40 mt-1">Lv.{stats.monthly.level} / Next: 抹香鯨</div>
                        </div>
                        <div className="text-6xl grayscale opacity-80">🐋</div>
                    </div>
                </section>

            </div>

            {/* CSS Animation for breathe */}
            <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

const StatCard = ({ label, value, unit, icon: Icon }: any) => (
    <div className="bg-blue-900/20 backdrop-blur rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center gap-1">
        <Icon size={16} className="text-blue-300 mb-1" />
        <div className="text-lg font-bold text-gray-50">{value}</div>
        <div className="text-[10px] text-blue-300/60 uppercase">{unit}</div>
    </div>
);

export default SonarView;
