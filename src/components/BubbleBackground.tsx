"use client";

import React from "react";

const BubbleBackground = () => {
    // 產生隨機氣泡參數
    const bubbles = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        size: Math.random() * 60 + 20 + "px", // 20px ~ 80px
        left: Math.random() * 100 + "%",
        delay: Math.random() * 15 + "s",
        duration: Math.random() * 10 + 15 + "s", // 15s ~ 25s
        colorClass: [
            "bg-blue-300/20 shadow-[0_0_15px_rgba(122,166,201,0.3)]",
            "bg-indigo-300/20 shadow-[0_0_15px_rgba(132,142,207,0.3)]",
            "bg-green-300/10 shadow-[0_0_15px_rgba(117,201,182,0.2)]"
        ][Math.floor(Math.random() * 3)],
    }));

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* 背景底色漸層：明亮通透的海洋光影 */}
            <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#5B8BB4_0%,#316794_40%,#3B489D_100%)]"></div>
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div> {/* 可選：加入噪點增加質感 */}

            {/* 漂浮氣泡層 */}
            {bubbles.map((bubble) => (
                <div
                    key={bubble.id}
                    className={`absolute rounded-full backdrop-blur-[2px] animate-float-bubble ${bubble.colorClass}`}
                    style={{
                        width: bubble.size,
                        height: bubble.size,
                        left: bubble.left,
                        bottom: "-100px",
                        animationDelay: bubble.delay,
                        animationDuration: bubble.duration,
                    }}
                />
            ))}
        </div>
    );
};

export default BubbleBackground;
