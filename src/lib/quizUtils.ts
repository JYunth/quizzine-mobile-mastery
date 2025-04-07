
import { Question, QuizMode } from "@/types";

export const getQuizTitle = (
  mode: QuizMode, 
  questions: Question[], 
  week?: string
): string => {
  switch(mode) {
    case 'weekly':
      if (!week) return 'Quiz';
      const weekTitle = questions.length > 0 && questions[0].weekTitle 
        ? `Week ${week} - ${questions[0].weekTitle}` 
        : `Week ${week}`;
      return weekTitle;
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

// Helper for safely fetching data
export const safeFetch = async <T>(url: string, fallback: T): Promise<T> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    return fallback;
  }
};
