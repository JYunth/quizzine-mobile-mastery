
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomQuiz, Question } from "@/types";
import { getAllQuestionsFromAllCourses, saveCustomQuiz } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface CustomQuizSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuizCreated: () => void;
}

const CustomQuizSheet = ({ open, onOpenChange, onQuizCreated }: CustomQuizSheetProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [quizName, setQuizName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterWeek, setFilterWeek] = useState<number | null>(null);
  const [filterCourse, setFilterCourse] = useState<string | null>(null);

  // Load all questions
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      const allQuestions = await getAllQuestionsFromAllCourses();
      setQuestions(allQuestions);
      setFilteredQuestions(allQuestions);
      setLoading(false);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Create Custom Quiz</SheetTitle>
          <SheetDescription>
            Select questions to include in your custom quiz
          </SheetDescription>
        </SheetHeader>
        
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
          
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="selected">Selected ({selectedQuestions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="filters" className="space-y-4">
              <div className="space-y-2">
                <Label>Filter by Course</Label>
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
                <Label>Filter by Week</Label>
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
                      Week {week}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="selected">
              {selectedQuestions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No questions selected yet
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedQuestions.map(id => {
                    const question = questions.find(q => q.id === id);
                    return (
                      <div key={id} className="flex justify-between items-center border p-2 rounded">
                        <p className="text-sm truncate flex-1">
                          {question?.question.substring(0, 40)}...
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSelectQuestion(id)}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading questions...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {filteredQuestions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No questions match your filters
                </p>
              ) : (
                filteredQuestions.map(question => (
                  <div 
                    key={question.id} 
                    className="flex items-start space-x-2 border p-3 rounded"
                  >
                    <Checkbox 
                      id={question.id}
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => handleSelectQuestion(question.id)}
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
                          <span className="text-sm line-clamp-2">
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
          
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleCreateQuiz} 
              disabled={selectedQuestions.length === 0 || !quizName.trim()}
            >
              Create Quiz
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CustomQuizSheet;
