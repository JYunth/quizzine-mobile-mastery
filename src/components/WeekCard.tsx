import { getStorage, getCurrentCourseId } from "@/lib/storage"; // Import getCurrentCourseId
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

export const WeekCard = ({ week, questionsCount, tags, weekTitle }: WeekCardProps): JSX.Element => {
  const storage = getStorage();
  const currentCourseId = getCurrentCourseId(); // Get the current course ID

  // Find the best attempt score for this specific week and course
  const relevantAttempts = storage.attempts.filter(
    attempt =>
      attempt.mode === 'weekly' &&
      attempt.week === week &&
      attempt.courseId === currentCourseId // Filter by course ID
  );

  // Find the highest score among relevant attempts
  const bestScore = relevantAttempts.reduce((maxScore, attempt) => {
    // Ensure attempt.score is a number, default to 0 if not
    const currentScore = typeof attempt.score === 'number' ? attempt.score : 0;
    return Math.max(maxScore, currentScore);
  }, 0); // Start with a max score of 0
  
  // Calculate completion percentage
  const completionPercentage = questionsCount > 0 
    ? Math.min(100, Math.round((bestScore / questionsCount) * 100)) // Use bestScore
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
        {/* Make CardContent a flex container, ensure it fills the Card height */}
        <CardContent className="p-4 flex flex-col h-full">
          {/* Top section: Title and Badge */}
          <div>
            {/* Apply line-clamp for consistent height and overflow handling */}
            <h3 className="text-lg font-semibold mb-1 line-clamp-2">
              {weekTitle ? `Week ${week} - ${weekTitle}` : `Week ${week}`}
            </h3>
            <Badge variant={badgeVariant} className="self-start">{status}</Badge>
          </div>

          {/* Middle section: Tags (takes up remaining space) */}
          {tags && tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1 flex-grow"> {/* Use flex-grow here */}
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-secondary px-2 py-1 rounded-full self-start" // Align tags nicely
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex-grow"></div>
          )}

          {/* Bottom section: Progress Bar */}
          <div className="mt-3 pt-2 border-t border-border/20"> {/* Add margin-top and subtle border */}
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {bestScore} of {questionsCount} questions correct {/* Use bestScore */}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

// No default export needed, using named export above
