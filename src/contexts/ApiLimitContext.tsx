'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_LIMIT_KEY = 'api_daily_limit';
const DAILY_LIMIT = 5;

// Define a clear type for the data stored in localStorage
interface StoredApiLimit {
    remaining: number;
    date: string; // YYYY-MM-DD format
}

interface ApiLimitContextType {
    remainingCalls: number;
    canMakeApiCall: () => boolean;
    useApiCall: () => Promise<void>;
    isLoading: boolean;
    getTimeUntilReset: () => { hours: number; minutes: number };
    dailyLimit: number;
    // Manual reset is kept for your use case, but the automatic reset is now robust.
    resetLimitManually: () => Promise<void>;
}

const ApiLimitContext = createContext<ApiLimitContextType | undefined>(undefined);

export const useApiLimit = () => {
    const context = useContext(ApiLimitContext);
    if (context === undefined) {
        throw new Error('useApiLimit must be used within an ApiLimitProvider');
    }
    return context;
};

export const ApiLimitProvider = ({ children }: { children: React.ReactNode }) => {
    const [remainingCalls, setRemainingCalls] = useState(DAILY_LIMIT);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    // Handle client-side mounting to avoid hydration issues
    useEffect(() => {
        setIsClient(true);
    }, []);

    // A single, consistent date format function (YYYY-MM-DD)
    const getTodayString = () => {
        const d = new Date();
        // Pads month and day with a leading zero if needed
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    };

    // Centralized function to load, validate, and update the limit from storage
    const loadAndValidateLimit = useCallback(async () => {
        if (!isClient) return;

        try {
            const stored = localStorage.getItem(API_LIMIT_KEY);
            const today = getTodayString();

            if (stored) {
                const data: StoredApiLimit = JSON.parse(stored);

                // If the stored date is not today, reset the limit.
                if (data.date !== today) {
                    await resetLimit(today);
                } else {
                    setRemainingCalls(data.remaining);
                }
            } else {
                // No stored data, so this is the first run. Set a fresh limit.
                await resetLimit(today);
            }
        } catch (error) {
            console.error('Error handling API limit:', error);
            // Fallback to a full limit in case of storage errors
            setRemainingCalls(DAILY_LIMIT);
        } finally {
            setIsLoading(false);
        }
    }, [isClient]);

    // Centralized reset function. Can be called by other functions.
    // It takes the date string to ensure consistency.
    const resetLimit = async (dateString: string) => {
        const data: StoredApiLimit = {
            remaining: DAILY_LIMIT,
            date: dateString,
        };
        try {
            localStorage.setItem(API_LIMIT_KEY, JSON.stringify(data));
            setRemainingCalls(DAILY_LIMIT);
        } catch (error) {
            console.error('Error resetting daily limit:', error);
        }
    };

    // Manual reset function exposed to the context consumers
    const resetLimitManually = async () => {
        setIsLoading(true);
        try {
            await resetLimit(getTodayString());
        } catch (error) {
            console.error('Error manually resetting API limit:', error);
            throw new Error('Failed to reset API limit');
        } finally {
            setIsLoading(false);
        }
    };

    // Effect for initializing the limit on component mount
    useEffect(() => {
        if (isClient) {
            loadAndValidateLimit();
        }
    }, [loadAndValidateLimit, isClient]);

    // Effect for checking the limit when the page becomes visible (similar to app state change)
    useEffect(() => {
        if (!isClient) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Re-validate the limit when page becomes visible to catch date changes
                loadAndValidateLimit();
            }
        };

        // Also check when the window regains focus
        const handleFocus = () => {
            loadAndValidateLimit();
        };

        // Set up interval to check for date changes every minute
        const intervalId = setInterval(() => {
            loadAndValidateLimit();
        }, 60000); // Check every minute

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            clearInterval(intervalId);
        };
    }, [loadAndValidateLimit, isClient]);

    const useApiCall = async () => {
        if (remainingCalls <= 0) {
            throw new Error('Daily API limit exceeded');
        }

        const newRemaining = remainingCalls - 1;
        const today = getTodayString();
        const data: StoredApiLimit = {
            remaining: newRemaining,
            date: today,
        };

        try {
            // Update storage first, then update state
            localStorage.setItem(API_LIMIT_KEY, JSON.stringify(data));
            setRemainingCalls(newRemaining);
        } catch (error) {
            console.error('Error using API call:', error);
            // Optionally, revert the state change if storage fails
            // setRemainingCalls(remainingCalls); 
            throw new Error('Failed to update API call count');
        }
    };

    const canMakeApiCall = () => remainingCalls > 0;

    const getTimeUntilReset = () => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0); // Next local midnight

        const diffMs = midnight.getTime() - now.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes };
    };

    const value = {
        remainingCalls,
        canMakeApiCall,
        useApiCall,
        isLoading,
        getTimeUntilReset,
        dailyLimit: DAILY_LIMIT,
        resetLimitManually,
    };

    return (
        <ApiLimitContext.Provider value={value}>
            {children}
        </ApiLimitContext.Provider>
    );
};