
import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomQuiz, Question } from "@/types";
import { getAllQuestionsFromAllCourses, saveCustomQuiz } from "@/lib/storage";
import { X, Filter } from "lucide-react";
import { toast } from "sonner";

interface CustomQuizDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuizCreated: () => void;
}

const CustomQuizDrawer = ({ open, onOpenChange, onQuizCreated }: CustomQuizDrawerProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [quizName, setQuizName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterWeek, setFilterWeek] = useState<number | null>(null);
  const [filterCourse, setFilterCourse] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load all questions
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const allQuestions = await getAllQuestionsFromAllCourses();
        setQuestions(allQuestions);
        setFilteredQuestions(allQuestions);
      } catch (error) {
        console.error("Failed to load questions:", error);
        toast("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      loadQuestions();
      setSelectedQuestions([]);
      setQuizName("");
    }
  }, [open]);

  // Apply filters
  useEffect(() => {
    let filtered = [...questions];
    
    if (filterWeek !== null) {
      filtered = filtered.filter(q => q.week === filterWeek);
    }
    
    if (filterCourse !== null) {
      filtered = filtered.filter(q => q.courseId === filterCourse);
    }
    
    setFilteredQuestions(filtered);
  }, [filterWeek, filterCourse, questions]);

  // Get unique weeks for filtering
  const weeks = [...new Set(questions.map(q => q.week))].sort((a, b) => a - b);
  
  // Get unique courses for filtering
  const courses = [...new Set(questions.map(q => q.courseId))];

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
    onOpenChange(false);
    onQuizCreated();
    toast("Custom quiz created successfully");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-center">
            <DrawerTitle>Create Custom Quiz</DrawerTitle>
            <DrawerDescription>
              Select questions to include in your custom quiz
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-12 pt-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="quiz-name">Quiz Name</Label>
                <Input
                  id="quiz-name"
                  value={quizName}
                  onChange={e => setQuizName(e.target.value)}
                  placeholder="Enter quiz name"
                />
              </div>
              
              {/* Selected Questions Counter */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Selected: {selectedQuestions.length} questions
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
              
              {/* Filters Section */}
              {showFilters && (
                <div className="space-y-3 border rounded-md p-3 bg-muted/20">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Filters</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Course</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={filterCourse === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterCourse(null)}
                      >
                        All
                      </Button>
                      {courses.map(courseId => (
                        <Button
                          key={courseId}
                          variant={filterCourse === courseId ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterCourse(courseId)}
                        >
                          {courseId}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Week</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={filterWeek === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterWeek(null)}
                      >
                        All
                      </Button>
                      {weeks.map(week => (
                        <Button
                          key={week}
                          variant={filterWeek === week ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterWeek(week)}
                        >
                          {week}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Selected Questions Preview */}
              {selectedQuestions.length > 0 && (
                <div className="space-y-2 my-3">
                  <Label className="text-sm">Selected Questions</Label>
                  <div className="max-h-[20vh] overflow-y-auto space-y-2 border rounded-md p-2 bg-background">
                    {selectedQuestions.map(id => {
                      const question = questions.find(q => q.id === id);
                      return (
                        <div key={id} className="flex justify-between items-center p-2 rounded-md border text-sm">
                          <p className="truncate flex-1 mr-2">
                            {question?.question.substring(0, 30)}...
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm"
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
              
              {/* Questions List */}
              <div className="mt-4">
                <Label className="mb-2 block">Available Questions</Label>
                {loading ? (
                  <div className="py-8 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading questions...</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto border rounded-md p-2 bg-background">
                    {filteredQuestions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No questions match your filters
                      </p>
                    ) : (
                      filteredQuestions.map(question => (
                        <div 
                          key={question.id} 
                          className="flex items-start space-x-2 border p-3 rounded-md"
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
                                <span className="text-xs text-muted-foreground mb-1">
                                  {question.courseId} - Week {question.week}
                                </span>
                                <span className="text-sm">
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
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleCreateQuiz} 
                  disabled={selectedQuestions.length === 0 || !quizName.trim()}
                >
                  Create Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CustomQuizDrawer;
