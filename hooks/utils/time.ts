// This file can contain time and date related utility functions.

/**
 * Formats an ISO date string into a more readable format.
 * @param isoString - The date string in ISO format.
 * @returns A formatted date string (e.g., "Jan 1, 2024").
 */
export const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC' // Assume UTC to avoid timezone issues with date-only strings
    });
};

/**
 * Gets the string for today's date in YYYY-MM-DD format.
 * @returns Today's date string.
 */
export const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Formats seconds into a HH:MM:SS string.
 * @param seconds - The total number of seconds.
 * @returns A formatted time string.
 */
export const formatTime = (seconds: number): string => {
    const s = Math.floor(seconds);
    const getSeconds = `0${(s % 60)}`.slice(-2);
    const minutes = Math.floor(s / 60);
    const getMinutes = `0${(minutes % 60)}`.slice(-2);
    const getHours = `0${Math.floor(s / 3600)}`.slice(-2);
    return `${getHours}:${getMinutes}:${getSeconds}`;
};