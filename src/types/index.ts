
// Question types
export interface Question {
  id: string;
  week: number;
  weekTitle?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tags?: string[];
}

// User answer for a single question
export interface Answer {
  questionId: string;
  selectedOptionIndex: number;
  correct: boolean;
  timeTaken: number; // in milliseconds
}

// A completed quiz attempt
export interface QuizAttempt {
  id: string;
  timestamp: string;
  mode: QuizMode;
  week?: number;
  answers: Answer[];
  score: number;
  totalQuestions: number;
}

// App storage in localStorage
export interface AppStorage {
  attempts: QuizAttempt[];
  bookmarks: string[]; // question IDs
  settings: {
    darkMode: boolean;
    reminders: boolean;
    lastVisitedWeek: number;
  };
  confidenceRatings: { [questionId: string]: number };
  streaks: {
    lastActive: string;
    currentStreak: number;
  };
}

// Quiz modes
export type QuizMode = 'weekly' | 'full' | 'custom' | 'bookmark' | 'smart';
