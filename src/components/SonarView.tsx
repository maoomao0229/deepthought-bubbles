import React, { useMemo } from 'react';
import DailyPing from './DailyPing';
import WeeklyWave from './WeeklyWave';
import DeepArchive from './DeepArchive';
import {
    generateDailyStats,
    generateWeeklyData,
    generateMonthlyData,
    calculatePressure
} from '../constants';
import { DailyStats, WeeklyWaveData, DailyXP, UserLevel } from '../types';

const SonarView = ({ user }: { user: any }) => {
    // --- 1. Data Mocking (using generators) ---

    const dailyStats: DailyStats = useMemo(() => {
        return generateDailyStats();
    }, []);

    const weeklyData: WeeklyWaveData = useMemo(() => {
        return generateWeeklyData();
    }, []);

    const monthlyData: DailyXP[] = useMemo(() => {
        return generateMonthlyData();
    }, []);

    const userLevel: UserLevel = useMemo(() => ({
        currentXP: 3450,
        levelName: '座頭鯨',
        nextLevelXP: 5000,
    }), []);

    // Calculate dynamic pressure for the overlay background
    const pressureValue = useMemo(() => calculatePressure(dailyStats), [dailyStats]);
    // Normalize pressure for opacity (0 to 1 range, assuming max pressure ~100 for visual)
    const pressureOpacity = Math.min(Math.max(0.3, pressureValue / 100), 0.9);

    return (
        <div className="w-full h-full relative overflow-y-auto overflow-x-hidden pt-20 pb-32 no-scrollbar">

            {/* Background: Water Pressure Overlay */}
            {/* 根據水壓值改變暗角濃度，營造深海恐懼/沈浸感 */}
            <div
                className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
                style={{
                    background: 'radial-gradient(circle at center, transparent 0%, #020617 120%)',
                    opacity: pressureOpacity
                }}
            />

            {/* Main Content Container */}
            <div className="relative z-10 px-6 space-y-12 max-w-lg mx-auto">

                {/* --- Layer 1: The Daily Ping --- */}
                {/* Pass calculated stats to the DailyPing component */}
                <section>
                    <DailyPing stats={dailyStats} />
                </section>

                {/* --- Layer 2: The Weekly Wave --- */}
                {/* Pass weekly aggregation data */}
                <section>
                    <WeeklyWave data={weeklyData} />
                </section>

                {/* --- Layer 3: Deep Archive --- */}
                {/* Pass historical and profile data */}
                <section>
                    <DeepArchive
                        monthlyData={monthlyData}
                        userLevel={userLevel}
                        dailyStats={dailyStats}
                    />
                </section>

            </div>
        </div>
    );
};

export default SonarView;
