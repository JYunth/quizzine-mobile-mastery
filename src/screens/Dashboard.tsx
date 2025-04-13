
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { getStorage } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppStorage, QuizAttempt } from "@/types";
import { Badge } from "@/components/ui/badge";

export const Dashboard = (): JSX.Element => {
  const [storage, setStorage] = useState<AppStorage | null>(null);
  
  useEffect(() => {
    setStorage(getStorage());
  }, []);
  
  if (!storage) {
    return (
      <PageLayout title="Dashboard">
        <div className="text-center py-10">Loading...</div>
      </PageLayout>
    );
  }
  
  // Prepare data for charts
  const weeklyScores = prepareWeeklyScores(storage.attempts);
  const tagPerformance = prepareTagPerformance(storage);
  const quizHistory = prepareQuizHistory(storage.attempts);
  
  return (
    <PageLayout title="Dashboard">
      <div className="max-w-4xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Quizzes" 
            value={storage.attempts.length.toString()} 
          />
          <StatCard 
            title="Total Questions" 
            value={storage.attempts.reduce((sum, a) => sum + a.totalQuestions, 0).toString()} 
          />
          <StatCard 
            title="Avg. Score" 
            value={`${calculateAverageScore(storage.attempts)}%`} 
          />
          <StatCard 
            title="Current Streak" 
            value={storage.streaks.currentStreak.toString()} 
            highlight 
          />
        </div>
        
        {storage.attempts.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold mb-2">No data yet</h2>
            <p className="text-muted-foreground mb-6">Complete some quizzes to see your statistics</p>
          </div>
        ) : (
          <>
            {/* Weekly Performance */}
            <h2 className="font-semibold text-xl mb-4">Weekly Performance</h2>
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyScores}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                      <Bar dataKey="score" fill="#7e69ab" name="Score %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Tag Performance */}
            <h2 className="font-semibold text-xl mb-4">Performance by Topic</h2>
            <Card className="mb-6">
              <CardContent className="p-4">
                {tagPerformance.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">Not enough data yet</p>
                ) : (
                  tagPerformance.map(tag => (
                    <div key={tag.tag} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">{tag.tag}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {tag.correct} of {tag.total} correct
                          </span>
                        </div>
                        <span className="font-medium">{tag.percentage}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2" 
                          style={{ width: `${tag.percentage}%` }} 
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            
            {/* Recent Quizzes */}
            <h2 className="font-semibold text-xl mb-4">Recent Quizzes</h2>
            <div className="space-y-4">
              {quizHistory.map((quiz, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{getQuizTitle(quiz)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quiz.timestamp).toLocaleString()} · {quiz.totalQuestions} {quiz.totalQuestions === 1 ? 'question' : 'questions'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{Math.round((quiz.score / quiz.totalQuestions) * 100)}%</div>
                        <p className="text-sm text-muted-foreground">
                          {quiz.score} / {quiz.totalQuestions} correct
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};

const StatCard = ({ title, value, highlight = false }: { title: string; value: string; highlight?: boolean }): JSX.Element => (
  <Card>
    <CardContent className="p-4 text-center">
      <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
      <div className={`text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>{value}</div>
    </CardContent>
  </Card>
);

// Helper functions to prepare data
function prepareWeeklyScores(attempts: QuizAttempt[]): { name: string; score: number; }[] {
  const weekMap = new Map<number, { total: number; correct: number }>();
  
  attempts.forEach(attempt => {
    if (attempt.mode === 'weekly' && attempt.week) {
      if (!weekMap.has(attempt.week)) {
        weekMap.set(attempt.week, { total: 0, correct: 0 });
      }
      
      const weekData = weekMap.get(attempt.week)!;
      weekData.total += attempt.totalQuestions;
      weekData.correct += attempt.score;
    }
  });
  
  return Array.from(weekMap.entries())
    .map(([week, data]) => ({
      name: `Week ${week}`,
      score: Math.round((data.correct / data.total) * 100)
    }))
    .sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));
}

function prepareTagPerformance(storage: AppStorage): { tag: string; correct: number; total: number; percentage: number; }[] {
  // This would require accessing the questions to get tag data
  // For now, returning a stub
  return [
    { tag: 'JavaScript', correct: 12, total: 15, percentage: 80 },
    { tag: 'HTML', correct: 8, total: 10, percentage: 80 },
    { tag: 'CSS', correct: 6, total: 10, percentage: 60 },
    { tag: 'Algorithms', correct: 4, total: 8, percentage: 50 },
  ];
}

function prepareQuizHistory(attempts: QuizAttempt[]): QuizAttempt[] {
  return [...attempts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
}

function calculateAverageScore(attempts: QuizAttempt[]): number {
  if (attempts.length === 0) return 0;
  
  const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
  const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  
  return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
}

function getQuizTitle(quiz: QuizAttempt): string {
  switch(quiz.mode) {
    case 'weekly':
      return `Week ${quiz.week} Quiz`;
    case 'full':
      return 'Full Quiz';
    case 'bookmark':
      return 'Bookmarked Questions';
    case 'smart':
      return 'Smart Boost Quiz';
    case 'custom':
      return 'Custom Quiz';
    default:
      return 'Quiz';
  }
}

// No default export needed, using named export above
