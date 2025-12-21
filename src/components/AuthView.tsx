"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, LogIn, UserPlus, Globe, Ghost, AlertCircle } from "lucide-react"; // 新增 AlertCircle
import DeepSeaBackground from "./DeepSeaBackground"; // 引入 3D 深海背景

/**
 * 身分驗證視圖元件
 * 提供登入、註冊與匿名訪客功能，使用 Supabase Auth
 */
const AuthView = () => {
    // 表單狀態
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI 狀態
    const [isSignUp, setIsSignUp] = useState(false); // 切換登入/註冊模式
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /**
     * 處理 Email/密碼 表單提交
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) {
                    setErrorMessage(error.message);
                } else {
                    setSuccessMessage("請前往信箱確認驗證信");
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    setErrorMessage(error.message);
                }
            }
        } catch (err) {
            setErrorMessage("發生未知錯誤，請稍後再試");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 處理 Google 登入
     */
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) setErrorMessage(error.message);
        } catch (err) {
            setErrorMessage("無法連接到 Google 登入");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 處理訪客匿名登入
     */
    const handleAnonymousLogin = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const { error } = await supabase.auth.signInAnonymously();
            if (error) setErrorMessage(error.message);
        } catch (err) {
            setErrorMessage("訪客登入失敗");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center px-4 overflow-hidden font-sans bg-blue-900"> {/* 設定一個 fallback 背景色 */}

            {/* 🌊 3D 深海背景 (z-index: 0) */}
            <DeepSeaBackground />

            {/* 登入/註冊卡片 (z-index: 10) - 磨砂玻璃氣泡風格 */}
            <div className="relative z-10 w-full max-w-[380px] bg-blue-900/20 backdrop-blur-xl rounded-4xl border border-blue-300/20 shadow-[0_8px_32px_rgba(49,103,148,0.25)] p-8 overflow-hidden animate-fade-in">
                {/* 卡片內部光暈裝飾 */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>

                {/* 標題區 */}
                <div className="text-center mb-8 relative">
                    <h1 className="text-3xl font-bold text-gray-50 mb-2 tracking-tight drop-shadow-md">
                        {isSignUp ? "加入深海" : "潛入深海"}
                    </h1>
                    <p className="text-blue-300/80 text-sm font-medium tracking-wide">
                        {isSignUp ? "創建你的座頭鯨帳號" : "歡迎回來，探索者"}
                    </p>
                </div>

                {/* 主要登入表單 */}
                <form onSubmit={handleSubmit} className="space-y-5 mb-6 relative">
                    <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/70 group-focus-within:text-blue-300 transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="電子郵件"
                            required
                            className="w-full bg-blue-900/30 hover:bg-blue-900/40 text-gray-50 placeholder-blue-300/50 rounded-2xl py-3.5 pl-12 pr-4 border border-blue-300/10 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm shadow-inner"
                        />
                    </div>

                    <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/70 group-focus-within:text-blue-300 transition-colors" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="密碼"
                            required
                            minLength={6}
                            className="w-full bg-blue-900/30 hover:bg-blue-900/40 text-gray-50 placeholder-blue-300/50 rounded-2xl py-3.5 pl-12 pr-4 border border-blue-300/10 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm shadow-inner"
                        />
                    </div>

                    {/* 錯誤訊息 - 使用 Yellow 色系 */}
                    {errorMessage && (
                        <div className="flex items-center gap-2 text-yellow-500 text-xs py-2 px-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 animate-fade-in font-medium">
                            <AlertCircle size={14} className="shrink-0" />
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    {/* 成功訊息 - 使用 Green 色系 */}
                    {successMessage && (
                        <div className="text-green-300 text-xs text-center py-2 px-3 bg-green-500/10 rounded-xl border border-green-500/20 animate-fade-in font-medium">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-gray-50 font-bold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-gray-50/30 border-t-gray-50 rounded-full animate-spin" />
                        ) : isSignUp ? (
                            <><UserPlus size={18} /><span>建立帳號</span></>
                        ) : (
                            <><LogIn size={18} /><span>開始潛入</span></>
                        )}
                    </button>
                </form>

                {/* 分隔線 */}
                <div className="relative flex items-center py-2 mb-6">
                    <div className="grow border-t border-blue-300/10"></div>
                    <span className="shrink mx-4 text-blue-300/50 text-[10px] tracking-widest uppercase font-medium">或者透過</span>
                    <div className="grow border-t border-blue-300/10"></div>
                </div>

                {/* 第三方登入按鈕區 */}
                <div className="space-y-3 relative">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-gray-50/5 hover:bg-gray-50/10 text-gray-50 py-3 rounded-2xl border border-gray-50/10 transition-all flex items-center justify-center gap-3 text-sm font-medium disabled:opacity-50 hover:border-gray-50/20 active:bg-gray-50/15 shadow-sm"
                    >
                        <Globe size={16} className="text-blue-300" />
                        Google 登入探索
                    </button>

                    <button
                        type="button"
                        onClick={handleAnonymousLogin}
                        disabled={isLoading}
                        className="w-full bg-transparent hover:bg-blue-300/5 text-blue-300/80 py-3 rounded-2xl border border-dashed border-blue-300/20 transition-all flex items-center justify-center gap-3 text-xs font-medium disabled:opacity-50"
                    >
                        <Ghost size={16} className="text-blue-300/60" />
                        先以訪客身分逛逛
                    </button>
                </div>

                {/* 切換模式連結 */}
                <div className="mt-8 text-center relative">
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setErrorMessage("");
                            setSuccessMessage("");
                        }}
                        className="text-blue-300/70 hover:text-gray-50 text-xs transition-colors tracking-wide font-medium border-b border-transparent hover:border-blue-300/50 pb-0.5"
                    >
                        {isSignUp ? "已有帳號？點此潛入" : "還渴望新的身分？點此加入"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
