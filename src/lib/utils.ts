import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Gets the timestamp (milliseconds since epoch) for the start of the current day (00:00:00.000) in UTC.
 * @returns {number} The UTC timestamp for the start of today.
 */
export function getUTCTodayTimestamp(): number {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now.getTime();
}

/**
 * Gets the timestamp (milliseconds since epoch) for the start of the previous day (00:00:00.000) in UTC.
 * @returns {number} The UTC timestamp for the start of yesterday.
 */
export function getUTCYesterdayTimestamp(): number {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);
  return yesterday.getTime();
}

/**
 * Checks if two timestamps represent the same calendar day in UTC.
 * @param timestamp1 - The first timestamp (milliseconds since epoch).
 * @param timestamp2 - The second timestamp (milliseconds since epoch).
 * @returns {boolean} True if both timestamps fall on the same UTC day, false otherwise.
 */
export function isSameUTCDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

/**
 * Checks if a given timestamp occurred on the calendar day immediately preceding another timestamp (typically today's start) in UTC.
 * @param timestampToCheck - The timestamp to check (milliseconds since epoch).
 * @param todayTimestamp - The timestamp representing the start of the reference day (usually today) in UTC (milliseconds since epoch).
 * @returns {boolean} True if timestampToCheck was on the UTC day before todayTimestamp, false otherwise.
 */
export function isYesterdayUTC(timestampToCheck: number, todayTimestamp: number): boolean {
  const yesterdayTimestamp = todayTimestamp - 24 * 60 * 60 * 1000; // Subtract one day's worth of milliseconds
  return isSameUTCDay(timestampToCheck, yesterdayTimestamp);
}

/**
 * Formats a Date object into a YYYY-MM-DD string based on local time.
 * @param date - The Date object to format.
 * @returns {string} The date string in YYYY-MM-DD format.
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets the current date formatted as YYYY-MM-DD based on local time.
 * @returns {string} The current date string in YYYY-MM-DD format.
 */
export function getLocalDateYYYYMMDD(): string {
  return formatDateToYYYYMMDD(new Date());
}

/**
 * Calculates the difference in days between two YYYY-MM-DD date strings.
 * Assumes the dates are in local time.
 * @param dateStr1 - The first date string (YYYY-MM-DD).
 * @param dateStr2 - The second date string (YYYY-MM-DD).
 * @returns {number} The difference in days (dateStr2 - dateStr1). Returns NaN if parsing fails.
 */
export function diffDaysYYYYMMDD(dateStr1: string, dateStr2: string): number {
  try {
    // Parse as local time by appending a time component (avoids UTC conversion issues)
    const date1 = new Date(`${dateStr1}T00:00:00`);
    const date2 = new Date(`${dateStr2}T00:00:00`);

    // Ensure dates are valid
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      console.error("Invalid date string provided to diffDaysYYYYMMDD:", dateStr1, dateStr2);
      return NaN;
    }

    // Calculate the difference in milliseconds and convert to days
    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // Use Math.round for robustness near DST changes
    return diffDays;
  } catch (error) {
    console.error("Error calculating day difference:", error);
    return NaN;
  }
}
