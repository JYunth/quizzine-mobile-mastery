
import { toggleBookmark } from "@/lib/storage";
import { Question, Answer } from "@/types";
import { useEffect, useState } from "react";
import { Bookmark, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QuizCardProps {
  question: Question;
  onAnswer: (answer: Answer) => void;
  userAnswer?: number;
  isBookmarked: boolean;
  onBookmarkChange?: (isBookmarked: boolean) => void;
  previouslySelectedOptionIndex?: number; // Add prop for previous selection
}

export const QuizCard = ({
  question,
  onAnswer,
  userAnswer,
  isBookmarked,
  onBookmarkChange,
  previouslySelectedOptionIndex // Destructure the new prop
}: QuizCardProps): JSX.Element => {
  // Initialize with previous selection if available, otherwise review answer, else null
  const [selectedOption, setSelectedOption] = useState<number | null>(
    previouslySelectedOptionIndex !== undefined ? previouslySelectedOptionIndex : (userAnswer !== undefined ? userAnswer : null)
  );
  const [startTime, setStartTime] = useState<number>(Date.now());
  
  // Reset selected option when question changes
  // Reset/update selected option when question changes or props update
  useEffect(() => {
    // Prioritize previously selected answer if available (when navigating back)
    if (previouslySelectedOptionIndex !== undefined) {
      setSelectedOption(previouslySelectedOptionIndex);
      // Don't reset startTime here, user might have started before navigating away
    } else if (userAnswer !== undefined) {
      // If in review mode, show the user's final answer for this question
      setSelectedOption(userAnswer);
    } else {
      // Otherwise (new question or no previous answer), reset selection and timer
      setSelectedOption(null);
      setStartTime(Date.now());
    }
  }, [question.id, userAnswer, previouslySelectedOptionIndex]); // Add dependency
  
  const handleOptionSelect = (index: number): void => {
    if (userAnswer !== undefined) return; // Don't allow changing if in review mode
    setSelectedOption(index);
  };
  
  const handleSubmit = (): void => {
    if (selectedOption === null) return;
    
    const timeTaken = Date.now() - startTime;
    onAnswer({
      questionId: question.id,
      selectedOptionIndex: selectedOption,
      selectedOptionText: question.options[selectedOption], // Add the selected option text
      correct: selectedOption === question.correctIndex,
      timeTaken,
    });
  };
  
  const handleToggleBookmark = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const isNowBookmarked = await toggleBookmark(question.id);
      onBookmarkChange?.(isNowBookmarked); // Pass the resolved boolean value
      toast(isNowBookmarked ? "Question has been bookmarked" : "Bookmark has been removed");
    } catch (error) {
      console.error("Failed to toggle bookmark in QuizCard:", error);
      toast.error("Failed to update bookmark status.");
    }
  };
  
  const renderOptions = (): JSX.Element[] => {
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
            Week {question.week} · {question.tags?.join(" · ")}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleBookmark}
            className={isBookmarked ? "text-amber-500" : ""}
          >
            <Bookmark size={20} />
          </Button>
        </div>
        
        <div className="mb-6 font-medium whitespace-pre-wrap">{question.question}</div>
        
        <div>{renderOptions()}</div>
        
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

// No default export needed, using named export above
