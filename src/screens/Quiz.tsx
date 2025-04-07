
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import QuizCard from "@/components/QuizCard";
import QuizResults from "@/components/QuizResults";
import { 
  getAllQuestions,
  getBookmarkedQuestions,
  getQuestionsForWeek,
  getSmartBoostQuestions,
  saveQuizAttempt,
  shuffleArray
} from "@/lib/storage";
import { Answer, Question, QuizAttempt, QuizMode } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const Quiz = () => {
  const { mode = 'weekly', week } = useParams<{ mode: QuizMode; week?: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      
      let loadedQuestions: Question[] = [];
      
      switch(mode) {
        case 'weekly':
          if (!week) {
            navigate('/');
            return;
          }
          loadedQuestions = await getQuestionsForWeek(parseInt(week));
          break;
        case 'full':
          loadedQuestions = await getAllQuestions();
          break;
        case 'bookmark':
          loadedQuestions = await getBookmarkedQuestions();
          break;
        case 'smart':
          loadedQuestions = await getSmartBoostQuestions(10);
          break;
        case 'custom':
          // Custom mode would require more parameters, redirecting to home for now
          navigate('/');
          return;
      }
      
      // Shuffle questions
      const shuffled = shuffleArray(loadedQuestions);
      setQuestions(shuffled);
      
      setLoading(false);
    };
    
    loadQuestions();
  }, [mode, week, navigate]);
  
  const handleAnswer = (answer: Answer) => {
    setAnswers([...answers, answer]);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // End of quiz
      finishQuiz();
    }
  };
  
  const finishQuiz = () => {
    // Create attempt object
    const attempt: QuizAttempt = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      mode,
      week: week ? parseInt(week) : undefined,
      answers: [...answers], // Make a copy
      score: answers.filter(a => a.correct).length,
      totalQuestions: questions.length
    };
    
    // Save attempt
    saveQuizAttempt(attempt);
    
    // Show results
    setShowResults(true);
  };
  
  const handleRetryIncorrect = () => {
    // Get IDs of incorrectly answered questions
    const incorrectIds = answers
      .filter(a => !a.correct)
      .map(a => a.questionId);
    
    // Filter questions
    const incorrectQuestions = questions.filter(q => incorrectIds.includes(q.id));
    
    // Reset state with incorrect questions
    setQuestions(incorrectQuestions);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResults(false);
  };
  
  const handleReviewQuiz = () => {
    setReviewMode(true);
    setShowResults(false);
    setCurrentQuestionIndex(0);
  };
  
  const handleBackToResults = () => {
    setReviewMode(false);
    setShowResults(true);
  };
  
  const navigateReview = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const getQuizTitle = () => {
    switch(mode) {
      case 'weekly':
        return `Week ${week} Quiz`;
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
  };
  
  if (loading) {
    return (
      <PageLayout hideNav>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4">Loading questions...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (questions.length === 0) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-xl font-semibold mb-4">No questions found</h2>
          <p className="text-muted-foreground mb-6">
            There are no questions available for this selection.
          </p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </PageLayout>
    );
  }
  
  if (showResults) {
    return (
      <PageLayout hideNav>
        <QuizResults 
          questions={questions} 
          answers={answers}
          onRetryIncorrect={handleRetryIncorrect}
        />
      </PageLayout>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (reviewMode ? 0 : 1)) / questions.length) * 100;
  const userAnswer = reviewMode 
    ? answers.find(a => a.questionId === currentQuestion.id)?.selectedOptionIndex 
    : undefined;
  
  return (
    <PageLayout hideNav>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={reviewMode ? handleBackToResults : () => navigate('/')}
              className="p-0 h-auto"
            >
              <ArrowLeft size={20} className="mr-1" />
              {reviewMode ? 'Back to Results' : 'Exit Quiz'}
            </Button>
            <div className="font-medium">{getQuizTitle()}</div>
            <div className="text-sm">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
        
        <QuizCard 
          question={currentQuestion} 
          onAnswer={handleAnswer}
          showExplanation={reviewMode}
          userAnswer={userAnswer}
        />
        
        {reviewMode && (
          <div className="flex justify-between mt-4">
            <Button 
              onClick={() => navigateReview('prev')} 
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>
            <Button 
              onClick={() => navigateReview('next')} 
              disabled={currentQuestionIndex === questions.length - 1}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Quiz;
