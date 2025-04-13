import { useState, useEffect, useCallback } from 'react';
import { getStorage, saveStorage } from '@/lib/storage';
import { getLocalDateYYYYMMDD, diffDaysYYYYMMDD } from '@/lib/utils';
import { AppStorage } from '@/types';

interface StreakState {
  currentStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
}

interface UseStreakReturn {
  streakCount: number;
  recordActivity: () => void;
}

/**
 * Custom hook to manage and update the user's activity streak.
 * Provides the current streak count and a function to record activity.
 * @returns {UseStreakReturn} Object containing streakCount and recordActivity function.
 */
export function useStreak(): UseStreakReturn {
  const [streakState, setStreakState] = useState<StreakState>({
    currentStreak: 0,
    lastActivityDate: '',
  });

  // Load initial streak state from storage on mount
  useEffect(() => {
    const storage = getStorage();
    // Ensure streak data is valid after potential migration in getStorage
    const initialStreak = storage.streaks?.currentStreak ?? 0;
    const initialDate = storage.streaks?.lastActivityDate ?? '';

    // Check if the streak should be reset due to inactivity *before* setting initial state
    const today = getLocalDateYYYYMMDD();
    let actualInitialStreak = initialStreak;
    let actualInitialDate = initialDate;

    if (initialDate) {
      const daysDiff = diffDaysYYYYMMDD(initialDate, today);
      if (isNaN(daysDiff)) {
        console.error("useStreak: Invalid date format encountered on load, resetting streak.");
        actualInitialStreak = 0;
        actualInitialDate = '';
        // Optionally save the reset state back to storage immediately
        const updatedStorage = { ...storage, streaks: { currentStreak: 0, lastActivityDate: '' } };
        saveStorage(updatedStorage);
      } else if (daysDiff > 1) {
        // console.log(`useStreak: Streak broken on load (Last active: ${initialDate}, Today: ${today}, Diff: ${daysDiff}). Resetting.`);
        actualInitialStreak = 0; // Reset streak, but don't change date yet (activity needed for today)
      }
      // If daysDiff is 0 or 1, the streak is potentially valid, keep loaded values.
    }

    setStreakState({
      currentStreak: actualInitialStreak,
      lastActivityDate: actualInitialDate, // Use potentially validated/reset date
    });
  }, []);

  /**
   * Records a user activity (e.g., answering a question) and updates the streak accordingly.
   * This is the primary trigger for streak logic.
   */
  const recordActivity = useCallback(() => {
    setStreakState(prevState => {
      const today = getLocalDateYYYYMMDD();
      const lastDate = prevState.lastActivityDate;
      let newStreak = prevState.currentStreak;

      // console.log(`recordActivity: Called. Today: ${today}, Last Date: ${lastDate}, Current Streak: ${newStreak}`);

      if (!lastDate) {
        // First activity ever
        // console.log("recordActivity: First activity.");
        newStreak = 1;
      } else {
        const daysDiff = diffDaysYYYYMMDD(lastDate, today);

        if (isNaN(daysDiff)) {
          console.error("recordActivity: Invalid date format encountered, resetting streak.");
          newStreak = 1; // Start a new streak today
        } else if (daysDiff === 1) {
          // Consecutive day
          // console.log("recordActivity: Consecutive day.");
          newStreak += 1;
        } else if (daysDiff > 1) {
          // Streak broken
          // console.log(`recordActivity: Streak broken (Diff: ${daysDiff}). Resetting.`);
          newStreak = 1;
        } else if (daysDiff === 0) {
          // Same day activity - do nothing to the streak count
          // console.log("recordActivity: Same day activity.");
        } else {
          // daysDiff < 0 (e.g., system clock changed?) - Treat as first day of streak
          console.warn("recordActivity: Last activity date is in the future? Resetting streak.");
          newStreak = 1;
        }
      }

      // Only update state and storage if the date or streak changed
      if (today !== lastDate || newStreak !== prevState.currentStreak) {
        const newState: StreakState = {
          currentStreak: newStreak,
          lastActivityDate: today,
        };
        // console.log("recordActivity: Updating state and storage:", newState);

        // Save updated state to localStorage
        try {
          const storage = getStorage(); // Get potentially updated storage
          const updatedStorage: AppStorage = {
            ...storage,
            streaks: newState,
          };
          saveStorage(updatedStorage);
        } catch (error) {
          console.error("Failed to save streak state:", error);
          // Optionally revert state update if save fails? Or show error?
          // For now, we proceed with the state update optimistically.
        }
        return newState;
      }

      // If no change needed (e.g., multiple activities on the same day)
      // console.log("recordActivity: No change needed.");
      return prevState;
    });
  }, []); // No dependencies needed as it reads/writes based on current state/date

  return {
    streakCount: streakState.currentStreak,
    recordActivity,
  };
}