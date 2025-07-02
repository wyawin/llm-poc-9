import React from 'react';
import { Sparkles, FileText, Settings, Zap } from 'lucide-react';

interface ExtractButtonProps {
  onExtract: () => void;
  fileName: string;
  extractionMode: 'general' | 'custom';
  fieldCount: number;
}

export const ExtractButton: React.FC<ExtractButtonProps> = ({
  onExtract,
  fileName,
  extractionMode,
  fieldCount
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Ready to Extract Content
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Document "{fileName}" is ready for processing
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>Document loaded</span>
            </div>
            <div className="flex items-center space-x-1">
              {extractionMode === 'custom' ? (
                <>
                  <Settings className="h-3 w-3" />
                  <span>{fieldCount} custom fields</span>
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3" />
                  <span>General analysis</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onExtract}
          className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">Extract Content</span>
        </button>
        
        <p className="text-xs text-gray-500 mt-2">
          {extractionMode === 'custom' 
            ? `AI will extract ${fieldCount} custom fields as structured JSON data`
            : 'AI will analyze and extract all content from your document'
          }
        </p>
      </div>
    </div>
  );
};