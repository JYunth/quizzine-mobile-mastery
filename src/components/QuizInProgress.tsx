
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuizCard } from "@/components/QuizCard";
import { Question, Answer } from "@/types";
import { ArrowLeft, X } from "lucide-react"; // Import X icon
import { useNavigate } from "react-router-dom";

interface QuizInProgressProps {
  title: string;
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  isBookmarked: boolean;
  reviewMode: boolean;
  userAnswer?: number;
  onBookmarkChange: (isNowBookmarked: boolean) => void;
  onAnswer: (answer: Answer) => void;
  onBackToResults?: () => void;
  onNavigateReview?: (direction: 'next' | 'prev') => void;
  onGoToPrevious?: () => void; // Add prop for going back during quiz
  answers: Answer[]; // Add answers array to find previous selections
}

export const QuizInProgress = ({
  title,
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  isBookmarked,
  reviewMode,
  userAnswer,
  onBookmarkChange,
  onAnswer,
  onBackToResults,
  onNavigateReview,
  onGoToPrevious, // Destructure the new prop
  answers // Destructure answers array
}: QuizInProgressProps): JSX.Element => {
  const navigate = useNavigate();
  const progress = ((currentQuestionIndex + (reviewMode ? 0 : 1)) / totalQuestions) * 100;
  // Find the answer previously submitted for this question (if any)
  const previousAnswer = answers.find(a => a.questionId === currentQuestion.id);
  const previouslySelectedOptionIndex = previousAnswer?.selectedOptionIndex;
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        {/* Left-aligned Icon Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={reviewMode ? onBackToResults : () => navigate('/')}
          className="h-10 w-10" // Ensure consistent size
        >
          {reviewMode ? <ArrowLeft size={20} /> : <X size={20} />}
          <span className="sr-only">{reviewMode ? 'Back to Results' : 'Exit Quiz'}</span> 
        </Button>
        
        {/* Centered Title */}
        <div className="font-medium text-center flex-grow">{title}</div>
        
        {/* Placeholder for right side to balance layout */}
        <div className="w-10"></div> 
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-1" />
        {/* Optional: Display question count here if needed */}
         <div className="text-sm text-center mt-2 text-muted-foreground">
           {currentQuestionIndex + 1} / {totalQuestions}
         </div>
      </div>
      
      <QuizCard 
        question={currentQuestion} 
        onAnswer={onAnswer}
        userAnswer={userAnswer}
        isBookmarked={isBookmarked}
        onBookmarkChange={onBookmarkChange}
        previouslySelectedOptionIndex={previouslySelectedOptionIndex} // Pass previous selection
      />
      
      {reviewMode && onNavigateReview && (
        <div className="flex justify-between mt-4">
          <Button 
            onClick={() => onNavigateReview('prev')} 
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>
          <Button 
            onClick={() => onNavigateReview('next')} 
            disabled={currentQuestionIndex === totalQuestions - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      {/* Navigation for active quiz (Back button) */}
      {!reviewMode && onGoToPrevious && (
        <div className="flex justify-start mt-4"> {/* Align left */}
          <Button
            onClick={onGoToPrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {/* Add icon */}
            Back
          </Button>
          {/* No "Next" button here, answering progresses */}
        </div>
      )}
    </div>
  );
};

// No default export needed, using named export above
