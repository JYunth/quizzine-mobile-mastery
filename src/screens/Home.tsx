
import { useEffect, useState, useMemo } from "react"; // Added useMemo
import { PageLayout } from "@/components/PageLayout";
import { getAllQuestions, getStorage, updateStreak, getAllCourses, getCurrentCourseId, setCurrentCourseId } from "@/lib/storage";
import { Course, Question } from "@/types";
import { WeekCard } from "@/components/WeekCard"; // Assuming WeekCard is not memoized, we might need React.memo later
import { ActionCard } from "@/components/ActionCard";
import { Brain, Zap, ListChecks } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Home = (): JSX.Element => {
  const [questions, setQuestions] = useState<Question[]>([]); // Questions for the current course
  const [streak, setStreak] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourseId, setCurrentCourseState] = useState<string>(getCurrentCourseId());
  const [loading, setLoading] = useState(true); // Add loading state

  // Load courses once on mount
  useEffect(() => {
    const loadInitialCourses = async () => {
      const allCourses = await getAllCourses();
      setCourses(allCourses);
      // Ensure currentCourseId is valid, fallback if needed
      const initialCourseId = getCurrentCourseId();
      if (!allCourses.some(c => c.id === initialCourseId)) {
        const fallbackId = allCourses[0]?.id || '';
        setCurrentCourseState(fallbackId);
        setCurrentCourseId(fallbackId); // Persist fallback if needed
      }
    };
    loadInitialCourses();
  }, []);

  // Load questions whenever the current course changes
  useEffect(() => {
    const loadCourseData = async () => {
      setLoading(true);
      if (currentCourseId) { // Only load if a course is selected
        const courseQuestions = await getAllQuestions(); // This now gets questions for the current course from cache
        setQuestions(courseQuestions);
      } else {
        setQuestions([]); // Clear questions if no course selected
      }
      setLoading(false);
    };

    loadCourseData();

    // Load streak info (can be done independently or here)
    const storage = getStorage();
    setStreak(storage.streaks.currentStreak);
    updateStreak(); // Update streak for today

  }, [currentCourseId]);

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
    toast(`Switched to ${courses.find(c => c.id === courseId)?.name}`);
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
                {courses.map(course => (
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
        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
             {/* Placeholder skeletons */}
             {[1, 2, 3].map(i => (
               <div key={i} className="p-4 border rounded-lg">
                 <div className="h-6 bg-muted rounded w-1/4 mb-2"></div>
                 <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
                 <div className="flex flex-wrap gap-1">
                   <div className="h-5 bg-muted rounded w-10"></div>
                   <div className="h-5 bg-muted rounded w-12"></div>
                 </div>
               </div>
             ))}
           </div>
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
