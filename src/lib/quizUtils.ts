
import { Question, QuizMode } from "@/types";

export const getQuizTitle = (
  mode: QuizMode, 
  questions: Question[], 
  week?: string
): string => {
  switch(mode) {
    case 'weekly':
      {
        if (!week) return 'Quiz';
        const weekTitle = questions.length > 0 && questions[0].weekTitle
          ? `Week ${week} - ${questions[0].weekTitle}`
          : `Week ${week}`;
        return weekTitle;
      }
    case 'full':
      return 'Full Quiz';
    case 'bookmark':
      return 'Bookmarked Questions';
    case 'smart':
      return 'Smart Boost Quiz';
    case 'custom':
      return 'Custom Quiz';
    default:
      return 'Quiz';
  }
};

// Helper for safely parsing JSON data
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
};

// Helper for safely fetching data with timeout
export const safeFetch = async <T>(url: string, fallback: T, timeoutMs: number = 10000): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    // console.warn(`Fetch timed out after ${timeoutMs}ms for URL: ${url}`); // Removed log
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId); // Clear timeout if fetch completes

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    // Try to parse JSON, handle potential errors during parsing as well
    try {
      return await response.json();
    } catch (parseError) {
      console.error(`Failed to parse JSON from ${url}:`, parseError);
      throw new Error(`Invalid JSON response from ${url}`); // Re-throw to be caught below
    }
  } catch (error) {
    clearTimeout(timeoutId); // Ensure timeout is cleared on any error
    if (error instanceof Error && error.name === 'AbortError') {
      // Timeout error, already handled by aborting
    } else {
      console.error(`Failed to fetch or parse from ${url}:`, error); // Keep general error log
    }
    return fallback;
  }
};
