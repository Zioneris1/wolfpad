/**
 * Converts a task's effort rating (1-5) into an estimated time in seconds.
 * The scale is non-linear to represent increasing complexity.
 * 1 -> 30 mins
 * 2 -> 1 hr
 * 3 -> 2 hrs
 * 4 -> 4 hrs
 * 5 -> 8 hrs
 * @param effort - The effort rating from 1 to 5.
 * @returns The estimated time in seconds.
 */
export const effortToSeconds = (effort: number): number => {
    const hoursMap = [0.5, 1, 2, 4, 8];
    // effort is 1-based, array is 0-based
    const hours = hoursMap[effort - 1] || 0;
    return hours * 3600;
};
