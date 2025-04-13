import { AppStorage, Question, QuizAttempt, CustomQuiz, Course } from "@/types";
import { formatDateToYYYYMMDD, getLocalDateYYYYMMDD } from "@/lib/utils"; // Import new utils
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
    lastActivityDate: '', // Initialize to empty string (no activity yet)
    currentStreak: 0,     // Initialize to 0
  },
  customQuizzes: [],
  questionPerformance: {}, // Initialize as empty object
};

// Get storage from localStorage
export const getStorage = (): AppStorage => {
  let storage: AppStorage;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      console.log("No existing storage found, initializing.");
      storage = { ...initialStorage }; // Use a copy
      // Initialize date properly if starting fresh
      storage.streaks.lastActivityDate = ''; // Explicitly set to empty string
      storage.streaks.currentStreak = 0;     // Explicitly set to 0
      saveStorage(storage); // Save initial state if none exists
      return storage;
    }

    storage = JSON.parse(data);

    // --- Migration & Validation Logic for Streaks ---
    let needsSaveAfterMigration = false;
    if (!storage.streaks) {
      // If streaks object itself is missing, initialize it
      console.warn("Streaks object missing, initializing.");
      storage.streaks = { ...initialStorage.streaks }; // Uses { lastActivityDate: '', currentStreak: 0 }
      needsSaveAfterMigration = true;
    } else {
      // Check for old timestamp format and migrate if necessary
      if (typeof (storage.streaks as any).lastActiveTimestamp === 'number') {
        console.warn("Migrating old 'lastActiveTimestamp' to 'lastActivityDate'.");
        const timestamp = (storage.streaks as any).lastActiveTimestamp;
        if (timestamp > 0) {
          try {
            const date = new Date(timestamp);
            storage.streaks.lastActivityDate = formatDateToYYYYMMDD(date); // Convert to local YYYY-MM-DD
            // If migrating from an active timestamp, ensure streak is at least 1
            if (typeof storage.streaks.currentStreak !== 'number' || isNaN(storage.streaks.currentStreak) || storage.streaks.currentStreak < 1) {
               storage.streaks.currentStreak = 1;
            }
          } catch (e) {
             console.error("Error converting timestamp during migration, resetting streak:", e);
             storage.streaks.lastActivityDate = '';
             storage.streaks.currentStreak = 0;
          }
        } else {
          // If timestamp was 0 or invalid, initialize properly
          storage.streaks.lastActivityDate = '';
          storage.streaks.currentStreak = 0;
        }
        delete (storage.streaks as any).lastActiveTimestamp; // Remove old property
        needsSaveAfterMigration = true;
      }

      // Validate current structure
      if (typeof storage.streaks.lastActivityDate !== 'string') {
        console.warn("lastActivityDate missing or invalid, initializing.");
        storage.streaks.lastActivityDate = '';
        storage.streaks.currentStreak = 0; // Reset streak too if date is invalid
        needsSaveAfterMigration = true;
      }
      if (typeof storage.streaks.currentStreak !== 'number' || isNaN(storage.streaks.currentStreak)) {
        console.warn("currentStreak missing or invalid, initializing.");
        // Preserve lastActivityDate if it's valid, otherwise reset streak
        storage.streaks.currentStreak = storage.streaks.lastActivityDate ? 1 : 0;
        needsSaveAfterMigration = true;
      }
    }

    if (needsSaveAfterMigration) {
      saveStorage(storage); // Save migrated/validated data immediately
    }
    // --- End Migration & Validation Logic ---

    return storage;

  } catch (error) {
    console.error('Failed to parse or migrate storage, resetting to initial state.', error);
    // If parsing or migration fails catastrophically, reset to initial
    storage = { ...initialStorage }; // Resets to { lastActivityDate: '', currentStreak: 0 }
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

// Removed the old updateStreak function. Logic moved to useStreak hook.
// Save quiz attempt and update performance stats
export const saveQuizAttempt = (attempt: QuizAttempt): void => {
  const storage = getStorage();
  storage.attempts.push(attempt);

  // Ensure questionPerformance map exists
  if (!storage.questionPerformance) {
    storage.questionPerformance = {};
  }

  const nowTimestamp = new Date().toISOString();

  // Update performance stats for each question in the attempt
  attempt.answers.forEach(answer => {
    const { questionId, correct } = answer;
    const stats = storage.questionPerformance[questionId] || {
      questionId: questionId,
      totalAttempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      lastAttemptTimestamp: '', // Will be overwritten
    };

    stats.totalAttempts += 1;
    if (correct) {
      stats.correctAttempts += 1;
    } else {
      stats.incorrectAttempts += 1;
    }
    stats.lastAttemptTimestamp = nowTimestamp;

    storage.questionPerformance[questionId] = stats;
  });

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

// Get "smart boost" questions based on performance (Weakness Focus - Interpretation A)
// Prioritizes questions answered incorrectly, sorted by most recent attempt.
export const getSmartBoostQuestions = (allQuestions: Question[]): Question[] => {
  if (!allQuestions || allQuestions.length === 0) return [];

  const storage = getStorage();
  const courseId = getCurrentCourseId();
  const performanceStats = storage.questionPerformance;

  if (!performanceStats) {
    console.warn("getSmartBoostQuestions: questionPerformance data is missing.");
    return [];
  }

  // 1. Filter for current course
  const courseQuestions = allQuestions.filter(q => q.courseId === courseId);

  // 2. Filter for questions with recorded incorrect attempts
  const weakQuestions = courseQuestions.filter(q => {
    const stats = performanceStats[q.id];
    // Include only questions that have stats and have been answered incorrectly at least once
    return stats && stats.incorrectAttempts > 0;
  });

  // 3. Sort by last attempt timestamp (most recent first)
  const sortedWeakQuestions = weakQuestions.sort((a, b) => {
    const statsA = performanceStats[a.id];
    const statsB = performanceStats[b.id];

    // Should always have stats due to the filter above, but add checks for safety
    if (!statsA || !statsB || !statsA.lastAttemptTimestamp || !statsB.lastAttemptTimestamp) {
        // If stats or timestamps are missing for some reason, don't change order
        return 0;
    }

    // Compare timestamps as strings (ISO format allows direct comparison for recency)
    // Newer timestamp string is "greater"
    if (statsA.lastAttemptTimestamp > statsB.lastAttemptTimestamp) return -1; // a is more recent, comes first
    if (statsA.lastAttemptTimestamp < statsB.lastAttemptTimestamp) return 1;  // b is more recent, comes first
    return 0; // timestamps are the same (unlikely but possible)
  });

  return sortedWeakQuestions;
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
