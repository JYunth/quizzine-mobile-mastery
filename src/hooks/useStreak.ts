import { useEffect } from 'react';
import { updateStreak } from '@/lib/storage';

/**
 * Custom hook to manage the user's activity streak.
 * It triggers the streak update logic once when the component using it mounts.
 * This ensures the streak is checked and potentially updated early in the app lifecycle.
 */
export function useStreak(): void {
  useEffect(() => {
    // console.log("useStreak: Triggering streak update on mount.");
    updateStreak();
  }, []); // Empty dependency array ensures this runs only once on mount
}