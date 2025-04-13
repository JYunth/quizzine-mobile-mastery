import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuestions } from "@/hooks/useQuestions"; // Import useQuestions
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomQuiz, Question } from "@/types";
import {
  getAllQuestions, // Keep storage function
  saveCustomQuiz,
  getCustomQuizById,
  updateCustomQuiz,
  getCurrentCourseId
} from "@/lib/storage";
import { X, Filter, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

export const CreateQuiz = (): JSX.Element => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId?: string }>();
  const isEditMode = Boolean(quizId);
  const queryClient = useQueryClient();
  const currentCourseId = getCurrentCourseId(); // Get current course for query key

  // Local state for form and UI
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [quizName, setQuizName] = useState("");
  const [filterWeek, setFilterWeek] = useState<number | null>(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch base question data
  const {
    data: questionData,
    isLoading: isLoadingBase,
    isError: isErrorBase,
  } = useQuestions();

  // Fetch questions filtered for the current course (dependent query)
  const { data: courseQuestions, isLoading: isLoadingCourseQuestions, isError: isErrorCourseQuestions } = useQuery<Question[]>({
    queryKey: ['courseQuestions', currentCourseId, questionData?.allQuestions], // Key depends on base data
    queryFn: () => {
      if (!questionData?.allQuestions) return []; // Guard
      return getAllQuestions(questionData.allQuestions); // Pass base data
    },
    enabled: !!questionData?.allQuestions, // Enable when base data is ready
    staleTime: 1000 * 60 * 5,
  });
  const safeCourseQuestions = courseQuestions ?? []; // Use empty array if undefined

  // Fetch existing quiz data if in edit mode
  const { data: existingQuiz, isLoading: isLoadingExistingQuiz, isError: isErrorExistingQuiz } = useQuery<CustomQuiz | undefined>({
    queryKey: ['customQuiz', quizId],
    queryFn: () => getCustomQuizById(quizId!), // Pass quizId to the function
    enabled: isEditMode && !!quizId, // Only run if in edit mode and quizId exists
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  // Effect to populate form when editing an existing quiz
  useEffect(() => {
    if (isEditMode && existingQuiz) {
      setQuizName(existingQuiz.name);
      setSelectedQuestions(existingQuiz.questionIds);
      // Optionally set filterWeek based on loaded questions if needed
      // const firstQuestionWeek = questions.find(q => q.id === existingQuiz.questionIds[0])?.week;
      // setFilterWeek(firstQuestionWeek ?? 1);
    } else if (!isEditMode) {
      // Reset form for create mode
      setQuizName("");
      setSelectedQuestions([]);
      setFilterWeek(1);
    }
  }, [isEditMode, existingQuiz, safeCourseQuestions]); // Use safeCourseQuestions

  // Memoize filtered questions based on local state and fetched questions
  const filteredQuestions = useMemo(() => {
    if (isLoadingBase || isLoadingCourseQuestions || !safeCourseQuestions) return []; // Guard
    let filtered = [...safeCourseQuestions];
    if (filterWeek !== null) {
      filtered = filtered.filter(q => q.week === filterWeek);
    }
    return filtered;
  }, [filterWeek, safeCourseQuestions, isLoadingBase, isLoadingCourseQuestions]); // Update dependencies

  // Memoize unique weeks for filtering
  const weeks = useMemo(() => {
    if (isLoadingBase || isLoadingCourseQuestions || !safeCourseQuestions) return []; // Guard
    return [...new Set(safeCourseQuestions.map(q => q.week))].sort((a, b) => a - b);
  }, [safeCourseQuestions, isLoadingBase, isLoadingCourseQuestions]); // Update dependencies

  // Mutations for saving/updating
  const createMutation = useMutation({
    mutationFn: saveCustomQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customQuizzes'] });
      toast.success("Custom quiz created successfully");
      navigate('/custom-quizzes');
    },
    onError: (error) => {
      console.error("Failed to create custom quiz:", error);
      toast.error("Failed to create quiz. Please try again.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateCustomQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customQuizzes'] });
      queryClient.invalidateQueries({ queryKey: ['customQuiz', quizId] }); // Invalidate specific quiz too
      toast.success("Custom quiz updated successfully");
      navigate('/custom-quizzes');
    },
    onError: (error) => {
      console.error("Failed to update custom quiz:", error);
      toast.error("Failed to update quiz. Please try again.");
    }
  });

  const handleSelectQuestion = (questionId: string): void => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  // Renamed handler to be more generic
  const handleSubmit = (): void => {
    const trimmedName = quizName.trim();
    if (!trimmedName) {
      toast.error("Please enter a quiz name");
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    const quizData: CustomQuiz = {
      id: isEditMode && quizId ? quizId : Date.now().toString(), // Use existing or new ID
      name: trimmedName,
      timestamp: new Date().toISOString(),
      questionIds: selectedQuestions,
    };

    if (isEditMode) {
      updateMutation.mutate(quizData);
    } else {
      createMutation.mutate(quizData);
    }
  };

  // Dynamic page title
  const pageTitle = isEditMode ? "Edit Custom Quiz" : "Create Custom Quiz";
  // Combine all loading and error states
  const isLoading = isLoadingBase || isLoadingCourseQuestions || (isEditMode && isLoadingExistingQuiz);
  const isMutating = createMutation.isPending || updateMutation.isPending;
  const hasError = isErrorBase || isErrorCourseQuestions || (isEditMode && isErrorExistingQuiz);

  return (
    <PageLayout title={pageTitle}>
      <div className="max-w-4xl mx-auto pb-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} // Use navigate(-1) for generic back
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6 bg-card p-6 rounded-lg shadow">
          <div>
            <Label htmlFor="quiz-name" className="text-lg font-semibold">Quiz Name</Label>
            <Input
              id="quiz-name"
              value={quizName}
              onChange={e => setQuizName(e.target.value)}
              placeholder="Enter a descriptive name for your quiz"
              className="mt-2"
            />
          </div>
          
          {/* Selected Questions Counter & Filter Toggle */}
          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-sm font-medium">
              Selected: {selectedQuestions.length} questions
            </span>
            <Button
              size="sm"
              className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-400"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
          
          {/* Filters Section */}
          {showFilters && (
            <div className="space-y-4 border rounded-md p-4 bg-muted/30">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-base">Filter Questions</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowFilters(false)}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Remove Course Filter UI Block */}
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Week</Label>
                <div className="flex flex-wrap gap-2">
                  {/* Remove "All Weeks" button */}
                  {/* Render weeks only if not loading/error */}
                  {!isLoading && !hasError && weeks.map(week => (
                    <Button
                      key={week} // Assuming week is number
                      variant={filterWeek === week ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setFilterWeek(week)}
                    >
                      Week {week}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Selected Questions Preview */}
          {selectedQuestions.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <Label className="text-sm font-medium">Selected Questions ({selectedQuestions.length})</Label>
              <div className="max-h-[25vh] overflow-y-auto space-y-2 border rounded-md p-3 bg-background">
                {selectedQuestions.map(id => {
                  {/* Use safeCourseQuestions */}
                  const question = safeCourseQuestions.find(q => q.id === id);
                  return (
                    <div key={id} className="grid grid-cols-[1fr_auto] gap-2 items-center p-2 rounded-md border text-sm bg-muted/20">
                      <p className="truncate min-w-0">
                        {question ? `${question.question.substring(0, 60)}...` : 'Loading...'}
                        {question && <span className="text-xs text-muted-foreground ml-2">({question.courseId} W{question.week})</span>}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleSelectQuestion(id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Available Questions List */}
          <div className="border-t pt-4">
            <Label className="mb-2 block text-base font-semibold">Available Questions</Label>
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-start space-x-3 border p-3 rounded-md">
                    <Skeleton className="h-5 w-5 mt-1" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hasError ? (
               <p className="text-destructive text-center py-6">Error loading questions. Please try again later.</p>
            // Removed misplaced </div> from here
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto border rounded-md p-3 bg-background">
                {filteredQuestions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    No questions match your current filters. Try adjusting the filters above.
                  </p>
                ) : (
                  filteredQuestions.map(question => (
                    <div 
                      key={question.id} 
                      className="flex items-start space-x-3 border p-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox 
                        id={question.id}
                        checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={() => handleSelectQuestion(question.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={question.id} 
                          className="text-sm font-normal cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1 font-medium">
                              {question.courseId} - Week {question.week}
                            </span>
                            <span className="text-sm leading-snug">
                              {question.question}
                            </span>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Submit Button (Text changes based on mode) */}
          <div className="flex justify-end pt-6 border-t">
            <Button 
              onClick={handleSubmit}
              disabled={selectedQuestions.length === 0 || !quizName.trim() || isLoading || isMutating || hasError}
              size="lg"
            >
              {isMutating ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? "Update Quiz" : "Create Quiz")} ({selectedQuestions.length} questions)
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

// No default export needed, using named export above
