
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getCustomQuizzes, deleteCustomQuiz } from "@/lib/storage";
import { CustomQuiz } from "@/types";
import { Link } from "react-router-dom";
import { Trash2, CalendarDays, Plus } from "lucide-react";
import CustomQuizSheet from "@/components/CustomQuizSheet";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const CustomQuizzes = () => {
  const [quizzes, setQuizzes] = useState<CustomQuiz[]>([]);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  const loadQuizzes = () => {
    const customQuizzes = getCustomQuizzes();
    setQuizzes(customQuizzes);
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleDeleteQuiz = (id: string) => {
    deleteCustomQuiz(id);
    setQuizzes(quizzes.filter(quiz => quiz.id !== id));
    toast("Custom quiz deleted");
    setQuizToDelete(null);
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

        {quizzes.length === 0 ? (
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
              <Card key={quiz.id} className="flex flex-col h-full">
                <CardContent className="pt-6 flex-grow">
                  <h3 className="font-medium text-lg mb-2">{quiz.name}</h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    <span>
                      Created {formatDistanceToNow(new Date(quiz.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quiz.questionIds.length} questions
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <AlertDialog open={quizToDelete === quiz.id} onOpenChange={(isOpen) => {
                    if (!isOpen) setQuizToDelete(null);
                  }}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setQuizToDelete(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Custom Quiz</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this custom quiz? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Link to={`/quiz/custom/${quiz.id}`}>
                    <Button>Start Quiz</Button>
                  </Link>
                </CardFooter>
              </Card>
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
