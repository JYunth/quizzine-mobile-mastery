
import { getStorage } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Question } from "@/types";
import { Link } from "react-router-dom";

interface WeekCardProps {
  week: number;
  questionsCount: number;
  tags?: string[];
  weekTitle?: string;
}

const WeekCard = ({ week, questionsCount, tags, weekTitle }: WeekCardProps) => {
  const storage = getStorage();
  
  // Get completed questions for this week
  const completedCount = storage.attempts
    .filter(attempt => attempt.mode === 'weekly' && attempt.week === week)
    .reduce((sum, attempt) => sum + attempt.answers.filter(a => a.correct).length, 0);
  
  // Calculate completion percentage
  const completionPercentage = questionsCount > 0 
    ? Math.min(100, Math.round((completedCount / questionsCount) * 100))
    : 0;
  
  // Determine status and badge variant
  let status = "Not started";
  // Update type to include 'inProgress'
  let badgeVariant: "notStarted" | "inProgress" | "success" = "notStarted"; 

  if (completionPercentage === 100) {
    status = "Completed";
    badgeVariant = "success";
  } else if (completionPercentage > 0) {
    status = "In progress";
    badgeVariant = "inProgress"; // Use inProgress variant
  }
  
  return (
    <Link to={`/quiz/weekly/${week}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-1">
              {weekTitle ? `Week ${week} - ${weekTitle}` : `Week ${week}`}
            </h3>
            {/* Replace span with Badge component */}
            <Badge variant={badgeVariant} className="self-start mb-3">{status}</Badge>
          </div>

          <div className="mt-1">
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedCount} of {questionsCount} questions correct
            </p>
          </div>
          
          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-secondary px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default WeekCard;
