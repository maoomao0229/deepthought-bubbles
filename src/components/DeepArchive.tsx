'use client';

import React from 'react';
import { DailyXP, UserLevel, DailyStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { COLORS } from '../constants';
import { TrendingUp } from 'lucide-react';
import { EvolutionPath } from './EvolutionPath';
import { MigrationRhythm } from './MigrationRhythm';

interface DeepArchiveProps {
    monthlyData: DailyXP[];
    userLevel: UserLevel;
    dailyStats: DailyStats;
}

const DeepArchive: React.FC<DeepArchiveProps> = ({ monthlyData, userLevel, dailyStats }) => {
    return (
        <div className="space-y-6 w-full">
            {/* Section Header */}
            <h2 className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-2 opacity-50">
                <span className="w-8 h-px bg-blue-500/30"></span>
                Deep Archive
                <span className="flex-1 h-px bg-blue-500/30"></span>
            </h2>

            {/* 1. Evolution Path Component */}
            <EvolutionPath userLevel={userLevel} dailyStats={dailyStats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Migration Rhythm (Bioluminescent Heatmap) */}
                <div className="lg:col-span-1 min-h-[300px]">
                    <MigrationRhythm data={monthlyData} />
                </div>

                {/* 3. Trench Exploration (Depth Chart) */}
                <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-indigo-300" />
                        <h3 className="text-lg font-bold text-slate-50">海溝探勘紀錄</h3>
                    </div>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorDepth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.abyss500} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#334155"
                                    vertical={false}
                                    opacity={0.3}
                                />
                                <XAxis dataKey="date" hide />
                                <YAxis
                                    reversed
                                    tick={{ fill: '#475569', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 1200]}
                                    unit="m"
                                    width={45}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderColor: COLORS.abyss500,
                                        color: '#fff',
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: '#64748b' }}
                                    formatter={(value: number) => [`${value}m`, '最大深度']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="maxDepth"
                                    stroke={COLORS.abyss500}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorDepth)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeepArchive;
