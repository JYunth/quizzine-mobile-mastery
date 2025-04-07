
import { Answer, Question } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveConfidenceRating } from "@/lib/storage";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Link } from "react-router-dom";

interface QuizResultsProps {
  questions: Question[];
  answers: Answer[];
  onRetryIncorrect: () => void;
}

const QuizResults = ({ questions, answers, onRetryIncorrect }: QuizResultsProps) => {
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, number>>(
    Object.fromEntries(questions.map(q => [q.id, 3]))
  );
  
  // Calculate results
  const totalQuestions = questions.length;
  const correctAnswers = answers.filter(a => a.correct).length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  
  const handleConfidenceChange = (questionId: string, value: number[]) => {
    const newRatings = {
      ...confidenceRatings,
      [questionId]: value[0]
    };
    setConfidenceRatings(newRatings);
    saveConfidenceRating(questionId, value[0]);
  };
  
  // Group questions by correctness
  const incorrectQuestions = questions.filter(q => 
    answers.find(a => a.questionId === q.id && !a.correct)
  );
  
  // Show retry button only if there are incorrect answers
  const hasIncorrectAnswers = incorrectQuestions.length > 0;
  
  return (
    <div className="w-full px-4 max-w-xl mx-auto">
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center mb-4">Quiz Results</h2>
          
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2">{score}%</div>
            <p className="text-muted-foreground">
              You got {correctAnswers} out of {totalQuestions} questions correct
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{Math.round(
                answers.reduce((sum, a) => sum + a.timeTaken, 0) / 1000 / 60
              )}m</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 flex flex-col gap-3">
          {hasIncorrectAnswers && (
            <Button 
              onClick={onRetryIncorrect}
              className="w-full"
              variant="secondary"
            >
              Retry Incorrect Answers ({incorrectQuestions.length})
            </Button>
          )}
          <Link to="/" className="w-full">
            <Button className="w-full">Back to Home</Button>
          </Link>
        </CardFooter>
      </Card>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Rate Your Confidence</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This helps the app create personalized quizzes for you
        </p>
        
        {questions.map(question => {
          const answer = answers.find(a => a.questionId === question.id);
          const isCorrect = answer?.correct || false;
          const selectedOptionIndex = answer?.selectedOptionIndex || 0;
          
          return (
            <Card key={question.id} className="mb-3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                  <h4 className="font-medium text-sm truncate flex-1">
                    {question.question.length > 60 
                      ? question.question.substring(0, 60) + '...' 
                      : question.question}
                  </h4>
                </div>
                
                <div className="mt-3 mb-3 space-y-2">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium">Correct Option:</span>
                    <div className="p-2 text-sm rounded bg-green-100 dark:bg-green-900">
                      {question.options[question.correctIndex]}
                    </div>
                  </div>
                  
                  {!isCorrect && (
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-medium">Your Option:</span>
                      <div className="p-2 text-sm rounded bg-red-100 dark:bg-red-900">
                        {question.options[selectedOptionIndex]}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Low confidence</span>
                    <span>High confidence</span>
                  </div>
                  <Slider 
                    value={[confidenceRatings[question.id]]} 
                    min={1} 
                    max={5} 
                    step={1}
                    onValueChange={(value) => handleConfidenceChange(question.id, value)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuizResults;
