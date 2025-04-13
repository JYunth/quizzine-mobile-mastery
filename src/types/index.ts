
// Course type
export interface Course {
  id: string;
  name: string;
  description?: string;
}

// Question types
export interface Question {
  id: string;
  courseId: string;
  week: number;
  weekTitle?: string;
  question: string;
  options: string[];
  correctIndex: number;
  tags?: string[];
}

// User answer for a single question
export interface Answer {
  questionId: string;
  selectedOptionIndex: number; // Index relative to options presented at the time
  selectedOptionText: string; // The actual text the user selected
  correct: boolean;
  timeTaken: number; // in milliseconds
}

// A completed quiz attempt
export interface QuizAttempt {
  id: string;
  timestamp: string;
  mode: QuizMode;
  courseId?: string;
  week?: number;
  answers: Answer[];
  score: number;
  totalQuestions: number;
}

// New interface to store performance stats for a single question
export interface QuestionPerformanceStats {
  questionId: string;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  lastAttemptTimestamp: string; // ISO timestamp string
}

// Custom Quiz
export interface CustomQuiz {
  id: string;
  name: string;
  timestamp: string;
  questionIds: string[];
  courseId?: string;
}

// App storage in localStorage
export interface AppStorage {
  attempts: QuizAttempt[];
  bookmarks: string[]; // question IDs
  settings: {
    darkMode: boolean;
    reminders: boolean;
    hardMode: boolean; // Add hard mode setting
    lastVisitedWeek: number;
    currentCourseId?: string;
  };
  confidenceRatings: { [questionId: string]: number };
  streaks: {
    lastActivityDate: string; // Date of the last recorded activity in YYYY-MM-DD format (local time)
    currentStreak: number;
  };
  customQuizzes: CustomQuiz[];
  // NEW: Map to store aggregated performance stats per question
  questionPerformance: { [questionId: string]: QuestionPerformanceStats };
}

// Quiz modes
export type QuizMode = 'weekly' | 'full' | 'custom' | 'bookmark' | 'smart';
