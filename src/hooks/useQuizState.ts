
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Answer, Question, QuizMode, Course } from "@/types";
import { useQuestions } from "@/hooks/useQuestions";
import { useStreak } from '@/hooks/useStreak'; // Import useStreak
import {
  getStorage,
  getAllQuestions, // Keep storage functions
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
  goToPreviousQuestion: () => void; // Add function to return type
} {
  // Local state for quiz progress and UI
  const [questions, setQuestions] = useState<Question[]>([]); // Holds the potentially shuffled questions for the current quiz instance
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [currentBookmarked, setCurrentBookmarked] = useState(false);
  const [displayQuestion, setDisplayQuestion] = useState<Question | null>(null);

  // Instantiate the streak hook
  const { recordActivity } = useStreak();
  const currentCourseId = getCurrentCourseId(); // Needed for query key consistency

  // Fetch base question data using the main hook
  const {
    data: questionData,
    isLoading: isLoadingBaseQuestions,
    isError: isErrorBaseQuestions,
    // We get courses, allQuestions, questionsById from here
  } = useQuestions();

  // Select/filter questions for the specific quiz mode using TanStack Query
  // This query now DEPENDS on the base data being loaded successfully.
  const { data: fetchedQuestions = [], isLoading: isLoadingFiltered, isError: isErrorFiltered } = useQuery<Question[]>({
    // Query key depends on base data and mode parameters
    queryKey: ['quizQuestionsFiltered', mode, week, id, currentCourseId, questionData],
    queryFn: () => { // No longer async, just filtering/selecting from existing data
      // Ensure base data is loaded before proceeding
      if (isLoadingBaseQuestions || isErrorBaseQuestions || !questionData) {
        // console.warn("Base question data not ready for filtering.");
        return []; // Return empty if base data isn't ready
      }

      // Pass the required data from questionData to the storage functions
      switch(mode) {
        case 'weekly':
          if (!week) throw new Error("Week parameter is required for weekly quiz mode.");
          return getQuestionsForWeek(parseInt(week), questionData.allQuestions);
        case 'full':
          return getAllQuestions(questionData.allQuestions); // Pass allQuestions
        case 'bookmark':
          return getBookmarkedQuestions(questionData.allQuestions); // Pass allQuestions
        case 'smart':
          return getSmartBoostQuestions(questionData.allQuestions); // Pass allQuestions
        case 'custom':
          if (!id) throw new Error("ID parameter is required for custom quiz mode.");
          return getQuestionsForCustomQuiz(id, questionData.questionsById); // Pass questionsById map
        default:
          console.warn(`Unknown quiz mode: ${mode}`);
          return [];
      }
    },
    // Enable this query only when base data is loaded and mode requirements are met
    enabled: !isLoadingBaseQuestions && !isErrorBaseQuestions && !!questionData && (
               (mode === 'weekly' && !!week) ||
               (mode === 'custom' && !!id) ||
               ['full', 'bookmark', 'smart'].includes(mode)
             ),
    staleTime: 1000 * 60 * 5, // Can have a longer staleTime as it depends on base data
    retry: false, // No need to retry filtering logic
  });

  // Effect to process fetched questions (e.g., shuffling for hard mode)
  useEffect(() => {
    // Consider both loading states now
    if (isLoadingBaseQuestions || isLoadingFiltered || isErrorBaseQuestions || isErrorFiltered) {
      setQuestions([]);
      return;
    }
    
    const { settings } = getStorage();
    let processedQuestions = fetchedQuestions;

    if (settings.hardMode) {
      // Shuffle question order *and* shuffle options within each question ONCE
      processedQuestions = shuffleArray(fetchedQuestions).map(q => {
        const originalCorrectOption = q.options[q.correctIndex];
        const shuffledOptions = shuffleArray([...q.options]);
        const newCorrectIndex = shuffledOptions.indexOf(originalCorrectOption);
        return {
          ...q,
          options: shuffledOptions,
          correctIndex: newCorrectIndex, // Store the shuffled state
        };
      });
    }
    // If not hard mode, options remain unshuffled

    setQuestions(processedQuestions); // Set the final list (shuffled order and/or shuffled options)
    // Reset quiz state when questions change (e.g., mode switch)
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResults(false);
    setReviewMode(false);

  }, [fetchedQuestions, isLoadingBaseQuestions, isLoadingFiltered, isErrorBaseQuestions, isErrorFiltered]); // Update dependencies
  
  // Effect to set the question for display using the pre-processed (potentially shuffled) state
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      // Directly use the question from the state, which already has shuffled options if hardMode was enabled
      const currentQuestion = questions[currentQuestionIndex];
      setDisplayQuestion(currentQuestion);
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

    // Record the activity for streak calculation *after* processing the answer
    recordActivity();

    // Check if an answer for this question already exists
    const existingAnswerIndex = answers.findIndex(a => a.questionId === finalAnswer.questionId);
    let updatedAnswers;

    if (existingAnswerIndex > -1) {
      // Update existing answer
      updatedAnswers = answers.map((ans, index) =>
        index === existingAnswerIndex ? finalAnswer : ans
      );
    } else {
      // Append new answer
      updatedAnswers = [...answers, finalAnswer];
    }

    setAnswers(updatedAnswers); // Set the updated state
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Pass the complete, updated list of answers to finishQuiz
      finishQuiz(updatedAnswers);
    }
  };
  
  // Accept the final, complete list of answers
  const finishQuiz = (finalAnswersList: Answer[]): void => {
    // Now directly use the passed list which is guaranteed to be correct
    
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

  // Function to navigate to the previous question during the quiz
  const goToPreviousQuestion = (): void => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  return {
    loading: isLoadingBaseQuestions || isLoadingFiltered, // Combine loading states
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
    navigateReview,
    goToPreviousQuestion // Expose the new function
  };
}
