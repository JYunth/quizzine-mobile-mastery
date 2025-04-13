import { AppStorage, Question, QuizAttempt, CustomQuiz, Course } from "@/types";
// Import the new Map getter from questionStore
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
    lastActive: new Date().toISOString().split('T')[0],
    currentStreak: 1,
  },
  customQuizzes: [],
};

// Get storage from localStorage
export const getStorage = (): AppStorage => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return initialStorage;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse storage', error);
    return initialStorage;
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

// Update streak data
export const updateStreak = (): void => {
  const storage = getStorage();
  const today = new Date().toISOString().split('T')[0];
  const lastActive = storage.streaks.lastActive;
  
  // If last active was yesterday, increase streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (lastActive === yesterdayStr) {
    storage.streaks.currentStreak += 1;
  } 
  // If last active was before yesterday, reset streak
  else if (lastActive < yesterdayStr) {
    storage.streaks.currentStreak = 1;
  }
  
  storage.streaks.lastActive = today;
  saveStorage(storage);
};

// Save quiz attempt
export const saveQuizAttempt = (attempt: QuizAttempt): void => {
  const storage = getStorage();
  storage.attempts.push(attempt);
  saveStorage(storage);
  updateStreak();
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
