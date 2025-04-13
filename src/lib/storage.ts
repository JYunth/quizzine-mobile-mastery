import { AppStorage, Question, QuizAttempt, CustomQuiz, Course } from "@/types";
import { getUTCTodayTimestamp, isSameUTCDay, isYesterdayUTC } from "@/lib/utils";
// Removed unused import from deleted questionStore

const STORAGE_KEY = 'quizzineApp';

// Initial state for app storage
const initialStorage: AppStorage = {
  attempts: [],
  bookmarks: [],
  settings: {
    darkMode: false,
    reminders: false,
    hardMode: false, // Add hard mode setting
    lastVisitedWeek: 1,
    currentCourseId: 'cs101', // Default course
  },
  confidenceRatings: {},
  streaks: {
    lastActiveTimestamp: 0, // Initialize to 0 (no activity yet)
    currentStreak: 0,       // Initialize to 0
  },
  customQuizzes: [],
};

// Get storage from localStorage
export const getStorage = (): AppStorage => {
  let storage: AppStorage;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      console.log("No existing storage found, initializing.");
      storage = { ...initialStorage }; // Use a copy
      // Initialize timestamp properly if starting fresh
      storage.streaks.lastActiveTimestamp = 0; // Explicitly set to 0
      storage.streaks.currentStreak = 0;       // Explicitly set to 0
      saveStorage(storage); // Save initial state if none exists
      return storage;
    }

    storage = JSON.parse(data);

    // --- Migration Logic ---
    if (storage.streaks && typeof (storage.streaks as any).lastActive === 'string') {
      console.warn("Migrating old streak 'lastActive' string to 'lastActiveTimestamp'.");
      const oldDateString = (storage.streaks as any).lastActive;
      const date = new Date(oldDateString + 'T00:00:00Z'); // Assume YYYY-MM-DD was UTC

      if (!isNaN(date.getTime())) {
        date.setUTCHours(0, 0, 0, 0); // Ensure it's the start of the day in UTC
        storage.streaks.lastActiveTimestamp = date.getTime();
      } else {
        console.error("Failed to parse old lastActive date string during migration:", oldDateString);
        storage.streaks.lastActiveTimestamp = 0; // Fallback
      }
      delete (storage.streaks as any).lastActive; // Remove old property

      // Ensure currentStreak is a number, default to 1 if migrating from an active state
      if (typeof storage.streaks.currentStreak !== 'number' || isNaN(storage.streaks.currentStreak)) {
         storage.streaks.currentStreak = storage.streaks.lastActiveTimestamp > 0 ? 1 : 0;
      }
      // Save migrated data immediately
      saveStorage(storage);

    } else if (!storage.streaks) {
        // If streaks object itself is missing, initialize it
        console.warn("Streaks object missing, initializing.");
        storage.streaks = { ...initialStorage.streaks };
        saveStorage(storage);
    } else if (typeof storage.streaks.lastActiveTimestamp !== 'number') {
        // If timestamp is missing or not a number, initialize it
        console.warn("lastActiveTimestamp missing or invalid, initializing.");
        storage.streaks.lastActiveTimestamp = 0;
        storage.streaks.currentStreak = 0; // Reset streak too
        saveStorage(storage);
    } else if (typeof storage.streaks.currentStreak !== 'number') {
        // If streak is missing or not a number, initialize it
        console.warn("currentStreak missing or invalid, initializing.");
        storage.streaks.currentStreak = 0;
        saveStorage(storage);
    }
    // --- End Migration Logic ---

    return storage;

  } catch (error) {
    console.error('Failed to parse or migrate storage, resetting to initial state.', error);
    // If parsing or migration fails catastrophically, reset to initial
    storage = { ...initialStorage };
    storage.streaks.lastActiveTimestamp = 0;
    storage.streaks.currentStreak = 0;
    saveStorage(storage);
    return storage;
  }
};

// Save storage to localStorage
export const saveStorage = (storage: AppStorage): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Failed to save storage', error);
  }
};

// Reset storage to initial state
export const resetStorage = (): void => {
  saveStorage(initialStorage);
};

// Export storage as JSON file
export const exportStorage = (): void => {
  const storage = getStorage();
  const dataStr = JSON.stringify(storage, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `quizzine-backup-${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

// Import storage from JSON file
export const importStorage = (jsonString: string): boolean => {
  try {
    const storage = JSON.parse(jsonString) as AppStorage;
    saveStorage(storage);
    return true;
  } catch (error) {
    console.error('Failed to import storage', error);
    return false;
  }
};

/**
 * Updates the user's activity streak based on UTC days.
 * Should be called once per app session, ideally on load.
 */
export const updateStreak = (): void => {
  const storage = getStorage();
  const todayTimestamp = getUTCTodayTimestamp();
  const lastActiveTimestamp = storage.streaks.lastActiveTimestamp || 0; // Default to 0 if undefined

  // 1. Check if already updated today
  if (isSameUTCDay(lastActiveTimestamp, todayTimestamp)) {
    // console.log("Streak already updated today.");
    return; // No need to update again
  }

  // 2. Check if last active was yesterday (UTC)
  if (isYesterdayUTC(lastActiveTimestamp, todayTimestamp)) {
    // console.log("Continuing streak!");
    storage.streaks.currentStreak = (storage.streaks.currentStreak || 0) + 1; // Increment
  }
  // 3. Check if last active was before yesterday (streak broken)
  else {
    // console.log("Streak broken or first activity.");
    storage.streaks.currentStreak = 1; // Reset to 1 (for today's activity)
  }

  // 4. Update the last active timestamp to today
  storage.streaks.lastActiveTimestamp = todayTimestamp;

  // 5. Save the updated storage
  saveStorage(storage);
  // console.log("Streak updated:", storage.streaks);
};

// Save quiz attempt
export const saveQuizAttempt = (attempt: QuizAttempt): void => {
  const storage = getStorage();
  storage.attempts.push(attempt);
  saveStorage(storage);
  // updateStreak(); // Removed: Streak update is now handled centrally, e.g., on app load
};

// Toggle bookmark for a question
export const toggleBookmark = (questionId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      const storage = getStorage();
      const index = storage.bookmarks.indexOf(questionId);
      let isNowBookmarked: boolean;

      if (index === -1) {
        storage.bookmarks.push(questionId);
        isNowBookmarked = true; // Added bookmark
      } else {
        storage.bookmarks.splice(index, 1);
        isNowBookmarked = false; // Removed bookmark
      }
      
      saveStorage(storage);
      resolve(isNowBookmarked); // Resolve with the new bookmark status
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
      reject(error);
    }
  });
};

// Check if a question is bookmarked
export const isBookmarked = (questionId: string): boolean => {
  const storage = getStorage();
  return storage.bookmarks.includes(questionId);
};

// Save confidence rating for a question
export const saveConfidenceRating = (questionId: string, rating: number): void => {
  const storage = getStorage();
  storage.confidenceRatings[questionId] = rating;
  saveStorage(storage);
};

// Update settings
export const updateSettings = (settings: Partial<AppStorage['settings']>): void => {
  const storage = getStorage();
  storage.settings = { ...storage.settings, ...settings };
  saveStorage(storage);
};

// Get current course ID
export const getCurrentCourseId = (): string => {
  const storage = getStorage();
  return storage.settings.currentCourseId || 'cs101';
};

// Set current course ID
export const setCurrentCourseId = (courseId: string): void => {
  const storage = getStorage();
  storage.settings.currentCourseId = courseId;
  saveStorage(storage);
};

// Get all courses (expects courses array passed in)
export const getAllCourses = (courses: Course[]): Course[] => {
  return courses;
};

// Get questions for week in current course from cache
// Get questions for week in current course (expects allQuestions array passed in)
export const getQuestionsForWeek = (week: number, allQuestions: Question[]): Question[] => {
  if (!allQuestions || allQuestions.length === 0) {
    console.warn("getQuestionsForWeek: allQuestions array is empty or undefined!");
    return [];
  }

  try {
    const courseId = getCurrentCourseId();
    const filteredQuestions = allQuestions.filter(q => {
      const courseMatch = String(q.courseId) === String(courseId);
      const weekMatch = Number(q.week) === Number(week);
      return courseMatch && weekMatch;
    });
    return filteredQuestions;
  } catch (error) {
    console.error(`getQuestionsForWeek: Error during filtering for week ${week}:`, error);
    return [];
  }
};

// Get all questions from current course from cache
// Get all questions from current course (expects allQuestions array passed in)
export const getAllQuestions = (allQuestions: Question[]): Question[] => {
  if (!allQuestions) return [];
  const courseId = getCurrentCourseId();
  return allQuestions.filter(q => q.courseId === courseId);
};

// Get questions from all courses from cache
// Get questions from all courses (expects allQuestions array passed in)
export const getAllQuestionsFromAllCourses = (allQuestions: Question[]): Question[] => {
  return allQuestions ?? [];
};

// Shuffle an array (Fisher-Yates algorithm)
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Get bookmarked questions from cache
// Get bookmarked questions (expects allQuestions array passed in)
export const getBookmarkedQuestions = (allQuestions: Question[]): Question[] => {
  if (!allQuestions) return [];
  const storage = getStorage();
  return allQuestions.filter(q => storage.bookmarks.includes(q.id));
};

// Get "smart boost" questions (only rated questions with confidence < 3) from cache
// Get "smart boost" questions (expects allQuestions array passed in)
export const getSmartBoostQuestions = (allQuestions: Question[]): Question[] => {
  if (!allQuestions) return [];
  const storage = getStorage();
  const courseId = getCurrentCourseId();

  // Filter for current course first
  const courseQuestions = allQuestions.filter(q => q.courseId === courseId);

  // Filter for questions that have been rated AND have confidence < 3
  const lowConfidenceRatedQuestions = courseQuestions.filter(q => {
    const confidence = storage.confidenceRatings[q.id];
    return confidence !== undefined && confidence < 3;
  });

  // Sort the filtered questions by confidence (lowest first: 0, 1, 2)
  const sortedQuestions = lowConfidenceRatedQuestions.sort((a, b) => {
    const confidenceA = storage.confidenceRatings[a.id]!;
    const confidenceB = storage.confidenceRatings[b.id]!;
    return confidenceA - confidenceB;
  });

  return sortedQuestions;
};

// Custom Quiz functions
export const saveCustomQuiz = (quiz: CustomQuiz): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const storage = getStorage();
      storage.customQuizzes.push(quiz);
      saveStorage(storage);
      resolve();
    } catch (error) {
      console.error('Failed to save custom quiz', error);
      reject(error);
    }
  });
};

// Update an existing custom quiz
export const updateCustomQuiz = (updatedQuiz: CustomQuiz): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const storage = getStorage();
      const index = storage.customQuizzes.findIndex(quiz => quiz.id === updatedQuiz.id);
      if (index !== -1) {
        storage.customQuizzes[index] = updatedQuiz;
        saveStorage(storage);
        resolve();
      } else {
        const errorMsg = `Quiz with id ${updatedQuiz.id} not found for update.`;
        console.error(errorMsg);
        reject(new Error(errorMsg)); // Reject the promise if not found
      }
    } catch (error) {
      console.error('Failed to update custom quiz', error);
      reject(error);
    }
  });
};

export const getCustomQuizzes = (): CustomQuiz[] => {
  const storage = getStorage();
  return storage.customQuizzes;
};

export const getCustomQuizById = (id: string): CustomQuiz | undefined => {
  const storage = getStorage();
  return storage.customQuizzes.find(quiz => quiz.id === id);
};

// Get questions for custom quiz using the optimized Map lookup
// Get questions for custom quiz (expects questionsById Map passed in)
export const getQuestionsForCustomQuiz = (quizId: string, questionsById: Map<string, Question>): Question[] => {
  const quiz = getCustomQuizById(quizId);
  if (!quiz || quiz.questionIds.length === 0) {
    return [];
  }
  if (!questionsById) {
      console.warn("getQuestionsForCustomQuiz: questionsById Map is missing!");
      return [];
  }

  const loadedQuestions: Question[] = [];
  quiz.questionIds.forEach(qId => {
    const question = questionsById.get(qId);
    if (question) {
      loadedQuestions.push(question);
    } else {
      console.warn(`Question ID ${qId} from custom quiz ${quizId} not found in provided map.`);
    }
  });

  return loadedQuestions;
};

// Also update deleteCustomQuiz for consistency, although not strictly required by the error
export const deleteCustomQuiz = (id: string): Promise<void> => {
 return new Promise((resolve, reject) => {
    try {
      const storage = getStorage();
      storage.customQuizzes = storage.customQuizzes.filter(quiz => quiz.id !== id);
      saveStorage(storage);
      resolve();
    } catch (error) {
      console.error('Failed to delete custom quiz', error);
      reject(error);
    }
  });
};
