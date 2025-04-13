import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getStorage, updateSettings } from '@/lib/storage';

interface ThemeContextProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Initialize state directly from storage or system preference
    const storage = getStorage();
    const userPreference = storage.settings.darkMode; // boolean | undefined

    if (userPreference !== undefined) {
      return userPreference;
    } else {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  useEffect(() => {
    // Apply the theme class whenever darkMode state changes
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Persist the change to storage (only if it differs from initial state, handled in toggle)
    // updateSettings({ darkMode }); // Moved persistence to toggleDarkMode
  }, [darkMode]);

  const toggleDarkMode = (): void => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      // Persist the toggled state
      updateSettings({ darkMode: newMode });
      // Optionally add toast notification here if desired globally
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};