"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";

/**
 * 身分驗證視圖元件
 * 提供登入與註冊功能，使用 Supabase Auth
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
     * 處理表單提交
     * 根據目前模式執行登入或註冊
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            if (isSignUp) {
                // 註冊流程
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) {
                    setErrorMessage(error.message);
                } else {
                    // 註冊成功，提示使用者確認信箱
                    setSuccessMessage("請前往信箱確認驗證信");
                }
            } else {
                // 登入流程
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    setErrorMessage(error.message);
                }
                // 登入成功後，onAuthStateChange 會自動觸發頁面切換
            }
        } catch (err) {
            setErrorMessage("發生未知錯誤，請稍後再試");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-blue-900 flex items-center justify-center px-4">
            {/* 登入/註冊卡片 */}
            <div className="w-full max-w-[400px] bg-blue-800/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
                {/* 標題區 */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-50 mb-2">
                        {isSignUp ? "加入深海" : "潛入深海"}
                    </h1>
                    <p className="text-blue-300 text-sm">
                        {isSignUp ? "創建你的座頭鯨帳號" : "歡迎回來，座頭鯨"}
                    </p>
                </div>

                {/* 表單 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email 輸入框 */}
                    <div className="relative">
                        <Mail
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="電子郵件"
                            required
                            className="w-full bg-blue-700 text-gray-50 placeholder-blue-400/60 rounded-xl py-3 pl-12 pr-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                        />
                    </div>

                    {/* Password 輸入框 */}
                    <div className="relative">
                        <Lock
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="密碼"
                            required
                            minLength={6}
                            className="w-full bg-blue-700 text-gray-50 placeholder-blue-400/60 rounded-xl py-3 pl-12 pr-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                        />
                    </div>

                    {/* 錯誤訊息 - 使用黃色 (禁止紅色) */}
                    {errorMessage && (
                        <div className="text-yellow-500 text-sm text-center py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                            {errorMessage}
                        </div>
                    )}

                    {/* 成功訊息 - 使用黃色提示 */}
                    {successMessage && (
                        <div className="text-yellow-500 text-sm text-center py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                            {successMessage}
                        </div>
                    )}

                    {/* 提交按鈕 */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isLoading ? (
                            <span>處理中...</span>
                        ) : isSignUp ? (
                            <>
                                <UserPlus size={20} />
                                <span>註冊</span>
                            </>
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>登入</span>
                            </>
                        )}
                    </button>
                </form>

                {/* 切換模式按鈕 */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setErrorMessage("");
                            setSuccessMessage("");
                        }}
                        className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                    >
                        {isSignUp ? "已有帳號？點此登入" : "還沒有帳號？點此註冊"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
