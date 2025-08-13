"use client";

import { useState, useCallback } from 'react';
import { FileReaderService } from '@/lib/services/file-reader.service';
import {
  FileReadResponse,
  UseFileReaderState,
  ImageReadOptions,
  CSVReadOptions,
  FileReadOptions,
} from '@/lib/types/file';

/**
 * Custom hook for file reading operations with state management
 * Provides an easy-to-use interface for reading files in React components
 */
export function useFileReader() {
  const [state, setState] = useState<UseFileReaderState>({
    isReading: false,
    error: null,
    progress: 0,
  });

  /**
   * Reset the state
   */
  const reset = useCallback(() => {
    setState({
      isReading: false,
      error: null,
      progress: 0,
    });
  }, []);

  /**
   * Read an image file as Data URL
   */
  const readImageAsDataURL = useCallback(
    async (
      file: File,
      options?: Partial<ImageReadOptions>
    ): Promise<FileReadResponse<string>> => {
      setState({
        isReading: true,
        error: null,
        progress: 0,
      });

      try {
        // Simulate progress for better UX
        setState(prev => ({ ...prev, progress: 25 }));
        
        const result = await FileReaderService.readImageAsDataURL(file, options);
        
        setState(prev => ({ ...prev, progress: 100 }));

        if (result.success) {
          setState({
            isReading: false,
            error: null,
            progress: 100,
          });
        } else {
          setState({
            isReading: false,
            error: result.error,
            progress: 0,
          });
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setState({
          isReading: false,
          error: errorMessage,
          progress: 0,
        });

        return {
          success: false,
          error: errorMessage,
          code: 'READ_ERROR' as any,
          fileName: file.name,
        };
      }
    },
    []
  );

  /**
   * Read a CSV file as text
   */
  const readCSVAsText = useCallback(
    async (
      file: File,
      options?: Partial<CSVReadOptions>
    ): Promise<FileReadResponse<string>> => {
      setState({
        isReading: true,
        error: null,
        progress: 0,
      });

      try {
        // Simulate progress for better UX
        setState(prev => ({ ...prev, progress: 25 }));
        
        const result = await FileReaderService.readCSVAsText(file, options);
        
        setState(prev => ({ ...prev, progress: 100 }));

        if (result.success) {
          setState({
            isReading: false,
            error: null,
            progress: 100,
          });
        } else {
          setState({
            isReading: false,
            error: result.error,
            progress: 0,
          });
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setState({
          isReading: false,
          error: errorMessage,
          progress: 0,
        });

        return {
          success: false,
          error: errorMessage,
          code: 'READ_ERROR' as any,
          fileName: file.name,
        };
      }
    },
    []
  );

  /**
   * Read any text file
   */
  const readTextFile = useCallback(
    async (
      file: File,
      options?: Partial<FileReadOptions>
    ): Promise<FileReadResponse<string>> => {
      setState({
        isReading: true,
        error: null,
        progress: 0,
      });

      try {
        setState(prev => ({ ...prev, progress: 25 }));
        
        const result = await FileReaderService.readTextFile(file, options);
        
        setState(prev => ({ ...prev, progress: 100 }));

        if (result.success) {
          setState({
            isReading: false,
            error: null,
            progress: 100,
          });
        } else {
          setState({
            isReading: false,
            error: result.error,
            progress: 0,
          });
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setState({
          isReading: false,
          error: errorMessage,
          progress: 0,
        });

        return {
          success: false,
          error: errorMessage,
          code: 'READ_ERROR' as any,
          fileName: file.name,
        };
      }
    },
    []
  );

  /**
   * Read file as ArrayBuffer
   */
  const readAsArrayBuffer = useCallback(
    async (
      file: File,
      options?: Partial<FileReadOptions>
    ): Promise<FileReadResponse<ArrayBuffer>> => {
      setState({
        isReading: true,
        error: null,
        progress: 0,
      });

      try {
        setState(prev => ({ ...prev, progress: 25 }));
        
        const result = await FileReaderService.readAsArrayBuffer(file, options);
        
        setState(prev => ({ ...prev, progress: 100 }));

        if (result.success) {
          setState({
            isReading: false,
            error: null,
            progress: 100,
          });
        } else {
          setState({
            isReading: false,
            error: result.error,
            progress: 0,
          });
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setState({
          isReading: false,
          error: errorMessage,
          progress: 0,
        });

        return {
          success: false,
          error: errorMessage,
          code: 'READ_ERROR' as any,
          fileName: file.name,
        };
      }
    },
    []
  );

  return {
    // State
    isReading: state.isReading,
    error: state.error,
    progress: state.progress,
    
    // Actions
    readImageAsDataURL,
    readCSVAsText,
    readTextFile,
    readAsArrayBuffer,
    reset,
    
    // Utility methods (direct access to service methods)
    isImageFile: FileReaderService.isImageFile,
    isCSVFile: FileReaderService.isCSVFile,
    formatFileSize: FileReaderService.formatFileSize,
  };
}

/**
 * Simplified hook for just image reading
 */
export function useImageReader() {
  const { readImageAsDataURL, isReading, error, progress, reset, isImageFile, formatFileSize } = useFileReader();
  
  return {
    readImage: readImageAsDataURL,
    isReading,
    error,
    progress,
    reset,
    isImageFile,
    formatFileSize,
  };
}

/**
 * Simplified hook for just CSV reading
 */
export function useCSVReader() {
  const { readCSVAsText, isReading, error, progress, reset, isCSVFile, formatFileSize } = useFileReader();
  
  return {
    readCSV: readCSVAsText,
    isReading,
    error,
    progress,
    reset,
    isCSVFile,
    formatFileSize,
  };
}
