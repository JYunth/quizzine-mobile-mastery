
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { getCustomQuizzes, deleteCustomQuiz } from "@/lib/storage";
import { CustomQuiz } from "@/types";
import { Plus } from "lucide-react";
import CustomQuizSheet from "@/components/CustomQuizSheet";
import CustomQuizItem from "@/components/CustomQuizItem";
import { toast } from "sonner";

const CustomQuizzes = () => {
  const [quizzes, setQuizzes] = useState<CustomQuiz[]>([]);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadQuizzes = () => {
    setLoading(true);
    const customQuizzes = getCustomQuizzes();
    setQuizzes(customQuizzes);
    setLoading(false);
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleDeleteQuiz = (id: string) => {
    deleteCustomQuiz(id);
    setQuizzes(quizzes.filter(quiz => quiz.id !== id));
    toast("Custom quiz deleted");
  };

  return (
    <PageLayout title="Custom Quizzes">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Custom Quizzes</h2>
          <Button onClick={() => setCreateSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4">Loading custom quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="font-medium mb-2">No custom quizzes yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first custom quiz by selecting questions from the quiz bank
            </p>
            <Button onClick={() => setCreateSheetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </div>
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

        <CustomQuizSheet 
          open={createSheetOpen} 
          onOpenChange={setCreateSheetOpen} 
          onQuizCreated={loadQuizzes}
        />
      </div>
    </PageLayout>
  );
};

export default CustomQuizzes;
