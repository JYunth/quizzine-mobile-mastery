
import { useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import QuizResults from "@/components/QuizResults";
import { useQuizState } from "@/hooks/useQuizState";
import { QuizMode } from "@/types";
import QuizLoading from "@/components/QuizLoading";
import QuizEmpty from "@/components/QuizEmpty";
import QuizInProgress from "@/components/QuizInProgress";
import { getQuizTitle } from "@/lib/quizUtils";

const Quiz = () => {
  const { mode = 'weekly', week, id } = useParams<{ mode: QuizMode; week?: string; id?: string }>();
  
  const {
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
  
  const currentQuestion = questions[currentQuestionIndex];
  const quizTitle = getQuizTitle(mode, questions, week);
  const userAnswer = reviewMode 
    ? answers.find(a => a.questionId === currentQuestion.id)?.selectedOptionIndex 
    : undefined;
  
  return (
    <PageLayout hideNav>
      <QuizInProgress
        title={quizTitle}
        currentQuestion={currentQuestion}
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
