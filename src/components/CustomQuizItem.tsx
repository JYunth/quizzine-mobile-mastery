
import { CustomQuiz } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardHeader, CardTitle
import { Button } from "@/components/ui/button";
import { Trash2, CalendarDays, Pencil } from "lucide-react"; // Added Pencil icon
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
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
  const navigate = useNavigate(); // Add useNavigate hook

  return (
    <Card key={quiz.id} className="flex flex-col h-full relative"> {/* Add relative positioning */}
      {/* Delete Button Top Right */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-7 w-7" // Position delete icon
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete '{quiz.name}'? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(quiz.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90" // Style delete action
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Card Content */}
      <CardHeader className="pb-2 pt-4"> {/* Use CardHeader for title */}
         <CardTitle className="font-medium text-lg pr-8">{quiz.name}</CardTitle> {/* Add padding-right to avoid overlap */}
      </CardHeader>
      <CardContent className="pt-0 flex-grow"> {/* Adjust padding */}
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <CalendarDays className="h-4 w-4 mr-1.5" /> {/* Adjust margin */}
          <span className="text-xs"> {/* Smaller text */}
            Created {formatDistanceToNow(new Date(quiz.timestamp), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {quiz.questionIds.length} questions
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 pb-4 px-4"> {/* Adjust padding */}
        {/* Edit Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/edit-quiz/${quiz.id}`)} // Navigate to edit route
        >
          <Pencil className="h-3.5 w-3.5 mr-1.5" /> {/* Use Pencil icon */}
          Edit
        </Button>
        
        {/* Start Quiz Button */}
        <Link to={`/quiz/custom/${quiz.id}`}>
          <Button size="sm">Start Quiz</Button> {/* Make button size consistent */}
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CustomQuizItem;
