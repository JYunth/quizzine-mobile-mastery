
import React from 'react';

const QuizLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4">Loading questions...</p>
      </div>
    </div>
  );
};

export default QuizLoading;
