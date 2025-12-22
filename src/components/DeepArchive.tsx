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

            <div className="space-y-6">
                {/* 2. Migration Rhythm (Bioluminescent Heatmap) */}
                <div className="w-full">
                    <MigrationRhythm data={monthlyData} />
                </div>

                {/* 3. Trench Exploration (Depth Chart) */}
                <div className="w-full bg-gray-50/5 rounded-3xl p-6 shadow-xl border border-blue-700/30">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-indigo-300" />
                        <h3 className="text-lg font-bold text-gray-50">海溝探勘紀錄</h3>
                    </div>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorDepth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.indigo500} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={COLORS.blue700}
                                    vertical={false}
                                    opacity={0.3}
                                />
                                <XAxis dataKey="date" hide />
                                <YAxis
                                    reversed
                                    tick={{ fill: COLORS.blue300, fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 1200]}
                                    unit="m"
                                    width={45}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: COLORS.gray900,
                                        borderColor: COLORS.indigo500,
                                        color: COLORS.gray50,
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: COLORS.gray500 }}
                                    formatter={(value: number | undefined) => value !== undefined ? [`${value}m`, '最大深度'] : ['N/A', '最大深度']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="maxDepth"
                                    stroke={COLORS.indigo500}
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
