import { toggleBookmark, isBookmarked } from "@/lib/storage";
import { Question, Answer } from "@/types";
import { useState } from "react";
import { Bookmark, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface QuizCardProps {
  question: Question;
  onAnswer: (answer: Answer) => void;
  showExplanation?: boolean;
  userAnswer?: number;
}

const QuizCard = ({ 
  question, 
  onAnswer, 
  showExplanation = false,
  userAnswer 
}: QuizCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(userAnswer !== undefined ? userAnswer : null);
  const [startTime] = useState<number>(Date.now());
  const [bookmarked, setBookmarked] = useState<boolean>(isBookmarked(question.id));
  
  const handleOptionSelect = (index: number) => {
    if (userAnswer !== undefined) return; // Don't allow changing if in review mode
    setSelectedOption(index);
  };
  
  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const timeTaken = Date.now() - startTime;
    onAnswer({
      questionId: question.id,
      selectedOptionIndex: selectedOption,
      correct: selectedOption === question.correctIndex,
      timeTaken
    });
  };
  
  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowBookmarked = toggleBookmark(question.id);
    setBookmarked(isNowBookmarked);
    toast(isNowBookmarked ? "Bookmark added" : "Bookmark removed");
  };
  
  const renderOptions = () => {
    return question.options.map((option, index) => {
      let optionClass = "border rounded-lg p-3 mb-2 cursor-pointer transition-colors";
      
      if (selectedOption === index) {
        // Selected by user
        if (userAnswer !== undefined) {
          // In review mode
          optionClass += index === question.correctIndex
            ? " bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700"
            : " bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700";
        } else {
          // In quiz mode
          optionClass += " bg-primary/10 border-primary";
        }
      } else if (userAnswer !== undefined && index === question.correctIndex) {
        // Show correct answer in review mode
        optionClass += " bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700";
      }
      
      return (
        <div 
          key={index}
          className={optionClass}
          onClick={() => handleOptionSelect(index)}
        >
          <div className="flex items-center">
            <div className="w-6 h-6 flex items-center justify-center rounded-full border mr-2 text-sm font-medium">
              {String.fromCharCode(65 + index)}
            </div>
            <div className="flex-1">{option}</div>
          </div>
        </div>
      );
    });
  };
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardContent className="p-4 pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-sm text-muted-foreground">
            Week {question.week} · {question.tags.join(" · ")}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleBookmark}
            className={bookmarked ? "text-amber-500" : ""}
          >
            <Bookmark size={20} />
          </Button>
        </div>
        
        <div className="mb-6 font-medium whitespace-pre-wrap">{question.question}</div>
        
        <div>{renderOptions()}</div>
        
        {showExplanation && userAnswer !== undefined && (
          <div className="mt-4 p-3 bg-secondary rounded-lg">
            <h4 className="font-medium mb-1">Explanation</h4>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}
      </CardContent>
      
      {userAnswer === undefined && (
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={handleSubmit} 
            disabled={selectedOption === null}
            className="w-full"
          >
            Submit Answer
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default QuizCard;
