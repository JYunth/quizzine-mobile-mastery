
import { useParams, useLocation } from "react-router-dom"; // Import useLocation
import PageLayout from "@/components/PageLayout";
import QuizResults from "@/components/QuizResults";
import { useQuizState } from "@/hooks/useQuizState";
import { QuizMode } from "@/types";
import QuizLoading from "@/components/QuizLoading";
import QuizEmpty from "@/components/QuizEmpty";
import QuizInProgress from "@/components/QuizInProgress";
import { getQuizTitle } from "@/lib/quizUtils";

const Quiz = () => {
  // Get raw params and location
  const params = useParams<{ mode?: QuizMode; week?: string; id?: string }>();
  const location = useLocation();

  // Determine correct mode, week, and id based on path
  let mode: QuizMode = 'weekly'; // Default mode
  let week: string | undefined = undefined;
  let id: string | undefined = undefined;

  if (location.pathname.startsWith('/quiz/weekly/')) {
    mode = 'weekly';
    week = params.week || location.pathname.split('/').pop(); // Prioritize param, fallback to path segment
    id = undefined; // Ensure id is undefined for weekly route
  } else if (params.mode) {
    // For other routes like /quiz/:mode or /quiz/:mode/:id
    mode = params.mode;
    week = params.week; // Might be undefined
    id = params.id;     // Might be undefined
  }

  const {
    loading,
    questions,
    currentQuestionIndex,
    answers,
    showResults,
    reviewMode,
    currentBookmarked,
    setCurrentBookmarked,
    displayQuestion, // Destructure displayQuestion
    handleAnswer,
    handleRetryIncorrect,
    handleReviewQuiz,
    handleBackToResults,
    navigateReview
  } = useQuizState({ mode, week, id });
  
  if (loading) {
    return (
      <PageLayout hideNav>
        <QuizLoading />
      </PageLayout>
    );
  }
  
  if (questions.length === 0) {
    return (
      <PageLayout>
        <QuizEmpty />
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
          onReviewQuiz={handleReviewQuiz}
        />
      </PageLayout>
    );
  }
  
  // Use displayQuestion instead of questions[currentQuestionIndex]
  // Add a check to ensure displayQuestion is not null
  if (!displayQuestion) {
    // This might happen briefly during loading or if there's an error
    return (
      <PageLayout hideNav>
        <QuizLoading /> 
      </PageLayout>
    );
  }

  const quizTitle = getQuizTitle(mode, questions, week);
  const userAnswer = reviewMode 
    ? answers.find(a => a.questionId === displayQuestion.id)?.selectedOptionIndex 
    : undefined;
  
  return (
    <PageLayout hideNav>
      <QuizInProgress
        title={quizTitle}
        currentQuestion={displayQuestion} // Pass displayQuestion here
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        isBookmarked={currentBookmarked}
        reviewMode={reviewMode}
        userAnswer={userAnswer}
        onBookmarkChange={setCurrentBookmarked}
        onAnswer={handleAnswer}
        onBackToResults={handleBackToResults}
        onNavigateReview={navigateReview}
      />
    </PageLayout>
  );
};

export default Quiz;
