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
        </div>
    );
};

export default DeepArchive;
