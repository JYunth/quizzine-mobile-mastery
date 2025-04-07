
import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { getAllQuestions, getStorage, updateStreak } from "@/lib/storage";
import { Question } from "@/types";
import WeekCard from "@/components/WeekCard";
import ActionCard from "@/components/ActionCard";
import { Brain, Calendar, Lightning, Settings } from "lucide-react";

const Home = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [weekData, setWeekData] = useState<Map<number, { count: number, tags: string[] }>>(new Map());
  const [streak, setStreak] = useState(0);
  
  useEffect(() => {
    const loadData = async () => {
      const allQuestions = await getAllQuestions();
      setQuestions(allQuestions);
      
      // Process questions by week
      const weekMap = new Map<number, { count: number, tags: string[] }>();
      
      allQuestions.forEach(q => {
        if (!weekMap.has(q.week)) {
          weekMap.set(q.week, { count: 0, tags: [] });
        }
        
        const weekInfo = weekMap.get(q.week)!;
        weekInfo.count++;
        
        // Add unique tags
        q.tags.forEach(tag => {
          if (!weekInfo.tags.includes(tag)) {
            weekInfo.tags.push(tag);
          }
        });
      });
      
      setWeekData(weekMap);
      
      // Get user streak
      const storage = getStorage();
      setStreak(storage.streaks.currentStreak);
      
      // Update streak for today
      updateStreak();
    };
    
    loadData();
  }, []);
  
  // Get unique weeks and sort them
  const weeks = Array.from(weekData.keys()).sort((a, b) => a - b);
  
  return (
    <PageLayout title="Quizzine">
      <div className="max-w-4xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
            icon={Lightning}
            to="/quiz/full"
            color="bg-amber-600"
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
              />
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default Home;
