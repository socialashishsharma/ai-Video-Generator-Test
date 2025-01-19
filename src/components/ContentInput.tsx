import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Play, Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ContentInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  disabled: boolean;
}

export function ContentInput({ value, onChange, onGenerate, disabled }: ContentInputProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: {
      'text/plain': ['.txt']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: disabled || isProcessing,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        setIsProcessing(true);
        
        try {
          const text = await file.text();
          const cleanedText = text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
            .trim();

          if (!cleanedText) {
            throw new Error('File is empty');
          }
            
          onChange(cleanedText);
          setUploadSuccess(true);
        } catch (error) {
          setUploadedFile(null);
          setUploadSuccess(false);
          console.error('File processing error:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    }
  });

  const hasError = fileRejections.length > 0;
  const errorMessage = fileRejections[0]?.errors[0]?.message;

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadSuccess(false);
    onChange('');
  };

  return (
    <div className="space-y-4">
      {!uploadSuccess ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : hasError
              ? 'border-red-300 bg-red-50'
              : isProcessing
              ? 'border-yellow-300 bg-yellow-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2 text-center">
            {hasError ? (
              <AlertCircle className="h-8 w-8 text-red-500" />
            ) : isProcessing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
            ) : (
              <Upload className={`h-8 w-8 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            )}
            <div className="space-y-1">
              <p className={`text-sm ${
                hasError ? 'text-red-600' 
                : isProcessing ? 'text-yellow-600'
                : 'text-gray-500'
              }`}>
                {hasError
                  ? errorMessage
                  : isProcessing
                  ? 'Processing file...'
                  : isDragActive
                  ? 'Drop the file here...'
                  : 'Drop a file here or click to upload'}
              </p>
              <p className="text-xs text-gray-400">
                Supported format: TXT (Max size: 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {uploadedFile?.name}
                </p>
                <p className="text-xs text-green-600">
                  File uploaded successfully
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-green-100 rounded-full transition-colors"
              disabled={disabled}
            >
              <X className="h-5 w-5 text-green-600" />
            </button>
          </div>
        </div>
      )}

      <textarea
        className={`w-full h-64 px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 ${
          disabled || isProcessing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
        }`}
        placeholder={uploadSuccess ? "File content loaded below..." : "Or paste your educational content here..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isProcessing}
      />
      
      <button
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
          disabled || isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
        onClick={onGenerate}
        disabled={disabled || isProcessing}
      >
        <Play className="h-5 w-5 mr-2" />
        Generate Video
      </button>
    </div>
  );
}