"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, LogIn, UserPlus, Globe, Ghost, AlertCircle, ArrowLeft } from "lucide-react";
import DeepSeaBackground from "./DeepSeaBackground";
import Image from "next/image";

// 定義三個階段
type AuthStage = "landing" | "login" | "signup";

/**
 * 身分驗證視圖元件
 * 提供三階段分流：Landing → Login/Signup，使用 Supabase Auth
 */
const AuthView = () => {
    // 階段狀態
    const [stage, setStage] = useState<AuthStage>("landing");

    // 表單狀態
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI 狀態
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
            if (stage === "signup") {
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
                    redirectTo: `${window.location.origin}/`,
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

    /**
     * 返回 Landing 階段
     */
    const handleBack = () => {
        setStage("landing");
        setEmail("");
        setPassword("");
        setErrorMessage("");
        setSuccessMessage("");
    };

    /**
     * 渲染 Landing 階段
     */
    const renderLanding = () => (
        <div className="relative z-10 w-full max-w-[380px] flex flex-col items-center justify-center animate-fade-in px-6">
            {/* Logo */}
            <div className="w-28 h-28 rounded-full border-2 border-white/30 shadow-[0_0_40px_rgba(255,255,255,0.15)] overflow-hidden mb-8 bg-white/10 backdrop-blur-md">
                <Image
                    src="/favicon.ico"
                    alt="DeepThought Bubbles Logo"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Slogan */}
            <div className="text-center mb-12">
                <p className="text-blue-100/90 text-lg font-medium tracking-wide mb-1">吐出你的想法</p>
                <p className="text-blue-200/70 text-base tracking-wide">讓泡泡圈住知識</p>
            </div>

            {/* Buttons */}
            <div className="w-full space-y-4">
                {/* 登入按鈕 */}
                <button
                    onClick={() => setStage("login")}
                    className="w-full bg-blue-900/30 backdrop-blur-xl hover:bg-blue-900/40 text-gray-50 py-4 rounded-2xl border border-white/10 transition-all font-medium text-base shadow-lg hover:border-white/20 active:scale-[0.98] touch-manipulation"
                >
                    登入
                </button>

                {/* 註冊按鈕 */}
                <button
                    onClick={() => setStage("signup")}
                    className="w-full bg-blue-900/30 backdrop-blur-xl hover:bg-blue-900/40 text-gray-50 py-4 rounded-2xl border border-white/10 transition-all font-medium text-base shadow-lg hover:border-white/20 active:scale-[0.98] touch-manipulation"
                >
                    註冊
                </button>

                {/* 訪客按鈕 */}
                <button
                    onClick={handleAnonymousLogin}
                    disabled={isLoading}
                    className="w-full bg-transparent hover:bg-blue-300/5 text-blue-300/80 py-3 rounded-2xl border border-dashed border-blue-300/20 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 touch-manipulation"
                >
                    <Ghost size={16} className="text-blue-300/60" />
                    先以訪客身分逛逛
                </button>
            </div>
        </div>
    );

    /**
     * 渲染 Login/Signup 表單階段
     */
    const renderForm = () => (
        <div className="relative z-10 w-full max-w-[380px] bg-blue-900/20 backdrop-blur-xl rounded-3xl border border-blue-300/20 shadow-[0_8px_32px_rgba(49,103,148,0.25)] p-5 sm:p-6 overflow-hidden animate-fade-in my-4">
            {/* 卡片內部光暈裝飾 */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            {/* 返回按鈕 */}
            <button
                onClick={handleBack}
                className="absolute top-4 left-4 p-2 text-blue-300/60 hover:text-white transition-colors rounded-full hover:bg-white/5 z-20"
            >
                <ArrowLeft size={20} />
            </button>

            {/* 標題區 */}
            <div className="text-center mb-4 sm:mb-6 relative pt-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-50 mb-1 tracking-tight drop-shadow-md">
                    {stage === "signup" ? "加入深海" : "潛入深海"}
                </h1>
                <p className="text-blue-300/80 text-xs sm:text-sm font-medium tracking-wide">
                    {stage === "signup" ? "創建你的座頭鯨帳號" : "歡迎回來，探索者"}
                </p>
            </div>

            {/* 主要登入表單 */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mb-4 relative">
                <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/70 group-focus-within:text-blue-300 transition-colors" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="電子郵件"
                        required
                        className="w-full bg-blue-900/30 hover:bg-blue-900/40 text-gray-50 placeholder-blue-300/50 rounded-xl py-3 pl-11 pr-4 border border-blue-300/10 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm shadow-inner"
                    />
                </div>

                <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/70 group-focus-within:text-blue-300 transition-colors" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="密碼"
                        required
                        minLength={6}
                        className="w-full bg-blue-900/30 hover:bg-blue-900/40 text-gray-50 placeholder-blue-300/50 rounded-xl py-3 pl-11 pr-4 border border-blue-300/10 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm shadow-inner"
                    />
                </div>

                {/* 錯誤訊息 */}
                {errorMessage && (
                    <div className="flex items-center gap-2 text-yellow-500 text-xs py-2 px-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 animate-fade-in font-medium">
                        <AlertCircle size={14} className="shrink-0" />
                        <p>{errorMessage}</p>
                    </div>
                )}

                {/* 成功訊息 */}
                {successMessage && (
                    <div className="text-green-300 text-xs text-center py-2 px-3 bg-green-500/10 rounded-xl border border-green-500/20 animate-fade-in font-medium">
                        {successMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-gray-50 font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-[0.98] touch-manipulation"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-gray-50/30 border-t-gray-50 rounded-full animate-spin" />
                    ) : stage === "signup" ? (
                        <><UserPlus size={16} /><span>建立帳號</span></>
                    ) : (
                        <><LogIn size={16} /><span>開始潛入</span></>
                    )}
                </button>
            </form>

            {/* 分隔線 */}
            <div className="relative flex items-center py-1 mb-3">
                <div className="grow border-t border-blue-300/10"></div>
                <span className="shrink mx-3 text-blue-300/50 text-[10px] tracking-widest uppercase font-medium">或者透過</span>
                <div className="grow border-t border-blue-300/10"></div>
            </div>

            {/* 第三方登入按鈕區 */}
            <div className="space-y-2 relative">
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-gray-50/5 hover:bg-gray-50/10 text-gray-50 py-2.5 rounded-xl border border-gray-50/10 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 hover:border-gray-50/20 active:bg-gray-50/15 shadow-sm touch-manipulation"
                >
                    <Globe size={14} className="text-blue-300" />
                    Google 登入探索
                </button>

                <button
                    type="button"
                    onClick={handleAnonymousLogin}
                    disabled={isLoading}
                    className="w-full bg-transparent hover:bg-blue-300/5 text-blue-300/80 py-2.5 rounded-xl border border-dashed border-blue-300/20 transition-all flex items-center justify-center gap-2 text-xs font-medium disabled:opacity-50 touch-manipulation"
                >
                    <Ghost size={14} className="text-blue-300/60" />
                    先以訪客身分逛逛
                </button>
            </div>

            {/* 切換模式連結 */}
            <div className="mt-4 text-center relative">
                <button
                    type="button"
                    onClick={() => {
                        setStage(stage === "signup" ? "login" : "signup");
                        setErrorMessage("");
                        setSuccessMessage("");
                    }}
                    className="text-blue-300/70 hover:text-gray-50 text-xs transition-colors tracking-wide font-medium border-b border-transparent hover:border-blue-300/50 pb-0.5"
                >
                    {stage === "signup" ? "已有帳號？點此潛入" : "還渴望新的身分？點此加入"}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center px-4 py-6 overflow-y-auto font-sans bg-blue-900">
            {/* 🌊 3D 深海背景 (z-index: 0) - 保持不變 */}
            <DeepSeaBackground />

            {/* 根據階段渲染不同內容 */}
            {stage === "landing" ? renderLanding() : renderForm()}
        </div>
    );
};

export default AuthView;
