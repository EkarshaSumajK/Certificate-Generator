"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCSVReader } from '@/hooks/use-file-reader';
import { useCSVStore } from '@/stores/csv-store';
import { CSVParserService } from '@/lib/services/csv-parser.service';
import { CSVValidationOptions } from '@/lib/types/csv';

interface CSVUploadProps {
  onUploadComplete?: (success: boolean) => void;
  validationOptions?: CSVValidationOptions;
  maxFileSize?: number; // in bytes
  className?: string;
}

export function CSVUpload({ 
  onUploadComplete, 
  validationOptions = {},
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  className = "" 
}: CSVUploadProps) {
  const { readCSV, isReading, error: readerError, progress } = useCSVReader();
  const {
    setCsvData,
    setLoading,
    setError,
    setCurrentFile,
    clearData,
    isUploading,
    isParsing,
    error: storeError,
  } = useCSVStore();

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const processFile = useCallback(async (file: File) => {
    try {
      // Clear previous data and set loading states
      clearData();
      setCurrentFile(file);
      setLoading(true, false);
      setUploadStatus('idle');

      // Read the file using our file reader service
      const result = await readCSV(file, {
        maxSizeBytes: maxFileSize,
        allowedTypes: ['text/csv', 'application/csv', 'text/plain'],
      });

      if (!result.success) {
        setError(result.error);
        setUploadStatus('error');
        onUploadComplete?.(false);
        return;
      }

      // Set parsing state
      setLoading(false, true);

      // Parse the CSV content
      const parseResult = await CSVParserService.parseCSVContent(
        result.data,
        result.fileName,
        result.fileSize,
        validationOptions
      );

      setLoading(false, false);

      if (parseResult.success) {
        setCsvData(parseResult.data);
        setUploadStatus('success');
        onUploadComplete?.(true);
      } else {
        setError(parseResult.error + (parseResult.details ? ` ${parseResult.details}` : ''));
        setUploadStatus('error');
        onUploadComplete?.(false);
      }

    } catch (error) {
      setLoading(false, false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setUploadStatus('error');
      onUploadComplete?.(false);
    }
  }, [
    readCSV,
    maxFileSize,
    validationOptions,
    clearData,
    setCurrentFile,
    setLoading,
    setError,
    setCsvData,
    onUploadComplete
  ]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/csv': ['.csv'],
      'text/plain': ['.csv'],
    },
    maxFiles: 1,
    maxSize: maxFileSize,
    disabled: isUploading || isParsing,
  });

  const handleClear = () => {
    clearData();
    setUploadStatus('idle');
  };

  const error = readerError || storeError;
  const isLoading = isUploading || isParsing || isReading;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject ? 'border-primary bg-primary/5 scale-[1.02]' : ''}
          ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
          ${isLoading ? 'border-muted bg-muted/20 cursor-not-allowed' : 'border-border hover:border-primary/50 hover:bg-accent/50'}
          ${uploadStatus === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
          ${uploadStatus === 'error' ? 'border-destructive bg-destructive/5' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
            ${uploadStatus === 'success' ? 'bg-green-100 dark:bg-green-900/40 text-green-600' : ''}
            ${uploadStatus === 'error' ? 'bg-destructive/10 text-destructive' : ''}
            ${uploadStatus === 'idle' ? 'bg-primary/10 text-primary' : ''}
          `}>
            {uploadStatus === 'success' ? (
              <CheckCircle className="w-8 h-8" />
            ) : uploadStatus === 'error' ? (
              <AlertCircle className="w-8 h-8" />
            ) : isLoading ? (
              <FileText className="w-8 h-8 animate-pulse" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isUploading ? 'Reading file...' : isParsing ? 'Parsing CSV...' : 'Processing...'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we process your file
                </p>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                  File uploaded successfully!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your CSV file has been parsed and is ready for preview
                </p>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-destructive">
                  Upload failed
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please check the error below and try again
                </p>
              </div>
            ) : isDragActive ? (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  {isDragReject ? 'Invalid file type' : 'Drop your CSV file here'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isDragReject ? 'Only CSV files are accepted' : 'Release to upload'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Upload CSV File</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: .csv files up to {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                </p>
              </div>
            )}
          </div>

          {/* Browse Button (only show when not loading and no success) */}
          {!isLoading && uploadStatus !== 'success' && (
            <Button variant="outline" className="mt-4">
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          )}
        </div>

        {/* Clear button for success state */}
        {uploadStatus === 'success' && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">
            {progress}% complete
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Upload Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Requirements */}
      {validationOptions.requiredHeaders && validationOptions.requiredHeaders.length > 0 && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Required Headers</p>
              <p className="text-sm">
                Your CSV file must include these columns: {validationOptions.requiredHeaders.join(', ')}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
