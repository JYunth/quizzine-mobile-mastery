
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
  selectedOptionIndex: number;
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
    lastVisitedWeek: number;
    currentCourseId?: string;
  };
  confidenceRatings: { [questionId: string]: number };
  streaks: {
    lastActive: string;
    currentStreak: number;
  };
  customQuizzes: CustomQuiz[];
}

// Quiz modes
export type QuizMode = 'weekly' | 'full' | 'custom' | 'bookmark' | 'smart';
