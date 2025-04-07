
import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { getAllQuestions, getStorage, updateStreak, getAllCourses, getCurrentCourseId, setCurrentCourseId } from "@/lib/storage";
import { Course, Question } from "@/types";
import WeekCard from "@/components/WeekCard";
import ActionCard from "@/components/ActionCard";
import { Brain, Zap, ListChecks } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Home = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [weekData, setWeekData] = useState<Map<number, { 
    count: number, 
    tags: string[], 
    title?: string 
  }>>(new Map());
  const [streak, setStreak] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourseId, setCurrentCourseState] = useState<string>(getCurrentCourseId());
  
  useEffect(() => {
    const loadCourses = async () => {
      const allCourses = await getAllCourses();
      setCourses(allCourses);
    };
    
    loadCourses();
  }, []);
  
  useEffect(() => {
    const loadData = async () => {
      const allQuestions = await getAllQuestions();
      setQuestions(allQuestions);
      
      // Process questions by week
      const weekMap = new Map<number, { count: number, tags: string[], title?: string }>();
      
      allQuestions.forEach(q => {
        if (!weekMap.has(q.week)) {
          weekMap.set(q.week, { count: 0, tags: [], title: q.weekTitle });
        }
        
        const weekInfo = weekMap.get(q.week)!;
        weekInfo.count++;
        
        // Add unique tags if they exist
        if (q.tags) {
          q.tags.forEach(tag => {
            if (!weekInfo.tags.includes(tag)) {
              weekInfo.tags.push(tag);
            }
          });
        }
      });
      
      setWeekData(weekMap);
      
      // Get user streak
      const storage = getStorage();
      setStreak(storage.streaks.currentStreak);
      
      // Update streak for today
      updateStreak();
    };
    
    loadData();
  }, [currentCourseId]);
  
  const handleCourseChange = (courseId: string) => {
    setCurrentCourseState(courseId);
    setCurrentCourseId(courseId);
    toast(`Switched to ${courses.find(c => c.id === courseId)?.name}`);
  };
  
  // Get unique weeks and sort them
  const weeks = Array.from(weekData.keys()).sort((a, b) => a - b);
  
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
      </div>
    </PageLayout>
  );
};

export default Home;
