
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Github, Coffee } from "lucide-react";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AboutDialog = ({ open, onOpenChange }: AboutDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About Quizzine</DialogTitle>
          <DialogDescription>
            Version 1.0.0
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="https://i.pravatar.cc/150?img=12" alt="Creator" />
            <AvatarFallback>CA</AvatarFallback>
          </Avatar>
          
          <p className="text-center mb-6">
            Quizzine is an open-source, offline-first quiz app for NPTEL or similar course content.
            All data is stored locally in your browser.
          </p>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => window.open("https://github.com/example/quizzine", "_blank")}>
              <Github size={16} />
              GitHub Repository
            </Button>
            
            <Button variant="default" className="flex items-center gap-2" onClick={() => window.open("https://buymeacoffee.com/example", "_blank")}>
              <Coffee size={16} />
              Buy Me a Coffee
            </Button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AboutDialog;
