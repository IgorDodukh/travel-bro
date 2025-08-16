'use client';

import React from 'react';
import { useApiLimit } from '@/contexts/ApiLimitContext';

export const ApiLimitBadge = () => {
  const { remainingCalls, dailyLimit, getTimeUntilReset, isLoading } = useApiLimit();
  
  if (isLoading) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 animate-pulse">
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const { hours, minutes } = getTimeUntilReset();
  const isLimitReached = remainingCalls === 0;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      isLimitReached 
        ? 'bg-red-100 text-red-800' 
        : remainingCalls <= 2 
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-green-100 text-green-800'
    }`}>
      <span className="mr-1">🤖</span>
      {remainingCalls}/{dailyLimit} API calls remaining
      {isLimitReached && (
        <span className="ml-2 text-xs">
          (Resets in {hours}h {minutes}m)
        </span>
      )}
    </div>
  );
};
