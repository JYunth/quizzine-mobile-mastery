
import { useState, useEffect } from "react";
import { Answer, Question, QuizMode } from "@/types";
import { 
  getAllQuestions,
  getBookmarkedQuestions,
  getQuestionsForWeek,
  getSmartBoostQuestions,
  getCurrentCourseId,
  getQuestionsForCustomQuiz,
  shuffleArray,
  isBookmarked
} from "@/lib/storage";

interface UseQuizStateProps {
  mode: QuizMode;
  week?: string;
  id?: string;
}

export function useQuizState({ mode, week, id }: UseQuizStateProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [currentBookmarked, setCurrentBookmarked] = useState(false);
  
  // Load questions based on the mode
  useEffect(() => {
    const loadQuestions = async () => {
      // console.log(`useQuizState Effect: mode=${mode}, week=${week}, id=${id}`); // Removed log
      setLoading(true);
      
      let loadedQuestions: Question[] = [];
      
      try { // Add try block
        switch(mode) {
        case 'weekly':
          if (!week) return;
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
            if (!id) {
              // console.warn("useQuizState: Custom mode but no ID provided."); // Removed log
              setQuestions([]); // Ensure state is cleared
              setLoading(false); // Ensure loading stops
              return; 
            }
            // console.log(`useQuizState: Loading custom quiz with ID: ${id}`); // Removed log
            loadedQuestions = await getQuestionsForCustomQuiz(id);
            // console.log(`useQuizState: Loaded ${loadedQuestions.length} questions for custom quiz ${id}`); // Removed log
            break;
        }
        
        // console.log("useQuizState: Shuffling questions..."); // Removed log
        const shuffled = shuffleArray(loadedQuestions);
        setQuestions(shuffled);
        
        // console.log("useQuizState: Setting loading to false."); // Removed log
        setLoading(false);
      } catch (error) {
        console.error("useQuizState: Error loading questions:", error); // Keep error log
        setQuestions([]); // Clear questions on error
        setLoading(false); // Ensure loading is set to false even on error
      }
    };
    
    loadQuestions();
  }, [mode, week, id]); // Dependencies remain the same
  
  // Update bookmark status when currentQuestionIndex changes
  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      setCurrentBookmarked(isBookmarked(currentQuestion.id));
    }
  }, [currentQuestionIndex, questions]);
  
  const handleAnswer = (answer: Answer) => {
    setAnswers([...answers, answer]);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };
  
  const finishQuiz = () => {
    const attempt = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      mode,
      courseId: getCurrentCourseId(),
      week: week ? parseInt(week) : undefined,
      answers: [...answers],
      score: answers.filter(a => a.correct).length,
      totalQuestions: questions.length
    };
    
    import("@/lib/storage").then(({ saveQuizAttempt }) => {
      saveQuizAttempt(attempt);
    });
    
    setShowResults(true);
  };
  
  const handleRetryIncorrect = () => {
    const incorrectIds = answers
      .filter(a => !a.correct)
      .map(a => a.questionId);
    
    const incorrectQuestions = questions.filter(q => incorrectIds.includes(q.id));
    
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
  
  return {
    loading,
    questions,
    currentQuestionIndex,
    answers,
    showResults,
    reviewMode,
    currentBookmarked,
    setCurrentBookmarked,
    handleAnswer,
    handleRetryIncorrect,
    handleReviewQuiz,
    handleBackToResults,
    navigateReview
  };
}
