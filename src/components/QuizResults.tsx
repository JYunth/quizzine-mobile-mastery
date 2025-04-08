
import { Question, Answer } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, ArrowLeft, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuizResultsProps {
  questions: Question[];
  answers: Answer[];
  onRetryIncorrect?: () => void;
  onReviewQuiz?: () => void;
}

const QuizResults = ({ questions, answers, onRetryIncorrect, onReviewQuiz }: QuizResultsProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("summary");
  
  const score = answers.filter(a => a.correct).length;
  const percentage = Math.round((score / questions.length) * 100);
  const incorrectCount = questions.length - score;
  
  // Average time in seconds
  const averageTime = Math.round(
    answers.reduce((sum, a) => sum + a.timeTaken, 0) / 
    answers.length / 
    1000
  );
  
  const getGradeText = () => {
    if (percentage >= 90) return "Excellent!";
    if (percentage >= 80) return "Great job!";
    if (percentage >= 70) return "Good work!";
    if (percentage >= 60) return "Not bad!";
    return "Keep practicing!";
  };
  
  const getQuestionText = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    return question ? question.question : "";
  };
  
  const getCorrectAnswer = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    return question ? question.options[question.correctIndex] : "";
  };
  
  const getUserAnswer = (answer: Answer) => {
    // Directly return the stored text of the user's selected option
    return answer.selectedOptionText || ""; // Fallback to empty string if somehow missing
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* New Header Section */}
      <div className="flex items-center justify-between mb-4">
        {/* Left-aligned Icon Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="h-10 w-10" // Ensure consistent size
        >
          <ArrowLeft size={20} />
          <span className="sr-only">Back to Home</span> 
        </Button>
        
        {/* Centered Title */}
        <div className="font-medium text-center flex-grow">Quiz Results</div>
        
        {/* Placeholder for right side to balance layout */}
        <div className="w-10"></div> 
      </div>
      
      <Card className="mb-6">
        {/* Removed CardHeader, title is now above */}
        <CardContent className="pt-6"> {/* Added padding-top to compensate for removed header */}
          <div className="text-center mb-4">
            <div className="text-4xl font-bold mb-1">{percentage}%</div>
            <div className="text-lg">{score} out of {questions.length} correct</div>
            <div className="text-muted-foreground mt-2">{getGradeText()}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-secondary rounded-md p-4 text-center">
              <div className="text-xl font-medium">{averageTime}s</div>
              <div className="text-sm text-muted-foreground">Avg. Time</div>
            </div>
            <div className="bg-secondary rounded-md p-4 text-center">
              <div className="text-xl font-medium">{incorrectCount}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <Button className="flex-1" onClick={() => navigate('/')}>
              Finish
            </Button>
            {incorrectCount > 0 && onRetryIncorrect && (
              <Button variant="outline" className="flex-1" onClick={onRetryIncorrect}>
                Retry Incorrect
              </Button>
            )}
            {onReviewQuiz && (
              <Button variant="outline" className="flex-1" onClick={onReviewQuiz}>
                Review Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Tabs 
        defaultValue="summary" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          {answers.map((answer, index) => (
            <Card key={answer.questionId} className="overflow-hidden">
              <div className={`h-1 ${answer.correct ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                    answer.correct 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  } flex-shrink-0 mt-0.5`}>
                    {answer.correct ? <Check size={14} /> : <X size={14} />}
                  </div>
                  <div>
                    <div className="text-sm mb-1 font-medium">
                      {index + 1}. {getQuestionText(answer.questionId)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Your answer: {getUserAnswer(answer)}
                    </div>
                    {!answer.correct && (
                      <div className="text-xs text-green-600 mt-1">
                        Correct answer: {getCorrectAnswer(answer.questionId)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Time taken: {Math.round(answer.timeTaken / 1000)}s
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizResults;
