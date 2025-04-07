
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const QuizEmpty: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <h2 className="text-xl font-semibold mb-4">No questions found</h2>
      <p className="text-muted-foreground mb-6">
        There are no questions available for this selection.
      </p>
      <Button onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  );
};

export default QuizEmpty;
