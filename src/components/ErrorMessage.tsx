import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Processing Failed
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {message}
          </p>
        </div>

        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};