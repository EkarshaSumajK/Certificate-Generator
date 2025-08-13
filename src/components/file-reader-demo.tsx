"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useFileReader } from '@/hooks/use-file-reader';
import { Button } from '@/components/ui/button';

/**
 * Demo component to test the FileReader service and hook
 * This can be used for testing and as a reference for implementation
 */
export function FileReaderDemo() {
  const {
    readImageAsDataURL,
    readCSVAsText,
    isReading,
    error,
    progress,
    reset,
    formatFileSize,
  } = useFileReader();

  const [imageData, setImageData] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    reset();
    const result = await readImageAsDataURL(file);
    
    if (result.success) {
      setImageData(result.data);
      console.log('Image loaded:', {
        fileName: result.fileName,
        fileSize: formatFileSize(result.fileSize),
        fileType: result.fileType,
      });
    } else {
      console.error('Failed to load image:', result.error);
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    reset();
    const result = await readCSVAsText(file);
    
    if (result.success) {
      setCsvData(result.data);
      console.log('CSV loaded:', {
        fileName: result.fileName,
        fileSize: formatFileSize(result.fileSize),
        fileType: result.fileType,
        preview: result.data.substring(0, 200) + '...',
      });
    } else {
      console.error('Failed to load CSV:', result.error);
    }
  };

  const handleReset = () => {
    reset();
    setImageData(null);
    setCsvData(null);
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">File Reader Service Demo</h2>
        <p className="text-muted-foreground">
          Test the FileReader service with image and CSV files
        </p>
      </div>

      {/* Status */}
      {isReading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span>Reading file...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 dark:text-red-200">Error</h4>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Image Upload Test</h3>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isReading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-muted-foreground">
              Supported: JPEG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>
          
          {imageData && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview:</p>
              <div className="relative max-w-full h-64 rounded-lg border border-border overflow-hidden">
                <Image
                  src={imageData}
                  alt="Uploaded preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* CSV Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">CSV Upload Test</h3>
          <div className="space-y-2">
            <input
              type="file"
              accept=".csv,text/csv,application/csv"
              onChange={handleCSVUpload}
              disabled={isReading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <p className="text-sm text-muted-foreground">
              Supported: CSV files (max 10MB)
            </p>
          </div>
          
          {csvData && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Content preview:</p>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
                {csvData.substring(0, 500)}
                {csvData.length > 500 && '\n...\n[Content truncated]'}
              </pre>
              <p className="text-xs text-muted-foreground">
                Total length: {csvData.length} characters
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleReset} variant="outline">
          Reset Demo
        </Button>
      </div>

      {/* Usage Examples */}
      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-semibold mb-2">Usage Examples:</h4>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Service:</strong> <code>FileReaderService.readImageAsDataURL(file)</code>
          </div>
          <div>
            <strong>Hook:</strong> <code>const {`{ readImageAsDataURL, isReading, error }`} = useFileReader()</code>
          </div>
          <div>
            <strong>Validation:</strong> <code>FileReaderService.isImageFile(file)</code>
          </div>
        </div>
      </div>
    </div>
  );
}
