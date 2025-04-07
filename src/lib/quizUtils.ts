
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
