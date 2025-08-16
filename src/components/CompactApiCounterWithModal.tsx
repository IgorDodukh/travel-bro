'use client';

import React, { useState } from 'react';
import { Timer, Sparkles } from 'lucide-react';
import { useApiLimit } from '@/contexts/ApiLimitContext';
import { ApiLimitAlert } from './ApiLimitAlertPopup';

interface CompactApiCounterWithModalProps {
  className?: string;
}

export const CompactApiCounterWithModal: React.FC<CompactApiCounterWithModalProps> = ({ 
  className = '' 
}) => {
  const { remainingCalls, getTimeUntilReset, isLoading } = useApiLimit();
  const { hours, minutes } = getTimeUntilReset();
  const [showModal, setShowModal] = useState(false);

  const isLimitReached = remainingCalls === 0;

  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-1 bg-white/75 border border-orange-500 px-3 py-1 rounded-full ${className}`}>
        <div className="w-3.5 h-3.5 bg-gray-300 rounded animate-pulse"></div>
        <div className="w-4 h-3.5 bg-gray-300 rounded animate-pulse"></div>
      </div>
    );
  }

  const handleClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center gap-1 
          bg-white/75 backdrop-blur-sm
          border border-orange-500 
          px-3 py-1 
          rounded-full 
          transition-all duration-200 
          hover:bg-white/90 hover:scale-105 hover:shadow-lg
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-orange-500/50
          cursor-pointer
          ${className}
        `}
        aria-label={isLimitReached ? `API limit reached. Resets in ${hours}h ${minutes}m` : `${remainingCalls} API calls remaining`}
      >
        {isLimitReached ? (
          <Timer 
            size={14} 
            className="text-orange-500 flex-shrink-0" 
          />
        ) : (
          <Sparkles 
            size={14} 
            className="text-orange-500 flex-shrink-0" 
          />
        )}
        
        <span className={`
          text-sm font-bold leading-none
          ${isLimitReached 
            ? 'text-gray-600 font-semibold' 
            : 'text-orange-500 font-bold'
          }
        `}>
          {isLimitReached ? `${hours}h ${minutes}m` : remainingCalls}
        </span>
      </button>

      <ApiLimitAlert 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};
