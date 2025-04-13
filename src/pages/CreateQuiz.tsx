import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomQuiz, Question } from "@/types";
// Import necessary storage functions
import { 
  getAllQuestions, 
  saveCustomQuiz, 
  getCustomQuizById, 
  updateCustomQuiz 
} from "@/lib/storage"; 
import { X, Filter, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const CreateQuiz = (): JSX.Element => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId?: string }>(); // Get quizId from URL params
  const isEditMode = Boolean(quizId); // Determine if in edit mode

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [quizName, setQuizName] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Track initial data load
  const [filterWeek, setFilterWeek] = useState<number | null>(1); // Default filterWeek to 1
  const [showFilters, setShowFilters] = useState(false);

  // Load questions and potentially existing quiz data
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setLoading(true);
      setInitialLoadComplete(false); // Reset load completion flag
      try {
        // Always load available questions for the current course
        const courseQuestions = await getAllQuestions();
        setQuestions(courseQuestions);
        setFilteredQuestions(courseQuestions); // Apply default filter later

        // If in edit mode, load the existing quiz data
        if (isEditMode && quizId) {
          const existingQuiz = getCustomQuizById(quizId);
          if (existingQuiz) {
            setQuizName(existingQuiz.name);
            setSelectedQuestions(existingQuiz.questionIds);
            // Optionally set filterWeek based on loaded questions if needed, but default is 1
          } else {
            toast.error("Quiz not found. Redirecting...");
            navigate('/custom-quizzes');
            return; // Stop further processing if quiz not found
          }
        } else {
          // Reset form for create mode
          setQuizName("");
          setSelectedQuestions([]);
          setFilterWeek(1); // Ensure default week filter for create mode
        }
        
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load necessary data. Please try again.");
      } finally {
        setLoading(false);
        setInitialLoadComplete(true); // Mark initial load as complete
      }
    };

    loadData();
  }, [quizId, isEditMode, navigate]); // Rerun if quizId changes

  // Apply week filter (only after initial data load is complete)
  useEffect(() => {
    if (!initialLoadComplete) return; // Don't filter until initial data is ready

    let filtered = [...questions];
    if (filterWeek !== null) {
      filtered = filtered.filter(q => q.week === filterWeek);
    }
    setFilteredQuestions(filtered);
  }, [filterWeek, questions, initialLoadComplete]);

  // Get unique weeks for filtering
  const weeks = [...new Set(questions.map(q => q.week))].sort((a, b) => a - b);
  
  // Get unique courses for filtering
  // Remove courses calculation as it's no longer needed for filtering

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

    if (isEditMode && quizId) {
      // Update existing quiz
      const updatedQuizData: CustomQuiz = {
        id: quizId, // Use existing ID
        name: trimmedName,
        timestamp: new Date().toISOString(), // Update timestamp
        questionIds: selectedQuestions,
      };
      updateCustomQuiz(updatedQuizData);
      toast.success("Custom quiz updated successfully");
    } else {
      // Create new quiz
      const newQuiz: CustomQuiz = {
        id: Date.now().toString(), // Generate new ID
        name: trimmedName,
        timestamp: new Date().toISOString(),
        questionIds: selectedQuestions,
      };
      saveCustomQuiz(newQuiz);
      toast.success("Custom quiz created successfully");
    }
    
    navigate('/custom-quizzes'); // Navigate back after creation/update
  };

  // Dynamic page title
  const pageTitle = isEditMode ? "Edit Custom Quiz" : "Create Custom Quiz";

  return (
    <PageLayout title={pageTitle}>
      <div className="max-w-4xl mx-auto pb-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/custom-quizzes')} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Custom Quizzes
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
              variant="outline" 
              size="sm" 
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
                  {weeks.map(week => (
                    <Button
                      key={week}
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
                  const question = questions.find(q => q.id === id);
                  return (
                    // Change from flex to grid layout
                    <div key={id} className="grid grid-cols-[1fr_auto] gap-2 items-center p-2 rounded-md border text-sm bg-muted/20">
                      {/* Keep min-w-0 for robustness, remove flex-1 and mr-2 as grid handles spacing */}
                      <p className="truncate min-w-0"> 
                        {question?.question.substring(0, 60)}... 
                        <span className="text-xs text-muted-foreground ml-2">({question?.courseId} W{question?.week})</span>
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
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-3 text-sm text-muted-foreground">Loading questions...</p>
              </div>
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
              onClick={handleSubmit} // Use the updated handler
              disabled={selectedQuestions.length === 0 || !quizName.trim() || loading}
              size="lg"
            >
              {isEditMode ? "Update Quiz" : "Create Quiz"} ({selectedQuestions.length} questions)
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

// No default export needed, using named export above
