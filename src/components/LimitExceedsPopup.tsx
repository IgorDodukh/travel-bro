'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Ban, Zap, AlertTriangle, Coffee, Moon } from 'lucide-react';
import { useApiLimit } from '@/contexts/ApiLimitContext';

interface LimitExceededPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LimitExceededPopup: React.FC<LimitExceededPopupProps> = ({ isOpen, onClose }) => {
    const { getTimeUntilReset, dailyLimit, resetLimitManually } = useApiLimit();
    const { hours, minutes } = getTimeUntilReset();

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

    const handleReset = async () => {
        try {
            await resetLimitManually();
            onClose();
        } catch (error) {
            console.error('Failed to reset limit:', error);
        }
    };

    // Use portal to render outside parent container
    const popupContent = (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Popup */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-md bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border border-red-200 rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

                    {/* Animated Background Elements */}
                    <div className="absolute top-6 right-6 opacity-10">
                        <Ban className="w-20 h-20 text-red-500 animate-pulse" />
                    </div>
                    <div className="absolute bottom-6 left-6 opacity-5">
                        <Zap className="w-24 h-24 text-orange-500 animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>

                    {/* Floating particles */}
                    <div className="absolute top-12 left-12 w-2 h-2 bg-red-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute top-20 right-16 w-1 h-1 bg-orange-400 rounded-full animate-bounce opacity-40" style={{ animationDelay: '1.2s' }} />
                    <div className="absolute bottom-16 right-12 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce opacity-50" style={{ animationDelay: '0.8s' }} />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200 z-10"
                        aria-label="Close popup"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8">
                        {/* Header with Icon */}
                        <div className="text-center mb-6">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg animate-pulse">
                                    <AlertTriangle className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-red-700 mb-2">
                                Daily Limit Reached!
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                You've used all <span className="font-semibold text-red-600">{dailyLimit} requests</span> for today.
                                Your AI generation power will refresh soon!
                            </p>
                        </div>

                        {/* Countdown Display */}
                        <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/50 shadow-inner">
                            <div className="flex items-center justify-center gap-3">
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-medium text-gray-600 mb-1">Refreshes in</div>
                                    <div className="text-3xl font-bold text-orange-600 font-mono">
                                        {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-xs text-gray-500">hours : minutes</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={onClose}
                                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Got It
                            </button>

                            {/* Development Reset Button */}
                            {/* {process.env.NODE_ENV === 'development' && (
                                <button
                                onClick={handleReset}
                                className="w-full py-2 px-4 rounded-xl font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 border border-orange-200 transition-all duration-200"
                                >
                                🔧 Reset Limit (Dev Only)
                                </button>
                            )} */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
        </>
    );

    // Render using portal to escape parent container
    return typeof window !== 'undefined'
        ? createPortal(popupContent, document.body)
        : null;
};

// Hook for easy popup management
export const useLimitExceededPopup = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    const showPopup = () => setIsOpen(true);
    const hidePopup = () => setIsOpen(false);

    return {
        isOpen,
        showPopup,
        hidePopup,
        LimitExceededPopup: () => (
            <LimitExceededPopup isOpen={isOpen} onClose={hidePopup} />
        ),
    };
};