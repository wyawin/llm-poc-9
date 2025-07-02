import React, { useState } from 'react';
import { Copy, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface ResultsDisplayProps {
  content: string;
  fileName: string;
  onNewDocument: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  content,
  fileName,
  onNewDocument
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `extracted_${fileName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.trim().startsWith('#')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-800 mt-4 mb-2">
            {line.replace(/^#+\s*/, '')}
          </h3>
        );
      } else if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        return (
          <li key={index} className="text-gray-700 ml-4 mb-1">
            {line.replace(/^[*-]\s*/, '')}
          </li>
        );
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return (
          <p key={index} className="text-gray-700 mb-2 leading-relaxed">
            {line}
          </p>
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Document processed successfully!
            </h3>
            <p className="text-xs text-green-600 mt-1">
              Content has been extracted from "{fileName}"
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {copied ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span>{copied ? 'Copied!' : 'Copy Text'}</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>

        <button
          onClick={onNewDocument}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <FileText className="h-4 w-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Content Display */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Extracted Content</h2>
          <p className="text-sm text-gray-500 mt-1">
            Processed content from your document
          </p>
        </div>
        
        <div className="p-6">
          <div className="prose prose-sm max-w-none">
            {content ? (
              formatContent(content)
            ) : (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>No content could be extracted from this document.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};