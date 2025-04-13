
import { useState, useEffect } from "react"; // Keep useState for other settings
import { PageLayout } from "@/components/PageLayout";
import { getStorage, updateSettings, exportStorage, importStorage, resetStorage } from "@/lib/storage"; // Keep updateSettings for hardMode
import { useTheme } from "@/contexts/ThemeContext"; // Import useTheme
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AppStorage } from "@/types";
import { toast } from "sonner";
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
import { DownloadCloud, UploadCloud, RotateCcw, Info, Mail } from "lucide-react"; // Added Mail icon
import { AboutModal } from "@/components/AboutModal";

export const Settings = (): JSX.Element => {
  // Use theme context for dark mode
  const { darkMode, toggleDarkMode } = useTheme();
  
  // Local state for other settings (hardMode, etc.)
  const [otherSettings, setOtherSettings] = useState<Omit<AppStorage["settings"], 'darkMode'>>({
    reminders: false, // Assuming reminders might still be local or unused
    hardMode: false,
    lastVisitedWeek: 1,
  });
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  
  // Load other settings (non-dark mode) from storage
  useEffect(() => {
    const storage = getStorage();
    // Exclude darkMode when setting local state
    const { darkMode: _, ...restSettings } = storage.settings;
    setOtherSettings(restSettings);
  }, []);
  
  // handleToggleDarkMode is now replaced by toggleDarkMode from useTheme
  // We can add the toast notification within the context or keep it here if preferred
  // For simplicity, let's assume the context handles persistence, and we add toast here.
  const handleToggleDarkModeWithToast = (): void => {
    toggleDarkMode(); // Call the context function
    // Toast logic can be added here or potentially moved to the context if desired globally
    toast(`Dark mode ${!darkMode ? 'enabled' : 'disabled'}`);
  };

  const handleToggleHardMode = (checked: boolean): void => {
    updateSettings({ hardMode: checked }); // Persist hardMode change
    setOtherSettings(prev => ({ ...prev, hardMode: checked })); // Update local state for hardMode
    toast(`Hard mode ${checked ? 'enabled' : 'disabled'}`);
  };
  
  const handleExport = (): void => {
    exportStorage();
    toast("Data exported successfully");
  };
  
  const handleImportClick = (): void => {
    fileInput?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const success = importStorage(content);
        if (success) {
          // Reload settings after import
          const storage = getStorage();
          // Reload *other* settings after import
          const { darkMode: importedDarkMode, ...restImportedSettings } = storage.settings;
          setOtherSettings(restImportedSettings);
          // ThemeProvider will automatically apply the theme based on the updated storage
          // No need to manually set class here. We might need to trigger a re-read in ThemeProvider
          // or simply reload the page for simplicity after import.
          // For now, assume ThemeProvider handles it or a page reload occurs.
          // If ThemeProvider needs explicit update signal, that's a further enhancement.
          
          toast("Data imported successfully");
        } else {
          toast("Failed to import data");
        }
      } catch (error) {
        toast("Invalid file format");
      }
    };
    
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };
  
  const handleReset = (): void => {
    resetStorage();
    // Reload settings after reset
    const storage = getStorage();
    // Reload *other* settings after reset
    const { darkMode: _, ...restResetSettings } = storage.settings;
    setOtherSettings(restResetSettings);
    // ThemeProvider will handle applying the theme based on reset storage.
    toast("All data has been reset");
  };

  const handleReportBug = (): void => {
    const recipient = "jyunth28@gmail.com";
    const subject = "Bug Report - Quizzine Mobile App";
    const body = `Please describe the bug in detail:

Steps to reproduce:


Expected behavior:


Actual behavior:


Device/OS (Optional):


App Version (If known):`;

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };
  
  return (
    <PageLayout title="Settings">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Appearance</h2>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the app
                  </p>
                </div>
                <Switch 
                  checked={darkMode} // Use darkMode from context
                  onCheckedChange={handleToggleDarkModeWithToast} // Use the wrapper or context toggle directly
                />
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Hard Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Shuffle options
                  </p>
                </div>
                <Switch 
                  checked={otherSettings.hardMode} // Use hardMode from local state
                  onCheckedChange={handleToggleHardMode}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-2">Data Management</h2>
            <div className="bg-card rounded-lg border p-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Export & Import Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export your quiz data and progress to a file, or import from a previously exported file
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleExport}>
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                  <Button variant="outline" onClick={handleImportClick}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Import Data
                  </Button>
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleFileChange}
                    ref={ref => setFileInput(ref)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Reset Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Reset all app data including quizzes, bookmarks, and settings
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently delete all your data, including quiz attempts,
                        bookmarks, and settings. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReset}>
                        Yes, reset all data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
  
            <div>
              <h2 className="text-lg font-medium mb-2">Support</h2>
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Report a Bug</h3>
                    <p className="text-sm text-muted-foreground">
                      Found an issue? Let us know via email.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReportBug}>
                    <Mail className="mr-2 h-4 w-4" />
                    Report Bug
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-2">About</h2>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">About Quizzine</h3>
                  <p className="text-sm text-muted-foreground">
                    View information about this application
                  </p>
                </div>
                <AboutModal
                  trigger={
                    <Button variant="outline" size="sm">
                      <Info className="mr-2 h-4 w-4" />
                      View Info
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

// No default export needed, using named export above
