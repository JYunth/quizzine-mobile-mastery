import { Course, Question } from "@/types";
import { safeFetch } from "@/lib/quizUtils"; // Assuming safeFetch is still relevant for the initial load

interface QuestionData {
  courses: Course[];
  allQuestions: Question[]; // Keep the array for potential other uses
  questionsById: Map<string, Question>; // Add Map for efficient lookup
}

let cachedData: QuestionData | null = null;
let dataPromise: Promise<QuestionData> | null = null;

// Define the raw structure fetched from JSON
interface RawCourseData {
  id: string;
  name: string;
  description?: string;
  questions: Question[]; // Assume questions are structured correctly within the JSON
}

// Fetches data from the JSON file
const fetchData = async (): Promise<QuestionData> => {
  // console.log("Fetching and processing questions data..."); // Removed log
  // Fetch raw data with the nested structure
  const rawData = await safeFetch<{ courses: RawCourseData[] }>('/questions.json', { courses: [] });

  const fetchedCourses: Course[] = [];
  const allQuestions: Question[] = [];

  if (rawData.courses) {
    rawData.courses.forEach(rawCourse => {
      // Create Course object matching the type
      fetchedCourses.push({
        id: rawCourse.id,
        name: rawCourse.name,
        description: rawCourse.description,
      });

      // Process questions from this course
      if (rawCourse.questions) {
        rawCourse.questions.forEach(q => {
          // Ensure courseId is set correctly
          q.courseId = rawCourse.id;
          // Add weekTitle if missing (find within this course's questions)
          if (!q.weekTitle) {
             const weekInfo = rawCourse.questions.find(wq => wq.week === q.week && wq.weekTitle);
             q.weekTitle = weekInfo?.weekTitle;
          }
          allQuestions.push(q);
        });
      }
    });
  }

  // console.log(`Fetched ${fetchedCourses.length} courses and ${allQuestions.length} total questions.`); // Removed log
  
  // Create the Map for efficient lookup
  const questionsById = new Map<string, Question>();
  allQuestions.forEach(q => questionsById.set(q.id, q));
  
  // console.log(`Created questionsById Map with ${questionsById.size} entries.`); // Removed log
  return { courses: fetchedCourses, allQuestions, questionsById };
};

// Gets the cached data, fetching if necessary
export const getQuestionData = async (): Promise<QuestionData> => {
  if (cachedData) {
    return cachedData;
  }
  
  if (!dataPromise) {
    dataPromise = fetchData();
  }
  
  try {
    cachedData = await dataPromise;
    return cachedData;
  } catch (error) {
    console.error("Failed to load question data:", error);
    // Reset promise to allow retrying on next call
    dataPromise = null; 
    // Return empty structure on error to prevent crashes downstream
    return { courses: [], allQuestions: [], questionsById: new Map() }; 
  } finally {
    // Clear the promise once resolved or rejected to allow refetching if needed later
    // Or keep it if we want strict singleton behavior even after failure
    // dataPromise = null; 
  }
};

// Specific getter functions (optional, but can be convenient)
export const getCachedCourses = async (): Promise<Course[]> => {
  const data = await getQuestionData();
  return data.courses;
};

export const getCachedAllQuestions = async (): Promise<Question[]> => {
  const data = await getQuestionData();
  return data.allQuestions; // Return the original array if needed elsewhere
};

// New function to get the Map directly
export const getCachedQuestionsMap = async (): Promise<Map<string, Question>> => {
  const data = await getQuestionData();
  return data.questionsById;
};

// New function to get a single question efficiently
export const getCachedQuestionById = async (id: string): Promise<Question | undefined> => {
  const map = await getCachedQuestionsMap();
  return map.get(id);
};
