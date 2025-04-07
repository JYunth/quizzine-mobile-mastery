
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import QuizCard from "@/components/QuizCard";
import { Question, Answer } from "@/types";
import { ArrowLeft } from "lucide-react";
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
}

const QuizInProgress: React.FC<QuizInProgressProps> = ({
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
  onNavigateReview
}) => {
  const navigate = useNavigate();
  const progress = ((currentQuestionIndex + (reviewMode ? 0 : 1)) / totalQuestions) * 100;
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={reviewMode ? onBackToResults : () => navigate('/')}
            className="p-0 h-auto"
          >
            <ArrowLeft size={20} className="mr-1" />
            {reviewMode ? 'Back to Results' : 'Exit Quiz'}
          </Button>
          <div className="font-medium">{title}</div>
          <div className="text-sm">
            {currentQuestionIndex + 1} / {totalQuestions}
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </div>
      
      <QuizCard 
        question={currentQuestion} 
        onAnswer={onAnswer}
        userAnswer={userAnswer}
        isBookmarked={isBookmarked}
        onBookmarkChange={onBookmarkChange}
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
    </div>
  );
};

export default QuizInProgress;
