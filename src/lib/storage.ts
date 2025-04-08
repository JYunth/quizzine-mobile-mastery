import { AppStorage, Question, QuizAttempt, CustomQuiz, Course } from "@/types";
// Import the new Map getter from questionStore
import { getQuestionData, getCachedCourses, getCachedAllQuestions, getCachedQuestionsMap } from "./questionStore"; 

const STORAGE_KEY = 'quizzineApp';

// Initial state for app storage
const initialStorage: AppStorage = {
  attempts: [],
  bookmarks: [],
  settings: {
    darkMode: false,
    reminders: false,
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
export const toggleBookmark = (questionId: string): boolean => {
  const storage = getStorage();
  const index = storage.bookmarks.indexOf(questionId);
  
  if (index === -1) {
    storage.bookmarks.push(questionId);
    saveStorage(storage);
    return true; // Added bookmark
  } else {
    storage.bookmarks.splice(index, 1);
    saveStorage(storage);
    return false; // Removed bookmark
  }
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

// Get all courses from cache
export const getAllCourses = async (): Promise<Course[]> => {
  return await getCachedCourses();
};

// Get questions for week in current course from cache
export const getQuestionsForWeek = async (week: number): Promise<Question[]> => {
  const { allQuestions } = await getQuestionData();
  const courseId = getCurrentCourseId();
  return allQuestions.filter(q => q.courseId === courseId && q.week === week);
};

// Get all questions from current course from cache
export const getAllQuestions = async (): Promise<Question[]> => {
  const { allQuestions } = await getQuestionData();
  const courseId = getCurrentCourseId();
  return allQuestions.filter(q => q.courseId === courseId);
};

// Get questions from all courses from cache
export const getAllQuestionsFromAllCourses = async (): Promise<Question[]> => {
  return await getCachedAllQuestions();
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
export const getBookmarkedQuestions = async (): Promise<Question[]> => {
  const storage = getStorage();
  const allQuestions = await getCachedAllQuestions(); // Use cached data
  return allQuestions.filter(q => storage.bookmarks.includes(q.id));
};

// Get "smart boost" questions (prioritizing low confidence questions) from cache
export const getSmartBoostQuestions = async (count: number = 10): Promise<Question[]> => {
  const storage = getStorage();
  const courseId = getCurrentCourseId();
  const allQuestions = await getCachedAllQuestions(); // Use cached data

  // Filter for current course first
  const courseQuestions = allQuestions.filter(q => q.courseId === courseId);

  // Sort by confidence (undefined or low confidence first)
  const sortedQuestions = [...courseQuestions].sort((a, b) => {
    const confidenceA = storage.confidenceRatings[a.id] || 0;
    const confidenceB = storage.confidenceRatings[b.id] || 0;
    return confidenceA - confidenceB;
  });
  
  return sortedQuestions.slice(0, count);
};

// Custom Quiz functions
export const saveCustomQuiz = (quiz: CustomQuiz): void => {
  const storage = getStorage();
  storage.customQuizzes.push(quiz);
  saveStorage(storage);
};

// Update an existing custom quiz
export const updateCustomQuiz = (updatedQuiz: CustomQuiz): void => {
  const storage = getStorage();
  const index = storage.customQuizzes.findIndex(quiz => quiz.id === updatedQuiz.id);
  if (index !== -1) {
    storage.customQuizzes[index] = updatedQuiz;
    saveStorage(storage);
  } else {
    console.error(`Quiz with id ${updatedQuiz.id} not found for update.`);
    // Optionally throw an error or handle it differently
  }
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
export const getQuestionsForCustomQuiz = async (quizId: string): Promise<Question[]> => {
  const quiz = getCustomQuizById(quizId);
  if (!quiz || quiz.questionIds.length === 0) {
    // console.log(`Custom quiz ${quizId} not found or has no questions.`); // Removed log
    return [];
  }

  // console.log(`Fetching questions for custom quiz ${quizId} using Map lookup...`); // Removed log
  const questionsMap = await getCachedQuestionsMap(); // Get the Map
  const loadedQuestions: Question[] = [];

  quiz.questionIds.forEach(qId => {
    const question = questionsMap.get(qId);
    if (question) {
      loadedQuestions.push(question);
    } else {
      // console.warn(`Question ID ${qId} from custom quiz ${quizId} not found in cache.`); // Removed log
    }
  });

  // console.log(`Found ${loadedQuestions.length} questions for custom quiz ${quizId}.`); // Removed log
  return loadedQuestions; // Return the array of found questions
};

export const deleteCustomQuiz = (id: string): void => {
  const storage = getStorage();
  storage.customQuizzes = storage.customQuizzes.filter(quiz => quiz.id !== id);
  saveStorage(storage);
};
