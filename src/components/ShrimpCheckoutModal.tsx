import React, { useState } from 'react';
import { X, Heart, CreditCard, CheckCircle, Loader2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const ShrimpCheckoutModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    if (!isOpen) return null;

    const handlePayment = () => {
        setStatus('processing');
        // 模擬 API 請求延遲
        setTimeout(() => {
            setStatus('success');
        }, 2000);
    };

    const handleClose = () => {
        setStatus('idle');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center px-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-blue-950/80 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal 本體 */}
            <div className="relative bg-gray-900 border border-blue-700/50 w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-blue-900/50 overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* 裝飾背景光 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                {/* 關閉按鈕 */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-blue-300 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* 內容區：依狀態切換 */}
                {status === 'idle' && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                                <img src="/prawn.png" alt="Shrimp" className="w-8 h-8 opacity-90" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-50">給予蝦米支持</h3>
                            <p className="text-blue-200 text-sm leading-relaxed">
                                蝦米 (Shrimp) 是維持深海生態運作的重要能量。
                                <br />您的投餵將幫助我們持續探索未知的海域。
                            </p>
                        </div>

                        {/* 付費方案選擇 (裝飾用) */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-3 rounded-xl border border-yellow-500/50 bg-yellow-500/10 text-yellow-400 font-bold text-sm hover:bg-yellow-500/20 transition-all flex flex-col items-center gap-1">
                                <span>🦐 小蝦米</span>
                                <span className="text-xs opacity-80">$ 1.99 USD</span>
                            </button>
                            <button className="p-3 rounded-xl border border-blue-700 bg-blue-900/50 text-blue-300 font-bold text-sm hover:border-yellow-500/30 hover:text-yellow-300 transition-all flex flex-col items-center gap-1">
                                <span>🦞 龍蝦大餐</span>
                                <span className="text-xs opacity-60">$ 9.99 USD</span>
                            </button>
                        </div>

                        {/* 說明與按鈕 */}
                        <div className="pt-4 border-t border-blue-800/50">
                            <div className="flex items-center gap-2 text-[10px] text-blue-400 mb-4 bg-blue-950/50 p-2 rounded-lg">
                                <CreditCard className="w-3 h-3" />
                                <span>模擬測試模式：點擊按鈕不會實際扣款</span>
                            </div>
                            <button
                                onClick={handlePayment}
                                className="w-full py-3 px-4 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-blue-950 font-bold rounded-xl shadow-lg shadow-yellow-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <img src="/prawn.png" alt="Shrimp" className="w-4 h-4 opacity-80" />
                                確認投餵
                            </button>
                        </div>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
                        <p className="text-blue-200 font-mono text-sm animate-pulse">正在傳送蝦米能量...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-2xl font-bold text-white">投餵成功！</h3>
                            <p className="text-blue-200 text-sm">感謝您對深海生態的貢獻</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="mt-6 px-8 py-2 bg-blue-800 hover:bg-blue-700 text-blue-100 rounded-full text-sm font-medium transition-colors"
                        >
                            關閉視窗
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
