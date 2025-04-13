
import { useMemo } from "react"; // Removed useEffect, useState
import { useQuery } from "@tanstack/react-query";
import { useQuestions } from "@/hooks/useQuestions";
import { PageLayout } from "@/components/PageLayout";
import { getAllQuestions, getCurrentCourseId } from "@/lib/storage"; // Removed getStorage for streak
import { Question } from "@/types";
import { useStreak } from "@/hooks/useStreak"; // Import useStreak
import { WeekCard } from "@/components/WeekCard";
import { ActionCard } from "@/components/ActionCard";
import { Brain, Zap, ListChecks } from "lucide-react";
// Removed Select imports
// Removed toast import (assuming it was only for course change)
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading state

export const Home = (): JSX.Element => {
  // Removed local streak state
  // Removed currentCourseId state

  // Fetch base question data (includes courses)
  const {
    data: questionData,
    isLoading: isLoadingBase,
    isError: isErrorBase,
  } = useQuestions();

  // Derive courses directly from the base data hook
  const courses = useMemo(() => questionData?.courses ?? [], [questionData]);
  const safeCourses = courses ?? []; // Ensure it's always an array

  // Use loading/success/error states from the base hook for courses
  const isLoadingCourses = isLoadingBase;
  const isSuccessCourses = !isLoadingBase && !isErrorBase && !!questionData;
  const isErrorCourses = isErrorBase;

  // Removed effect for setting initial course ID state

  // Fetch questions for the selected course using TanStack Query
  // Fetch questions filtered for the selected course (dependent query)
  // Fetch questions for the selected course using TanStack Query
  // Fetch questions filtered for the selected course (dependent query)
  // Read currentCourseId directly from storage for the query
  const currentCourseIdFromStorage = getCurrentCourseId();
  const { data: courseQuestions, isLoading: isLoadingCourseQuestions, isError: isErrorCourseQuestions } = useQuery<Question[]>({
    queryKey: ['courseQuestions', currentCourseIdFromStorage, questionData?.allQuestions], // Depends on base data and stored course ID
    queryFn: () => {
      if (!questionData?.allQuestions) return []; // Guard
      return getAllQuestions(questionData.allQuestions); // Pass base data
    },
    // Enable only when base data is ready AND a course ID is available from storage
    enabled: !!questionData?.allQuestions && !!currentCourseIdFromStorage && isSuccessCourses,
    staleTime: 1000 * 60 * 5,
  });
  const safeCourseQuestions = courseQuestions ?? []; // Ensure it's always an array

  // Use the streak hook to get the current count
  const { streakCount } = useStreak();

  // Memoize the calculation of week data
  const weekData = useMemo(() => {
    const weekMap = new Map<number, { count: number, tags: string[], title?: string }>();
    // Use safeCourseQuestions and check loading/error states
    if (isLoadingBase || isLoadingCourseQuestions || isErrorBase || isErrorCourseQuestions) {
      return new Map(); // Return empty map if loading or error
    }
    safeCourseQuestions.forEach(q => {
      if (!weekMap.has(q.week)) {
        weekMap.set(q.week, { count: 0, tags: [], title: q.weekTitle });
      }
      const weekInfo = weekMap.get(q.week)!;
      weekInfo.count++;
      if (q.tags) {
        q.tags.forEach(tag => {
          if (!weekInfo.tags.includes(tag)) {
            weekInfo.tags.push(tag);
          }
        });
      }
    });
    return weekMap;
  }, [safeCourseQuestions, isLoadingBase, isLoadingCourseQuestions, isErrorBase, isErrorCourseQuestions]); // Update dependencies
  
  // Removed handleCourseChange
  
  // Get unique weeks and sort them from the memoized data
  const weeks = useMemo(() => Array.from(weekData.keys()).sort((a, b) => a - b), [weekData]);

  return (
    <PageLayout title="Quizzine">
      <div className="max-w-4xl mx-auto">
        {/* Removed Course Selection Dropdown Section */}
        
        <div className="mb-6 p-4 bg-primary/10 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-xl">Welcome back!</h2>
              <p className="text-sm text-muted-foreground">
                {streakCount > 1
                  ? `You're on a ${streakCount}-day streak. Keep it up!`
                  : streakCount === 1
                  ? "You're on a 1-day streak. Keep it going!"
                  : "Start your learning streak today!"}
              </p>
            </div>
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold">
              {streakCount}
            </div>
          </div>
        </div>
        
        <h2 className="font-semibold text-xl mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ActionCard 
            title="Smart Boost" 
            description="Focus on questions you find difficult"
            icon={Brain}
            to="/quiz/smart"
            color="bg-purple-600"
          />
          <ActionCard 
            title="Boss Battle"
            description="Take a quiz with all questions"
            icon={Zap}
            to="/quiz/full"
            color="bg-amber-600"
          />
          <ActionCard 
            title="Custom Quizzes" 
            description="Create and take custom quizzes"
            icon={ListChecks}
            to="/custom-quizzes"
            color="bg-blue-600"
          />
        </div>
        
        <h2 className="font-semibold text-xl mb-4">Weeks</h2>
        {/* Combine loading states */}
        {isLoadingBase || isLoadingCourseQuestions ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Placeholder skeletons */}
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex flex-wrap gap-1 pt-1">
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            ))}
          </div>
        )
        // Combine error states
        : isErrorBase || isErrorCourseQuestions ? (
           <p className="text-destructive text-center py-4">Error loading data. Please try again later.</p>
        )
        : weeks.length === 0 ? (
           <p className="text-muted-foreground text-center py-4">No weeks found for this course.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {weeks.map(week => {
              const data = weekData.get(week)!;
              return (
                <WeekCard 
                  key={week} 
                  week={week} 
                  questionsCount={data.count}
                  tags={data.tags}
                  weekTitle={data.title}
                />
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

// No default export needed, using named export above
