import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomQuiz, Question } from "@/types";
// Import getAllQuestions instead of getAllQuestionsFromAllCourses
import { getAllQuestions, saveCustomQuiz } from "@/lib/storage"; 
import { X, Filter, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [quizName, setQuizName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterWeek, setFilterWeek] = useState<number | null>(1); // Default filterWeek to 1
  // Remove filterCourse state
  const [showFilters, setShowFilters] = useState(false);

  // Load questions for the current course
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        // Call getAllQuestions() to get questions for the current course
        const courseQuestions = await getAllQuestions(); 
        setQuestions(courseQuestions);
        setFilteredQuestions(courseQuestions); // Initially set filtered to all course questions
      } catch (error) {
        console.error("Failed to load questions:", error);
        toast("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...questions];
    
    if (filterWeek !== null) {
      filtered = filtered.filter(q => q.week === filterWeek);
    }
    // Remove filterCourse logic
    
    setFilteredQuestions(filtered);
  }, [filterWeek, questions]); // Remove filterCourse from dependencies

  // Get unique weeks for filtering
  const weeks = [...new Set(questions.map(q => q.week))].sort((a, b) => a - b);
  
  // Get unique courses for filtering
  // Remove courses calculation as it's no longer needed for filtering

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleCreateQuiz = () => {
    if (!quizName.trim()) {
      toast("Please enter a quiz name");
      return;
    }
    
    if (selectedQuestions.length === 0) {
      toast("Please select at least one question");
      return;
    }
    
    const newQuiz: CustomQuiz = {
      id: Date.now().toString(),
      name: quizName.trim(),
      timestamp: new Date().toISOString(),
      questionIds: selectedQuestions,
    };
    
    saveCustomQuiz(newQuiz);
    toast("Custom quiz created successfully");
    navigate('/custom-quizzes'); // Navigate back after creation
  };

  return (
    <PageLayout title="Create Custom Quiz">
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
          
          {/* Create Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button 
              onClick={handleCreateQuiz} 
              disabled={selectedQuestions.length === 0 || !quizName.trim() || loading}
              size="lg"
            >
              Create Quiz ({selectedQuestions.length} questions)
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateQuiz;
