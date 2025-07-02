import React, { useState } from 'react';
import { Copy, Download, FileText, CheckCircle, AlertCircle, Code, Eye, ChevronDown, ChevronRight } from 'lucide-react';

interface JsonResultsDisplayProps {
  jsonData: any;
  rawContent: string;
  fileName: string;
  onNewDocument: () => void;
}

export const JsonResultsDisplay: React.FC<JsonResultsDisplayProps> = ({
  jsonData,
  rawContent,
  fileName,
  onNewDocument
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'json' | 'raw'>('structured');
  const [expandedArrays, setExpandedArrays] = useState<Set<string>>(new Set());

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownload = (content: string, extension: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { 
      type: extension === 'json' ? 'application/json' : 'text/plain' 
    });
    element.href = URL.createObjectURL(file);
    element.download = `extracted_${fileName}.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleArrayExpansion = (key: string) => {
    const newExpanded = new Set(expandedArrays);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedArrays(newExpanded);
  };

  const renderValue = (value: any, key: string = '') => {
    if (Array.isArray(value)) {
      // Check if it's an array of objects
      const isObjectArray = value.length > 0 && typeof value[0] === 'object' && value[0] !== null;
      
      if (isObjectArray) {
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleArrayExpansion(key)}
                className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-800 transition-colors"
              >
                {expandedArrays.has(key) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>{value.length} items</span>
              </button>
            </div>
            
            {expandedArrays.has(key) && (
              <div className="space-y-3 ml-4 border-l-2 border-purple-200 pl-4">
                {value.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 mb-2">Item {index + 1}</div>
                    <div className="space-y-2">
                      {Object.entries(item).map(([objKey, objValue]) => (
                        <div key={objKey} className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-600 capitalize min-w-0 flex-1">
                            {objKey.replace(/_/g, ' ')}:
                          </span>
                          <span className="text-sm text-gray-800 ml-2 text-right">
                            {String(objValue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      } else {
        // Simple array
        return (
          <ul className="list-disc list-inside space-y-1">
            {value.map((item, index) => (
              <li key={index} className="text-sm">{String(item)}</li>
            ))}
          </ul>
        );
      }
    } else if (typeof value === 'object' && value !== null) {
      return (
        <pre className="text-sm bg-gray-50 p-2 rounded overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    } else {
      return <p className="text-sm">{String(value)}</p>;
    }
  };

  const renderStructuredView = () => {
    if (!jsonData || typeof jsonData !== 'object') {
      return (
        <div className="flex items-center space-x-2 text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <span>No structured data available</span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(jsonData).map(([key, value]) => (
          <div key={key} className="border-b border-gray-200 pb-4 last:border-b-0">
            <h4 className="font-medium text-gray-800 mb-3 capitalize flex items-center space-x-2">
              <span>{key.replace(/_/g, ' ')}</span>
              {Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Array of Objects
                </span>
              )}
            </h4>
            <div className="text-gray-700">
              {renderValue(value, key)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderJsonView = () => (
    <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
      <pre className="text-sm font-mono">
        {JSON.stringify(jsonData, null, 2)}
      </pre>
    </div>
  );

  const renderRawView = () => (
    <div className="prose prose-sm max-w-none">
      <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
        {rawContent}
      </div>
    </div>
  );

  const getCurrentContent = () => {
    switch (viewMode) {
      case 'json':
        return JSON.stringify(jsonData, null, 2);
      case 'raw':
        return rawContent;
      default:
        return JSON.stringify(jsonData, null, 2);
    }
  };

  const getCurrentExtension = () => {
    switch (viewMode) {
      case 'json':
        return 'json';
      case 'raw':
        return 'txt';
      default:
        return 'json';
    }
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
              Structured data extracted from "{fileName}"
            </p>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">View:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'structured', label: 'Structured', icon: Eye },
            { key: 'json', label: 'JSON', icon: Code },
            { key: 'raw', label: 'Raw', icon: FileText }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key as any)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                viewMode === key
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleCopy(getCurrentContent())}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {copied ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        <button
          onClick={() => handleDownload(getCurrentContent(), getCurrentExtension())}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download {viewMode.toUpperCase()}</span>
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
          <h2 className="text-lg font-semibold text-gray-800">
            Extracted Data - {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {viewMode === 'structured' && 'Organized data fields with expandable object arrays'}
            {viewMode === 'json' && 'Raw JSON data structure'}
            {viewMode === 'raw' && 'Original extracted content'}
          </p>
        </div>
        
        <div className="p-6">
          {viewMode === 'structured' && renderStructuredView()}
          {viewMode === 'json' && renderJsonView()}
          {viewMode === 'raw' && renderRawView()}
        </div>
      </div>
    </div>
  );
};