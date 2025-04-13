
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// Import our screens
import { Home } from "./screens/Home";
import { Quiz } from "./screens/Quiz";
import { Bookmarks } from "./screens/Bookmarks";
import { Dashboard } from "./screens/Dashboard";
import { Settings } from "./screens/Settings";
import { CustomQuizzes } from "./screens/CustomQuizzes";
import { CreateQuiz } from "./pages/CreateQuiz"; // Import the new page
import { NotFound } from "./pages/NotFound";
import { getStorage } from "./lib/storage";

const queryClient = new QueryClient();

export const App = (): JSX.Element => {
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
        <Sonner position="top-center" closeButton />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Specific route for weekly quizzes */}
            <Route path="/quiz/weekly/:week(\\d+)" element={<Quiz />} /> 
            {/* General route for modes using an ID (custom, bookmark, etc.) */}
            <Route path="/quiz/:mode/:id" element={<Quiz />} /> 
             {/* General route for modes without week/id (full, smart) */}
            <Route path="/quiz/:mode" element={<Quiz />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/custom-quizzes" element={<CustomQuizzes />} />
            <Route path="/create-quiz" element={<CreateQuiz />} /> 
            <Route path="/edit-quiz/:quizId" element={<CreateQuiz />} /> {/* Add the edit route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// No default export needed, using named export above
