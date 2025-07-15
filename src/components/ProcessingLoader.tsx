import React from 'react';
import { Loader2, FileText, Sparkles } from 'lucide-react';

interface ProcessingLoaderProps {
  stage: 'uploading' | 'processing' | 'analyzing';
  progress: number;
}

export const ProcessingLoader: React.FC<ProcessingLoaderProps> = ({ stage, progress }) => {
  const getStageInfo = () => {
    switch (stage) {
      case 'uploading':
        return {
          icon: <FileText className="h-6 w-6" />,
          title: 'Uploading Document',
          description: 'Preparing your file for processing...'
        };
      case 'processing':
        return {
          icon: <Loader2 className="h-6 w-6 animate-spin" />,
          title: 'Processing Document',
          description: 'Fineksi Lens is extracting content...'
        };
      case 'analyzing':
        return {
          icon: <Sparkles className="h-6 w-6 animate-pulse" />,
          title: 'Analyzing Content',
          description: 'Organizing and structuring the extracted data...'
        };
      default:
        return {
          icon: <Loader2 className="h-6 w-6 animate-spin" />,
          title: 'Processing',
          description: 'Please wait...'
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="space-y-6">
        <div className="flex justify-center text-blue-500">
          {stageInfo.icon}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {stageInfo.title}
          </h3>
          <p className="text-gray-600 text-sm">
            {stageInfo.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">{progress}% complete</p>
        </div>
      </div>
    </div>
  );
};