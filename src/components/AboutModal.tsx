
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Coffee } from "lucide-react";

interface AboutModalProps {
  trigger: React.ReactNode;
}

export const AboutModal = ({ trigger }: AboutModalProps): JSX.Element => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About Quizzine</DialogTitle>
          <DialogDescription>
            Ace your quizzes with Quizzine! This app is designed to help you learn and prepare for your quizzes effectively.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center mt-4 gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://3dl82fhkbn.ufs.sh/f/faV3Ezo4eMA3M43MFlQeuXNDGJldCV5c3THoE1kxOhaWgj42" alt="Developer" />
            <AvatarFallback>JYunth</AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-lg font-medium">Made with 🤍 by Jheyanth</h3>
            <p className="text-sm text-muted-foreground">
              <a href="https://x.com/jheyanth_CS" target="_blank" rel="noopener noreferrer" className="underline">
                Follow me on Xitter
              </a>
            </p>
          </div>
          
          <div className="flex gap-3 mt-2">
            <Button asChild variant="outline">
              <a href="https://github.com/JYunth/quizzine-mobile-mastery" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                View Source
              </a>
            </Button>
            
            <Button asChild>
              <a href="https://buymeacoffee.com/jyunth" target="_blank" rel="noopener noreferrer">
                <Coffee className="mr-2 h-4 w-4" />
                Buy Me a Coffee
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// No default export needed, using named export above
