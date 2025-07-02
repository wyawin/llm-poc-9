import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Shield, Zap, Server, AlertTriangle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { ProcessingLoader } from './components/ProcessingLoader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { JsonResultsDisplay } from './components/JsonResultsDisplay';
import { ExtractionConfig } from './components/ExtractionConfig';
import { ErrorMessage } from './components/ErrorMessage';
import { ExtractButton } from './components/ExtractButton';
import apiService from './services/apiService';

type AppState = 'idle' | 'file-selected' | 'processing' | 'success' | 'error';
type ProcessingStage = 'uploading' | 'processing' | 'analyzing';

interface ExtractionField {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'array_object';
  objectSchema?: ObjectField[];
}

interface ObjectField {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'boolean';
}

function App() {
  const [state, setState] = useState<AppState>('idle');
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('uploading');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedContent, setExtractedContent] = useState('');
  const [extractedJson, setExtractedJson] = useState<any>(null);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [supportedTypes, setSupportedTypes] = useState<string[]>([]);
  const [extractionFields, setExtractionFields] = useState<ExtractionField[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [useCustomExtraction, setUseCustomExtraction] = useState(false);

  useEffect(() => {
    checkServerStatus();
    loadSupportedTypes();
  }, []);

  const checkServerStatus = async () => {
    try {
      await apiService.checkHealth();
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const loadSupportedTypes = async () => {
    try {
      const types = await apiService.getSupportedTypes();
      setSupportedTypes(types);
    } catch (error) {
      console.error('Failed to load supported types:', error);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setState('file-selected');
    setError('');
    setExtractedContent('');
    setExtractedJson(null);
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setState('processing');
    setProgress(0);
    setProcessingStage('uploading');

    try {
      // Simulate upload progress
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingStage('processing');
      setProgress(40);
      
      // Process the document via backend
      const extractionType = useCustomExtraction && extractionFields.length > 0 ? 'custom' : 'analyze';
      const result = await apiService.extractDocument(selectedFile, extractionType, extractionFields);
      
      setProgress(80);
      setProcessingStage('analyzing');
      
      // Simulate final processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(100);
      
      setExtractedContent(result.content);
      
      // If we have JSON data, parse it
      if (result.jsonData) {
        setExtractedJson(result.jsonData);
      } else {
        setExtractedJson(null);
      }
      
      setState('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setState('error');
    }
  };

  const handleRetry = () => {
    if (selectedFile) {
      handleExtract();
    } else {
      setState('idle');
    }
  };

  const handleNewDocument = () => {
    setState('idle');
    setSelectedFile(null);
    setExtractedContent('');
    setExtractedJson(null);
    setError('');
    setProgress(0);
  };

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Extraction",
      description: "Leverages Google Gemini AI for intelligent content extraction"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Complex Data Structures",
      description: "Extract arrays of objects like invoice items, work experience, and more"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Fast Processing",
      description: "Quick and efficient document analysis and extraction"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your documents are processed securely and not stored"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Extract Content with AI Precision
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload any document and get intelligent insights or structured JSON data with complex object arrays.
            Powered by Google Gemini AI for accurate content extraction.
          </p>
          
          {/* Server Status Indicator */}
          <div className="flex justify-center mt-6">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm ${
              serverStatus === 'online' 
                ? 'bg-green-100 text-green-700' 
                : serverStatus === 'offline'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              <Server className="h-4 w-4" />
              <span>
                {serverStatus === 'online' && 'Server Online'}
                {serverStatus === 'offline' && 'Server Offline'}
                {serverStatus === 'checking' && 'Checking Server...'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {serverStatus === 'offline' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">
                    Server Connection Failed
                  </h3>
                  <p className="text-red-700 text-sm mb-3">
                    Unable to connect to the backend server. Please ensure:
                  </p>
                  <ol className="text-sm text-red-700 space-y-1 ml-4">
                    <li>1. The server is running (npm run dev)</li>
                    <li>2. Your .env file contains a valid GEMINI_API_KEY</li>
                    <li>3. The server is accessible at http://localhost:3001</li>
                  </ol>
                  <button
                    onClick={checkServerStatus}
                    className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            </div>
          )}

          {(state === 'idle' || state === 'file-selected') && serverStatus === 'online' && (
            <div className="space-y-8">
              {/* Extraction Mode Toggle */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Extraction Mode</h3>
                    <p className="text-sm text-gray-600">Choose how you want to extract data from your documents</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm ${!useCustomExtraction ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      General Analysis
                    </span>
                    <button
                      onClick={() => setUseCustomExtraction(!useCustomExtraction)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        useCustomExtraction ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useCustomExtraction ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm ${useCustomExtraction ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                      Custom Fields
                    </span>
                  </div>
                </div>

                {useCustomExtraction && (
                  <div className="border-t pt-4">
                    <ExtractionConfig
                      onConfigChange={setExtractionFields}
                      isVisible={showConfig}
                      onToggle={() => setShowConfig(!showConfig)}
                    />
                    {!showConfig && extractionFields.length > 0 && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-700">
                          <strong>{extractionFields.length} custom fields</strong> configured for extraction
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {extractionFields.slice(0, 5).map(field => (
                            <span key={field.id} className={`px-2 py-1 text-xs rounded ${
                              field.type === 'array_object' 
                                ? 'bg-purple-200 text-purple-800' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {field.name}
                              {field.type === 'array_object' && ' []'}
                            </span>
                          ))}
                          {extractionFields.length > 5 && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                              +{extractionFields.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  isProcessing={state === 'processing'}
                  supportedTypes={supportedTypes}
                  selectedFile={selectedFile}
                />
              </div>

              {/* Extract Button */}
              {state === 'file-selected' && selectedFile && (
                <ExtractButton
                  onExtract={handleExtract}
                  fileName={selectedFile.name}
                  extractionMode={useCustomExtraction ? 'custom' : 'general'}
                  fieldCount={extractionFields.length}
                />
              )}

              {/* Features Grid */}
              {state === 'idle' && (
                <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                    >
                      <div className="text-blue-500 flex justify-center mb-3">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {state === 'processing' && (
            <ProcessingLoader stage={processingStage} progress={progress} />
          )}

          {state === 'success' && (
            <>
              {extractedJson ? (
                <JsonResultsDisplay
                  jsonData={extractedJson}
                  rawContent={extractedContent}
                  fileName={selectedFile?.name || 'document'}
                  onNewDocument={handleNewDocument}
                />
              ) : (
                <ResultsDisplay
                  content={extractedContent}
                  fileName={selectedFile?.name || 'document'}
                  onNewDocument={handleNewDocument}
                />
              )}
            </>
          )}

          {state === 'error' && (
            <ErrorMessage message={error} onRetry={handleRetry} />
          )}
        </div>

        {/* How It Works Section */}
        {serverStatus === 'online' && (state === 'idle' || state === 'file-selected') && (
          <div id="how-it-works" className="max-w-4xl mx-auto mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
              <p className="text-gray-600">Simple steps to extract content from your documents</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Upload Document</h3>
                <p className="text-sm text-gray-600">Choose your document - PDF, image, or text file</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Configure Extraction</h3>
                <p className="text-sm text-gray-600">Choose general analysis or define custom fields</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Get Results</h3>
                <p className="text-sm text-gray-600">Receive structured data or comprehensive analysis</p>
              </div>
            </div>
          </div>
        )}

        {/* Supported Formats Section */}
        {serverStatus === 'online' && (state === 'idle' || state === 'file-selected') && (
          <div id="supported-formats" className="max-w-4xl mx-auto mt-16">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Supported Document Formats
                  </h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Your documents are processed securely with support for complex data structures.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Document Types:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• PDF documents</li>
                        <li>• Images (PNG, JPG, GIF, WebP)</li>
                        <li>• Text files (TXT, CSV, RTF, HTML)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Extraction Features:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Simple arrays (skills, tags, categories)</li>
                        <li>• Complex object arrays (invoice items, work experience)</li>
                        <li>• Custom object schemas with multiple properties</li>
                        <li>• Nested data structures and relationships</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;