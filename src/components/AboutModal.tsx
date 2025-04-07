
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

const AboutModal = ({ trigger }: AboutModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About Quizzine</DialogTitle>
          <DialogDescription>
            An interactive quiz application for learning
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center mt-4 gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://via.placeholder.com/150" alt="Developer" />
            <AvatarFallback>DV</AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-lg font-medium">Developer Name</h3>
            <p className="text-sm text-muted-foreground">
              Creating educational tools to help people learn
            </p>
          </div>
          
          <div className="flex gap-3 mt-2">
            <Button asChild variant="outline">
              <a href="https://github.com/username/quizzine" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                View Source
              </a>
            </Button>
            
            <Button asChild>
              <a href="https://buymeacoffee.com/username" target="_blank" rel="noopener noreferrer">
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

export default AboutModal;
