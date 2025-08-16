'use client';

import React, { useEffect } from 'react';
import { X, Zap, Clock, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { useApiLimit } from '@/contexts/ApiLimitContext';
import { createPortal } from 'react-dom';

interface ApiLimitAlertProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ApiLimitAlert: React.FC<ApiLimitAlertProps> = ({ isOpen, onClose }) => {
    const { remainingCalls, dailyLimit, getTimeUntilReset, resetLimitManually } = useApiLimit();
    const { hours, minutes } = getTimeUntilReset();

    const isLimitReached = remainingCalls === 0;
    const isLowOnCalls = remainingCalls <= 2 && remainingCalls > 0;
    const usedCalls = dailyLimit - remainingCalls;
    const usagePercentage = (usedCalls / dailyLimit) * 100;

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getStatusConfig = () => {
        if (isLimitReached) {
            return {
                icon: <Clock className="w-8 h-8 text-red-500" />,
                title: "Daily Limit Reached",
                titleColor: "text-red-700",
                bgGradient: "from-red-50 to-orange-50",
                borderColor: "border-red-200",
                accentColor: "text-red-600",
                progressColor: "bg-red-500"
            };
        } else if (isLowOnCalls) {
            return {
                icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
                title: "Running Low on Requests",
                titleColor: "text-yellow-700",
                bgGradient: "from-yellow-50 to-orange-50",
                borderColor: "border-yellow-200",
                accentColor: "text-yellow-600",
                progressColor: "bg-yellow-500"
            };
        } else {
            return {
                icon: <CheckCircle className="w-8 h-8 text-green-500" />,
                title: "You're All Set!",
                titleColor: "text-green-700",
                bgGradient: "from-green-50 to-blue-50",
                borderColor: "border-green-200",
                accentColor: "text-green-600",
                progressColor: "bg-green-500"
            };
        }
    };

    const config = getStatusConfig();

    const handleReset = async () => {
        try {
            await resetLimitManually();
            onClose();
        } catch (error) {
            console.error('Failed to reset limit:', error);
        }
    };



    const modalContent = (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className={`
          relative w-full max-w-md bg-gradient-to-br ${config.bgGradient}
          border ${config.borderColor} rounded-2xl shadow-2xl
          animate-in zoom-in-95 slide-in-from-bottom-4 duration-300
        `}>
                    {/* Animated Background Elements */}
                    <div className="absolute top-4 right-4 opacity-10">
                        <Sparkles className="w-16 h-16 text-orange-500 animate-pulse" />
                    </div>
                    <div className="absolute bottom-4 left-4 opacity-5">
                        <Zap className="w-20 h-20 text-blue-500 animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200 z-10"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-white/80 rounded-full shadow-lg">
                                    {config.icon}
                                </div>
                            </div>
                            <h2 className={`text-2xl font-bold ${config.titleColor} mb-2`}>
                                {config.title}
                            </h2>
                            <p className="text-gray-600">
                                {isLimitReached
                                    ? "Your daily AI requests have been used up"
                                    : isLowOnCalls
                                        ? "You're running low on today's AI requests"
                                        : "You have plenty of AI requests available"
                                }
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50">
                                <div className={`text-2xl font-bold ${config.accentColor}`}>
                                    {remainingCalls}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">Remaining</div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50">
                                <div className={`text-2xl font-bold ${config.accentColor}`}>
                                    {usedCalls}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">Used Today</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Daily Usage</span>
                                <span>{Math.round(usagePercentage)}%</span>
                            </div>
                            <div className="w-full bg-white/50 rounded-full h-3 shadow-inner">
                                <div
                                    className={`h-3 rounded-full ${config.progressColor} transition-all duration-1000 ease-out relative overflow-hidden`}
                                    style={{ width: `${usagePercentage}%` }}
                                >
                                    {/* Animated shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                </div>
                            </div>
                        </div>

                        {/* Reset Time or Call to Action */}
                        {isLimitReached ? (
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/50">
                                <div className="flex items-center justify-center gap-2 text-center">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                    <div>
                                        <div className="font-semibold text-gray-700">Resets in</div>
                                        <div className="text-2xl font-bold text-orange-600">
                                            {hours}h {minutes}m
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/50">
                                <div className="text-center">
                                    <div className="font-semibold text-gray-700 mb-1">
                                        {isLowOnCalls ? "Use them wisely!" : "Ready for AI magic!"}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Limit resets at midnight ({hours}h {minutes}m from now)
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={onClose}
                                className={`
                  w-full py-3 px-4 rounded-xl font-semibold text-white
                  bg-gradient-to-r from-orange-500 to-red-500
                  hover:from-orange-600 hover:to-red-600
                  transform hover:scale-105 active:scale-95
                  transition-all duration-200
                  shadow-lg hover:shadow-xl
                `}
                            >
                                {isLimitReached ? "Got it!" : "Continue Working"}
                            </button>

                            {/* Development Reset Button */}
                            {/* {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={handleReset}
                  className="w-full py-2 px-4 rounded-xl font-medium text-gray-700 bg-white/70 hover:bg-white/90 border border-white/50 transition-all duration-200"
                >
                  Reset Limit (Dev Only)
                </button>
              )} */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </>
    );

    // Render the modal using portal to escape parent container
    return typeof window !== 'undefined'
        ? createPortal(modalContent, document.body)
        : null;
    // };

};

// Hook for easy modal management
export const useApiLimitAlert = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    const openAlert = () => setIsOpen(true);
    const closeAlert = () => setIsOpen(false);

    return {
        isOpen,
        openAlert,
        closeAlert,
        ApiLimitAlert: ({ className = '' }: { className?: string }) => (
            <div className={className}>
                <ApiLimitAlert isOpen={isOpen} onClose={closeAlert} />
            </div>
        ),
    };
};