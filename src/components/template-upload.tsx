"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useImageReader } from '@/hooks/use-file-reader';
import { useTemplateStore } from '@/stores/template-store';
import { TemplateData, TemplateValidationOptions } from '@/lib/types/template';

interface TemplateUploadProps {
  onUploadComplete?: (success: boolean) => void;
  validationOptions?: TemplateValidationOptions;
  maxFileSize?: number; // in bytes
  className?: string;
}

export function TemplateUpload({ 
  onUploadComplete, 
  validationOptions = {},
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  className = "" 
}: TemplateUploadProps) {
  const { readImage, isReading, error: readerError, progress } = useImageReader();
  const {
    setTemplate,
    setLoading,
    setError,
    setCurrentFile,
    clearTemplate,
    isUploading,
    error: storeError,
  } = useTemplateStore();

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  const processFile = useCallback(async (file: File) => {
    try {
      // Clear previous data and set loading states
      clearTemplate();
      setCurrentFile(file);
      setLoading(true);
      setUploadStatus('idle');

      // Read the file using our file reader service
      const result = await readImage(file, {
        maxSizeBytes: maxFileSize,
        allowedTypes: validationOptions.allowedTypes || ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
      });

      if (!result.success) {
        setError(result.error);
        setUploadStatus('error');
        onUploadComplete?.(false);
        return;
      }

      // Get image dimensions
      let dimensions;
      try {
        dimensions = await getImageDimensions(result.data);
        
        // Validate dimensions if specified
        if (validationOptions.maxWidth && dimensions.width > validationOptions.maxWidth) {
          setError(`Image width (${dimensions.width}px) exceeds maximum allowed (${validationOptions.maxWidth}px)`);
          setUploadStatus('error');
          onUploadComplete?.(false);
          return;
        }
        
        if (validationOptions.maxHeight && dimensions.height > validationOptions.maxHeight) {
          setError(`Image height (${dimensions.height}px) exceeds maximum allowed (${validationOptions.maxHeight}px)`);
          setUploadStatus('error');
          onUploadComplete?.(false);
          return;
        }
        
        if (validationOptions.minWidth && dimensions.width < validationOptions.minWidth) {
          setError(`Image width (${dimensions.width}px) is below minimum required (${validationOptions.minWidth}px)`);
          setUploadStatus('error');
          onUploadComplete?.(false);
          return;
        }
        
        if (validationOptions.minHeight && dimensions.height < validationOptions.minHeight) {
          setError(`Image height (${dimensions.height}px) is below minimum required (${validationOptions.minHeight}px)`);
          setUploadStatus('error');
          onUploadComplete?.(false);
          return;
        }
      } catch (error) {
        console.warn('Could not determine image dimensions:', error);
      }

      // Create template data
      const templateData: TemplateData = {
        id: `template-${Date.now()}`,
        name: result.fileName.replace(/\.[^/.]+$/, ''), // Remove extension
        dataUrl: result.data,
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileType: result.fileType,
        dimensions,
        uploadedAt: new Date(),
      };

      setTemplate(templateData);
      setLoading(false);
      setUploadStatus('success');
      onUploadComplete?.(true);

    } catch (error) {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setUploadStatus('error');
      onUploadComplete?.(false);
    }
  }, [
    readImage,
    maxFileSize,
    validationOptions,
    clearTemplate,
    setCurrentFile,
    setLoading,
    setError,
    setTemplate,
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
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/svg+xml': ['.svg'],
    },
    maxFiles: 1,
    maxSize: maxFileSize,
    disabled: isUploading || isReading,
  });

  const handleClear = () => {
    clearTemplate();
    setUploadStatus('idle');
  };

  const error = readerError || storeError;
  const isLoading = isUploading || isReading;

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
              <ImageIcon className="w-8 h-8 animate-pulse" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Processing image...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we process your template image
                </p>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                  Template uploaded successfully!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your template image is ready for use
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
                  {isDragReject ? 'Invalid file type' : 'Drop your image here'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isDragReject ? 'Only PNG, JPG, and SVG files are accepted' : 'Release to upload'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Upload Template Image</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your template image here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: PNG, JPG, SVG files up to {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                </p>
              </div>
            )}
          </div>

          {/* Browse Button (only show when not loading and no success) */}
          {!isLoading && uploadStatus !== 'success' && (
            <Button variant="outline" className="mt-4">
              <Upload className="w-4 h-4 mr-2" />
              Browse Images
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

      {/* Image Requirements */}
      {(validationOptions.maxWidth || validationOptions.maxHeight || validationOptions.minWidth || validationOptions.minHeight) && (
        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Image Requirements</p>
              <div className="text-sm space-y-1">
                {validationOptions.minWidth && (
                  <p>Minimum width: {validationOptions.minWidth}px</p>
                )}
                {validationOptions.minHeight && (
                  <p>Minimum height: {validationOptions.minHeight}px</p>
                )}
                {validationOptions.maxWidth && (
                  <p>Maximum width: {validationOptions.maxWidth}px</p>
                )}
                {validationOptions.maxHeight && (
                  <p>Maximum height: {validationOptions.maxHeight}px</p>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
