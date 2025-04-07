
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";

interface QuizEmptyProps {
  createAction?: () => void;
}

const QuizEmpty: React.FC<QuizEmptyProps> = ({ createAction }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isCustomQuizRoute = location.pathname.includes('custom-quizzes');
  
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <h2 className="text-xl font-semibold mb-4">
        {isCustomQuizRoute ? "No custom quizzes yet" : "No questions found"}
      </h2>
      <p className="text-muted-foreground mb-6 text-center px-4">
        {isCustomQuizRoute 
          ? "Create your first custom quiz by selecting questions from the quiz bank"
          : "There are no questions available for this selection."
        }
      </p>
      {isCustomQuizRoute && createAction ? (
        <Button onClick={createAction}>
          <Plus className="mr-2 h-4 w-4" />
          Create Quiz
        </Button>
      ) : (
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      )}
    </div>
  );
};

export default QuizEmpty;
