import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Course, Question } from "@/types";
import { safeFetch } from "@/lib/quizUtils";
import { useMemo } from "react";

// Define the raw structure fetched from JSON
interface RawCourseData {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
}

// Define the structure returned by the fetch function and stored by TanStack Query
interface ProcessedQuestionData {
  courses: Course[];
  allQuestions: Question[];
  questionsById: Map<string, Question>;
}

// Fetches and processes data from the JSON file
const fetchQuestionsData = async (): Promise<ProcessedQuestionData> => {
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
             // Corrected: Use && instead of &amp;&amp;
             const weekInfo = rawCourse.questions.find(wq => wq.week === q.week && wq.weekTitle);
             q.weekTitle = weekInfo?.weekTitle;
          }
          allQuestions.push(q);
        });
      }
    });
  }

  // Create the Map for efficient lookup
  // Corrected: Use Map<string, Question> directly
  const questionsById = new Map<string, Question>();
  allQuestions.forEach(q => questionsById.set(q.id, q));

  return { courses: fetchedCourses, allQuestions, questionsById };
};

// Define the return type for the hook explicitly using a type intersection
type UseQuestionsResult = UseQueryResult<ProcessedQuestionData, Error> & {
  courses: Course[];
  allQuestions: Question[];
  questionsById: Map<string, Question>;
  getQuestionById: (id: string) => Question | undefined;
};

// Custom hook to fetch and manage question data using TanStack Query
export const useQuestions = (): UseQuestionsResult => {
  const queryResult = useQuery<ProcessedQuestionData, Error>({
    queryKey: ['questions'],
    queryFn: fetchQuestionsData,
    staleTime: Infinity, // Data is static, never becomes stale
    gcTime: Infinity, // Corrected: Use gcTime instead of cacheTime
  });

  // Memoize selectors to prevent unnecessary recalculations
  const courses = useMemo(() => queryResult.data?.courses ?? [], [queryResult.data]);
  const allQuestions = useMemo(() => queryResult.data?.allQuestions ?? [], [queryResult.data]);
  // Corrected: Use Map<string, Question> directly
  const questionsById = useMemo(() => queryResult.data?.questionsById ?? new Map<string, Question>(), [queryResult.data]);

  const getQuestionById = (id: string): Question | undefined => {
    return questionsById.get(id);
  };

  return {
    ...queryResult,
    courses,
    allQuestions,
    questionsById,
    getQuestionById,
  };
};