
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { getCustomQuizzes, deleteCustomQuiz } from "@/lib/storage";
import { CustomQuiz } from "@/types";
import { Plus } from "lucide-react";
import { CustomQuizItem } from "@/components/CustomQuizItem";
import { toast } from "sonner";
import { QuizEmpty } from "@/components/QuizEmpty";
import { QuizLoading } from "@/components/QuizLoading";

export const CustomQuizzes = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch custom quizzes using TanStack Query
  const { data: quizzes = [], isLoading, isError } = useQuery<CustomQuiz[]>({
    queryKey: ['customQuizzes'],
    queryFn: getCustomQuizzes, // This function reads directly from localStorage
    staleTime: 1000 * 60, // Cache for 1 minute, refetch on focus etc.
  });

  // Mutation for deleting a custom quiz
  const { mutate: deleteQuizMutation } = useMutation({
    mutationFn: deleteCustomQuiz,
    onSuccess: (_, quizId) => {
      // Invalidate the query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['customQuizzes'] });
      toast("Custom quiz deleted");
      // Optional: Optimistic update
      // queryClient.setQueryData(['customQuizzes'], (oldData: CustomQuiz[] | undefined) => {
      //   return oldData ? oldData.filter(q => q.id !== quizId) : [];
      // });
    },
    onError: (error, quizId) => {
      console.error(`Failed to delete custom quiz ${quizId}:`, error);
      toast.error("Failed to delete custom quiz. Please try again.");
      // Invalidate to ensure consistency if optimistic update was used
      queryClient.invalidateQueries({ queryKey: ['customQuizzes'] });
    },
  });

  const handleDeleteQuiz = (id: string): void => {
    deleteQuizMutation(id);
  };

  if (isLoading) {
    return (
      <PageLayout title="Custom Quizzes">
        <QuizLoading message="Loading your custom quizzes..." />
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout title="Custom Quizzes">
        <p className="text-destructive text-center py-4">Error loading custom quizzes. Please try again later.</p>
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
