
import React from 'react';

interface QuizLoadingProps {
  message?: string;
  className?: string;
}

export const QuizLoading = ({
  message = "Loading questions...",
  className = "h-[80vh]"
}: QuizLoadingProps): JSX.Element => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4">{message}</p>
      </div>
    </div>
  );
};

// No default export needed, using named export above
