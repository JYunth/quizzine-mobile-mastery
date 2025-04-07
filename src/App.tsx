
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// Import our screens
import Home from "./screens/Home";
import Quiz from "./screens/Quiz";
import Bookmarks from "./screens/Bookmarks";
import Dashboard from "./screens/Dashboard";
import Settings from "./screens/Settings";
import NotFound from "./pages/NotFound";
import { getStorage } from "./lib/storage";

const queryClient = new QueryClient();

const App = () => {
  // Apply dark mode on initial load if enabled
  useEffect(() => {
    const storage = getStorage();
    if (storage.settings.darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz/:mode" element={<Quiz />} />
            <Route path="/quiz/:mode/:week" element={<Quiz />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
