export interface DailyStats {
    originalWords: number;
    replyWords: number;
    readShallow: number; // Count
    readMedium: number;  // Count
    readDeep: number;    // Count
    resonance: number;   // Received likes/comments
    saved: number;       // Saved items
    streak: number;
    isTaskComplete: boolean;
}

export interface WeeklyTopic {
    name: string;
    interactionCount: number;
    color: string;
}

export interface WeeklyWaveData {
    myBubbles: number;
    responses: number;
    resonance: number;
    topics: WeeklyTopic[];
}

export interface DailyXP {
    date: string; // YYYY-MM-DD
    xp: number;
    maxDepth: number; // [新增] 當日探索最大深度 (公尺)
}

export interface UserLevel {
    currentXP: number;
    levelName: string; // Sea Dog, Bottlenose Dolphin, etc.
    nextLevelXP: number;
}
