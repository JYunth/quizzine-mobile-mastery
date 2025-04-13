
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { Answer, Question, QuizMode } from "@/types";
import {
  getStorage,
  getAllQuestions,
  getBookmarkedQuestions,
  getQuestionsForWeek,
  getSmartBoostQuestions,
  getCurrentCourseId,
  getQuestionsForCustomQuiz,
  shuffleArray,
  isBookmarked,
  saveConfidenceRating
} from "@/lib/storage";

interface UseQuizStateProps {
  mode: QuizMode;
  week?: string;
  id?: string;
}

export function useQuizState({ mode, week, id }: UseQuizStateProps): {
  loading: boolean;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  showResults: boolean;
  reviewMode: boolean;
  currentBookmarked: boolean;
  setCurrentBookmarked: React.Dispatch<React.SetStateAction<boolean>>;
  displayQuestion: Question | null;
  handleAnswer: (rawAnswer: Omit<Answer, 'correct' | 'questionId' | 'selectedOptionText'>) => void;
  handleRetryIncorrect: () => void;
  handleReviewQuiz: () => void;
  handleBackToResults: () => void;
  navigateReview: (direction: 'next' | 'prev') => void;
} {
  // Local state for quiz progress and UI
  const [questions, setQuestions] = useState<Question[]>([]); // Holds the potentially shuffled questions for the current quiz instance
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [currentBookmarked, setCurrentBookmarked] = useState(false);
  const [displayQuestion, setDisplayQuestion] = useState<Question | null>(null); // State for current question with potentially shuffled options
  
  const currentCourseId = getCurrentCourseId(); // Needed for query key consistency

  // Fetch questions using TanStack Query based on mode, week, id
  const { data: fetchedQuestions = [], isLoading, isError } = useQuery<Question[]>({
    queryKey: ['quizQuestions', mode, week, id, currentCourseId], // Dynamic query key
    queryFn: async () => {
      switch(mode) {
        case 'weekly':
          if (!week) throw new Error("Week parameter is required for weekly quiz mode.");
          return getQuestionsForWeek(parseInt(week));
        case 'full':
          return getAllQuestions(); // Gets questions for the current course
        case 'bookmark':
          return getBookmarkedQuestions();
        case 'smart':
          return getSmartBoostQuestions();
        case 'custom':
          if (!id) throw new Error("ID parameter is required for custom quiz mode.");
          return getQuestionsForCustomQuiz(id);
        default:
          console.warn(`Unknown quiz mode: ${mode}`);
          return []; // Return empty for unknown modes
      }
    },
    enabled: (mode === 'weekly' && !!week) || (mode === 'custom' && !!id) || ['full', 'bookmark', 'smart'].includes(mode), // Enable based on mode requirements
    staleTime: 1000 * 60, // Cache for 1 minute
    retry: 1, // Retry once on error
  });

  // Effect to process fetched questions (e.g., shuffling for hard mode)
  useEffect(() => {
    if (isLoading || isError) {
      setQuestions([]); // Clear local questions if loading or error
      return;
    }
    
    const { settings } = getStorage();
    if (settings.hardMode) {
      setQuestions(shuffleArray(fetchedQuestions));
    } else {
      setQuestions(fetchedQuestions);
    }
    // Reset quiz state when questions change (e.g., mode switch)
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResults(false);
    setReviewMode(false);

  }, [fetchedQuestions, isLoading, isError]); // Depend on fetched data and loading/error state
  
  // Effect to prepare the question for display (shuffle options if hard mode is on)
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      const { settings } = getStorage(); // Get current settings

      if (settings.hardMode) {
        const originalCorrectOption = currentQuestion.options[currentQuestion.correctIndex];
        // Shuffle a copy of the options array
        const shuffledOptions = shuffleArray([...currentQuestion.options]); 
        const newCorrectIndex = shuffledOptions.indexOf(originalCorrectOption);
        
        setDisplayQuestion({
          ...currentQuestion,
          options: shuffledOptions,
          correctIndex: newCorrectIndex, // Use the new correct index for display and checking
        });
      } else {
        setDisplayQuestion(currentQuestion); // Use original question if not hard mode
      }
    } else {
      setDisplayQuestion(null); // Clear if no questions or index out of bounds
    }
  }, [currentQuestionIndex, questions]); // Re-run when question or index changes

  // Update bookmark status based on displayQuestion
  useEffect(() => {
    if (displayQuestion) {
      setCurrentBookmarked(isBookmarked(displayQuestion.id));
    } else {
      setCurrentBookmarked(false);
    }
  }, [displayQuestion]); // Update when displayQuestion changes
  
  const handleAnswer = (rawAnswer: Omit<Answer, 'correct' | 'questionId' | 'selectedOptionText'>): void => {
    if (!displayQuestion) return; // Guard if no question is displayed

    // Check correctness against the potentially adjusted correctIndex in displayQuestion
    const correct = rawAnswer.selectedOptionIndex === displayQuestion.correctIndex;
    // Get the text of the option the user actually selected from the potentially shuffled options
    const selectedText = displayQuestion.options[rawAnswer.selectedOptionIndex];

    const finalAnswer: Answer = {
      ...rawAnswer,
      questionId: displayQuestion.id, // Use ID from the displayed question
      selectedOptionText: selectedText, // Store the selected text
      correct: correct,
    };

    // --- Confidence Rating Calculation ---
    const storage = getStorage();
    const currentRating = storage.confidenceRatings[displayQuestion.id] ?? 3; // Default to 3 if undefined
    let newRating = currentRating;

    if (correct) {
      newRating = Math.min(currentRating + 1, 5); // Increase, max 5
    } else {
      newRating = Math.max(currentRating - 1, 0); // Decrease, min 0
    }

    // Save the updated rating (no need to await, it's synchronous localStorage)
    saveConfidenceRating(displayQuestion.id, newRating);
    // --- End Confidence Rating Calculation ---

    setAnswers([...answers, finalAnswer]); // Add the processed answer
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Pass the final answer to finishQuiz when it's the last question
      finishQuiz(finalAnswer); 
    }
  };
  
  // Accept the last answer as a parameter
  const finishQuiz = (lastAnswer: Answer): void => {
    // Correctly construct the final list using the state *before* the last answer 
    // and the lastAnswer object passed in.
    const finalAnswersList = [...answers, lastAnswer]; 
    
    const attempt = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      mode,
      courseId: getCurrentCourseId(),
      week: week ? parseInt(week) : undefined,
      answers: finalAnswersList, // Use the correctly constructed list
      score: finalAnswersList.filter(a => a.correct).length, // Calculate score from the correct list
      totalQuestions: questions.length,
    };
    
    import("@/lib/storage").then(({ saveQuizAttempt }) => {
      saveQuizAttempt(attempt);
    });
    
    setShowResults(true);
  };
  
  const handleRetryIncorrect = (): void => {
    const incorrectIds = answers
      .filter(a => !a.correct)
      .map(a => a.questionId);
    
    const incorrectQuestions = questions.filter(q => incorrectIds.includes(q.id));
    
    setQuestions(incorrectQuestions);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResults(false);
  };
  
  const handleReviewQuiz = (): void => {
    setReviewMode(true);
    setShowResults(false);
    setCurrentQuestionIndex(0);
  };
  
  const handleBackToResults = (): void => {
    setReviewMode(false);
    setShowResults(true);
  };
  
  const navigateReview = (direction: 'next' | 'prev'): void => {
    if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  return {
    loading: isLoading, // Use isLoading from useQuery
    questions,
    currentQuestionIndex,
    answers,
    showResults,
    reviewMode,
    currentBookmarked,
    setCurrentBookmarked,
    displayQuestion, // Return the question prepared for display
    handleAnswer,
    handleRetryIncorrect,
    handleReviewQuiz,
    handleBackToResults,
    navigateReview
  };
}
