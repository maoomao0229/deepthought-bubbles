"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, LogIn, UserPlus, Globe, Ghost } from "lucide-react";
import DeepSeaBackground from "./DeepSeaBackground";

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
        <div className="min-h-screen w-full relative flex items-center justify-center px-4 overflow-hidden bg-black">

            {/*  深海 3D 漸層背景 (z-index: 0) */}
            <div className="absolute inset-0 z-0">
                <DeepSeaBackground />
            </div>

            {/* 登入/註冊卡片 (z-index: 10) */}
            <div className="relative z-10 w-full max-w-[400px] bg-blue-950/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 overflow-y-auto max-h-[90vh] animate-fade-in">
                {/* 標題區 */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">
                        {isSignUp ? "加入深海" : "潛入深海"}
                    </h1>
                    <p className="text-blue-200/80 text-sm font-light tracking-wide">
                        {isSignUp ? "創建你的座頭鯨帳號" : "歡迎回來，探索者"}
                    </p>
                </div>

                {/* 主要登入表單 */}
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-100 transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="電子郵件"
                            required
                            className="w-full bg-blue-900/40 hover:bg-blue-900/60 text-white placeholder-blue-300/50 rounded-xl py-3.5 pl-12 pr-4 border border-blue-500/20 focus:border-blue-400/50 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all font-light text-sm"
                        />
                    </div>

                    <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-100 transition-colors" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="密碼"
                            required
                            minLength={6}
                            className="w-full bg-blue-900/40 hover:bg-blue-900/60 text-white placeholder-blue-300/50 rounded-xl py-3.5 pl-12 pr-4 border border-blue-500/20 focus:border-blue-400/50 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all font-light text-sm"
                        />
                    </div>

                    {errorMessage && (
                        <div className="text-red-300 text-xs text-center py-2 bg-red-500/10 rounded-lg border border-red-500/20 px-3">
                            {errorMessage}
                        </div>
                    )}

                    {successMessage && (
                        <div className="text-green-300 text-xs text-center py-2 bg-green-500/10 rounded-lg border border-green-500/20 px-3">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/50 active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : isSignUp ? (
                            <><UserPlus size={18} /><span>建立帳號</span></>
                        ) : (
                            <><LogIn size={18} /><span>開始潛入</span></>
                        )}
                    </button>
                </form>

                {/* 分隔線 */}
                <div className="relative flex items-center py-2 mb-6">
                    <div className="grow border-t border-white/10"></div>
                    <span className="shrink mx-4 text-blue-300/40 text-[10px] tracking-widest uppercase">或者透過</span>
                    <div className="grow border-t border-white/10"></div>
                </div>

                {/* 第三方登入按鈕區 */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-3 text-sm font-medium disabled:opacity-50 hover:border-white/20 active:bg-white/15"
                    >
                        <Globe size={16} className="text-blue-200" />
                        Google 登入探索
                    </button>

                    <button
                        type="button"
                        onClick={handleAnonymousLogin}
                        disabled={isLoading}
                        className="w-full bg-transparent hover:bg-white/5 text-blue-200/80 py-3 rounded-xl border border-dashed border-blue-400/20 transition-all flex items-center justify-center gap-3 text-xs font-light disabled:opacity-50"
                    >
                        <Ghost size={16} className="text-blue-300/60" />
                        先以訪客身分逛逛
                    </button>
                </div>

                {/* 切換模式連結 */}
                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setErrorMessage("");
                            setSuccessMessage("");
                        }}
                        className="text-blue-300/60 hover:text-white text-xs transition-colors tracking-wide border-b border-transparent hover:border-blue-300/50 pb-0.5"
                    >
                        {isSignUp ? "已有帳號？點此潛入" : "還渴望新的身分？點此加入"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
