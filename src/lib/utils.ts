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
