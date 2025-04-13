
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { getAllQuestions, getStorage, updateStreak, getAllCourses, getCurrentCourseId, setCurrentCourseId } from "@/lib/storage";
import { Course, Question } from "@/types";
import { WeekCard } from "@/components/WeekCard";
import { ActionCard } from "@/components/ActionCard";
import { Brain, Zap, ListChecks } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading state

export const Home = (): JSX.Element => {
  // Local state for UI interaction
  const [streak, setStreak] = useState(0);
  const [currentCourseId, setCurrentCourseState] = useState<string>(getCurrentCourseId());

  // Fetch courses using TanStack Query
  const { data: courses = [], isLoading: isLoadingCourses, isSuccess: isSuccessCourses, isError: isErrorCourses } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: getAllCourses,
    staleTime: Infinity, // Courses are static, cache indefinitely
  });

  // Effect to set initial course ID once courses are successfully loaded
  useEffect(() => {
    if (isSuccessCourses && courses.length > 0) {
      const initialCourseId = getCurrentCourseId();
      // Check if the currently stored course ID exists in the loaded courses
      if (!courses.some(c => c.id === initialCourseId)) {
        // If not valid, use the first course as a fallback
        const fallbackId = courses[0].id;
        setCurrentCourseState(fallbackId);
        setCurrentCourseId(fallbackId); // Persist the fallback ID
      } else {
        // If valid, ensure the local state matches the persisted one
        setCurrentCourseState(initialCourseId);
      }
    }
    // Only run when courses are successfully loaded or the success status changes
  }, [isSuccessCourses, courses]);

  // Fetch questions for the selected course using TanStack Query
  const { data: questions = [], isLoading: isLoadingQuestions, isError: isErrorQuestions } = useQuery<Question[]>({
    // Query key includes the course ID to refetch when it changes
    queryKey: ['questions', currentCourseId],
    // The query function `getAllQuestions` implicitly uses the currentCourseId from storage
    queryFn: getAllQuestions,
    // Only run the query if a course ID is selected
    enabled: !!currentCourseId && isSuccessCourses, // Enable only when a course is selected and courses have successfully loaded
    staleTime: 1000 * 60 * 5, // Cache questions for 5 minutes
  });

  // Effect for streak (remains unchanged as it uses localStorage)
  useEffect(() => {
    const storage = getStorage();
    setStreak(storage.streaks.currentStreak);
    updateStreak(); // Update streak for today
  }, []); // Run once on mount

  // Memoize the calculation of week data
  const weekData = useMemo(() => {
    const weekMap = new Map<number, { count: number, tags: string[], title?: string }>();
    questions.forEach(q => {
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
  }, [questions]); // Recalculate only when questions change
  
  const handleCourseChange = (courseId: string) => {
    setCurrentCourseState(courseId);
    setCurrentCourseId(courseId);
    // Ensure courses is treated as an array before calling find
    const courseName = Array.isArray(courses) ? courses.find(c => c.id === courseId)?.name : 'Unknown Course';
    toast(`Switched to ${courseName}`);
  };
  
  // Get unique weeks and sort them from the memoized data
  const weeks = useMemo(() => Array.from(weekData.keys()).sort((a, b) => a - b), [weekData]);

  return (
    <PageLayout title="Quizzine">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex-grow">
            <h2 className="text-lg font-semibold mb-1">Course</h2>
            <Select value={currentCourseId} onValueChange={handleCourseChange}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(courses) && courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-primary/10 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-xl">Welcome back!</h2>
              <p className="text-sm text-muted-foreground">
                {streak > 1 
                  ? `You're on a ${streak}-day streak. Keep it up!`
                  : "Start your learning streak today!"}
              </p>
            </div>
            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold">
              {streak}
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
            title="Quick Quiz" 
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
        {isLoadingCourses || isLoadingQuestions ? (
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
        ) : isErrorCourses || isErrorQuestions ? (
           <p className="text-destructive text-center py-4">Error loading data. Please try again later.</p>
        ) : weeks.length === 0 ? (
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
