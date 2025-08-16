'use client';

import React, { useState } from 'react';
import { useApiLimit } from '@/contexts/ApiLimitContext';
import { X, Info } from 'lucide-react';
import { CompactApiCounter } from './CompactApiCounter';

export const FloatingApiCounter = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { remainingCalls, dailyLimit, getTimeUntilReset, resetLimitManually } = useApiLimit();
  const { hours, minutes } = getTimeUntilReset();

  const handleCounterPress = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <CompactApiCounter onPress={handleCounterPress} />
      
      {/* Details Modal */}
      {showDetails && (
        <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Info size={16} />
              API Usage Details
            </h3>
            <button 
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily Limit:</span>
              <span className="font-medium">{dailyLimit} requests</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Used Today:</span>
              <span className="font-medium">{dailyLimit - remainingCalls} requests</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Remaining:</span>
              <span className={`font-medium ${remainingCalls === 0 ? 'text-red-600' : 'text-green-600'}`}>
                {remainingCalls} requests
              </span>
            </div>
            
            {remainingCalls === 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resets in:</span>
                <span className="font-medium text-orange-600">{hours}h {minutes}m</span>
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Usage Progress</span>
                <span>{Math.round(((dailyLimit - remainingCalls) / dailyLimit) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    remainingCalls === 0 
                      ? 'bg-red-500' 
                      : remainingCalls <= 2 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${((dailyLimit - remainingCalls) / dailyLimit) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Development Reset Button */}
            {/* {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => {
                  resetLimitManually();
                  setShowDetails(false);
                }}
                className="w-full mt-3 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                Reset Limit (Dev Only)
              </button>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
};
