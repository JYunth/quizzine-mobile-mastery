
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { getCustomQuizzes, deleteCustomQuiz } from "@/lib/storage";
import { CustomQuiz } from "@/types";
import { Plus } from "lucide-react";
// Remove CustomQuizDrawer import
import { CustomQuizItem } from "@/components/CustomQuizItem";
import { toast } from "sonner";
import { QuizEmpty } from "@/components/QuizEmpty";
import { QuizLoading } from "@/components/QuizLoading";

export const CustomQuizzes = (): JSX.Element => {
  const navigate = useNavigate(); // Get navigate function
  const [quizzes, setQuizzes] = useState<CustomQuiz[]>([]);
  // Remove createDrawerOpen state
  const [loading, setLoading] = useState(true);

  const loadQuizzes = (): void => {
    setLoading(true);
    try {
      const customQuizzes = getCustomQuizzes();
      setQuizzes(customQuizzes);
    } catch (error) {
      console.error("Failed to load custom quizzes:", error);
      toast("Failed to load custom quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleDeleteQuiz = (id: string): void => {
    deleteCustomQuiz(id);
    setQuizzes(quizzes.filter(quiz => quiz.id !== id));
    toast("Custom quiz deleted");
  };

  if (loading) {
    return (
      <PageLayout title="Custom Quizzes">
        <QuizLoading />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Custom Quizzes">
      <div className="max-w-4xl mx-auto pb-16">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Custom Quizzes</h2>
          {/* Update button onClick to navigate */}
          <Button onClick={() => navigate('/create-quiz')}> 
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>

        {quizzes.length === 0 ? (
          <QuizEmpty />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map(quiz => (
              <CustomQuizItem 
                key={quiz.id}
                quiz={quiz}
                onDelete={handleDeleteQuiz}
              />
            ))}
          </div>
        )}

        {/* Remove CustomQuizDrawer usage */}
      </div>
    </PageLayout>
  );
};

// No default export needed, using named export above
