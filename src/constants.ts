import { DailyStats, WeeklyWaveData, DailyXP, UserLevel } from './types';

// Palette references for charts
export const COLORS = {
    blue900: '#316794',
    blue700: '#4376A0',
    blue500: '#5B8BB4',
    blue300: '#7AA6C9',
    blue100: '#9FC1DD',
    indigo900: '#3B489D',
    indigo500: '#6571BC',
    green500: '#54B39E',
    yellow700: '#F8B75C',
    yellow500: '#FFC678',
    gray900: '#161819',
    gray500: '#898A91',
    gray50: '#FFFBF6',
};

export const TOPICS = ['哲學', '時事', '議題', '生活', '奇想', '科普'];

// Mock Data Generators

export const generateDailyStats = (): DailyStats => {
    return {
        originalWords: Math.floor(Math.random() * 500),
        replyWords: Math.floor(Math.random() * 300),
        readShallow: Math.floor(Math.random() * 5),
        readMedium: Math.floor(Math.random() * 3),
        readDeep: Math.floor(Math.random() * 2),
        resonance: Math.floor(Math.random() * 8), // Max 10 restricted in UI logic
        saved: Math.floor(Math.random() * 5),
        streak: Math.floor(Math.random() * 40),
        isTaskComplete: Math.random() > 0.3,
    };
};

export const generateWeeklyData = (): WeeklyWaveData => {
    return {
        myBubbles: Math.floor(Math.random() * 20) + 10,
        responses: Math.floor(Math.random() * 20) + 15, // Approx 15-35 for better radar visualization
        resonance: Math.floor(Math.random() * 20) + 10, // Approx 10-30 for better radar visualization
        topics: TOPICS.map((t, i) => ({
            name: t,
            interactionCount: Math.floor(Math.random() * 100),
            color: [COLORS.indigo500, COLORS.blue500, COLORS.green500, COLORS.yellow500, '#A6AEE1', '#8DD3C7'][i],
        })),
    };
};

export const generateMonthlyData = (): DailyXP[] => {
    const data: DailyXP[] = [];
    // Generate 16 weeks (112 days) of data for a nice heatmap
    const days = 112;
    const today = new Date();

    for (let i = days; i > 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        // Random activity distribution
        const rand = Math.random();
        let xp = 0;

        if (rand > 0.8) xp = Math.floor(Math.random() * 200) + 300; // High: 300+
        else if (rand > 0.5) xp = Math.floor(Math.random() * 200) + 100; // Medium: 100-300
        else if (rand > 0.2) xp = Math.floor(Math.random() * 100) + 1; // Low: 1-100
        // else 0 XP

        const isDeepDive = xp > 300;

        data.push({
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
            xp: xp,
            maxDepth: isDeepDive
                ? Math.floor(Math.random() * 400) + 800 // High XP = Deeper (800-1200m)
                : Math.floor(Math.random() * 600) + 100 // Low XP = Shallower (100-700m)
        });
    }
    return data;
};

export const calculatePressure = (stats: DailyStats): number => {
    // Pressure Formula: (Shallow x 1) + (Medium x 5) + (Deep x 20)
    return (stats.readShallow * 1) + (stats.readMedium * 5) + (stats.readDeep * 20);
};

export const calculateLungCapacity = (stats: DailyStats): number => {
    // Formula: (Original * 1.5) + (Reply * 1.0)
    // Target: 300 words base
    const totalVolume = (stats.originalWords * 1.5) + (stats.replyWords * 1.0);
    const percentage = Math.min((totalVolume / 300) * 100, 150); // Cap visual at 150%
    return percentage;
};

export const calculateDailyXP = (stats: DailyStats): number => {
    let xp = 0;

    // Fixed XP
    if (stats.isTaskComplete) xp += 100;

    // Streak XP: (n-1) * 10, max 300
    if (stats.streak > 1) {
        xp += Math.min((stats.streak - 1) * 10, 300);
    }

    // Dynamic XP
    xp += stats.originalWords + stats.replyWords; // 1 word = 1 XP

    // Reading Depth XP
    xp += stats.readDeep * 50;
    xp += stats.readMedium * 15;
    xp += stats.readShallow * 5;

    return xp;
};

export const LEVEL_THRESHOLDS = {
    LV1: 0,
    LV2: 5000,
};
