
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { exportStorage, getStorage, importStorage, resetStorage, updateSettings } from "@/lib/storage";
import { Download, Upload, RotateCcw, X, Check, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    reminders: false
  });
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const storage = getStorage();
    setSettings(storage.settings);
    
    // Apply dark mode
    if (storage.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettings({ [key]: value });
    
    // Apply dark mode immediately
    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    toast(`${key} ${value ? 'enabled' : 'disabled'}`);
  };
  
  const handleResetData = () => {
    resetStorage();
    setResetConfirmOpen(false);
    toast('All data has been reset');
    // Navigate to home after reset
    navigate('/');
  };
  
  const handleExport = () => {
    exportStorage();
    toast('Data exported successfully');
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const success = importStorage(content);
        if (success) {
          toast('Data imported successfully');
          window.location.reload();
        } else {
          toast('Failed to import data. Invalid format.');
        }
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <PageLayout title="Settings">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {settings.darkMode ? (
                  <Moon className="text-primary" size={20} />
                ) : (
                  <Sun className="text-amber-500" size={20} />
                )}
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
              <Switch 
                id="dark-mode" 
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage notification settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="reminders">Study Reminders</Label>
              <Switch 
                id="reminders" 
                checked={settings.reminders}
                onCheckedChange={(checked) => handleSettingChange('reminders', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export, import, or reset your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleExport}
                variant="outline" 
                className="flex items-center"
              >
                <Download size={18} className="mr-2" />
                Export Data
              </Button>
              
              <Button
                variant="outline"
                className="relative flex items-center overflow-hidden"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <Upload size={18} className="mr-2" />
                Import Data
                <input 
                  id="import-file" 
                  type="file" 
                  accept=".json" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImport}
                />
              </Button>
            </div>
            
            <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <RotateCcw size={18} className="mr-2" />
                  Reset All Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset all data?</DialogTitle>
                  <DialogDescription>
                    This will delete all your quizzes, bookmarks, and settings. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>
                    <X size={18} className="mr-2" />
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleResetData}>
                    <RotateCcw size={18} className="mr-2" />
                    Reset Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>About Quizzine</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">
              Version 1.0.0
            </p>
            <p className="text-sm">
              Quizzine is an open-source, offline-first quiz app for NPTEL or similar course content.
              All data is stored locally in your browser.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Settings;
