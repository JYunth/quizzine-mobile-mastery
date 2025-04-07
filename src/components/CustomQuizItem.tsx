
import { CustomQuiz } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
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
import { useState } from "react";

interface CustomQuizItemProps {
  quiz: CustomQuiz;
  onDelete: (id: string) => void;
}

const CustomQuizItem: React.FC<CustomQuizItemProps> = ({ quiz, onDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  return (
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
        <AlertDialog 
          open={isDeleteDialogOpen} 
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
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
              <AlertDialogAction onClick={() => onDelete(quiz.id)}>
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
  );
};

export default CustomQuizItem;
