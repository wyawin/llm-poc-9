import React, { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  supportedTypes: string[];
  selectedFile?: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isProcessing,
  supportedTypes,
  selectedFile
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileValidation(file);
    }
  }, [supportedTypes]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError('');
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileValidation(file);
    }
  }, [supportedTypes]);

  const handleFileValidation = (file: File) => {
    if (!supportedTypes.includes(file.type)) {
      setError('File type not supported. Please select a PDF, image, or text file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size too large. Please select a file smaller than 10MB.');
      return;
    }

    onFileSelect(file);
  };

  const removeFile = () => {
    setError('');
    // Reset the file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : selectedFile
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isProcessing && !selectedFile && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          onChange={handleChange}
          accept={supportedTypes.join(',')}
          disabled={isProcessing}
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-gray-800 truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              {!isProcessing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-green-700">
                File ready for extraction
              </p>
              <p className="text-xs text-green-600 mt-1">
                Click the "Extract Content" button below to process this document
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className={`h-12 w-12 ${error ? 'text-red-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {error ? 'Error uploading file' : 'Upload your document'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports PDF, images (PNG, JPG, GIF, WebP), and text files
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};