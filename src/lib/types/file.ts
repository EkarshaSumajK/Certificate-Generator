// File reading result types
export interface FileReadResult<T> {
  success: true;
  data: T;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface FileReadError {
  success: false;
  error: string;
  code: FileErrorCode;
  fileName?: string;
}

export type FileReadResponse<T> = FileReadResult<T> | FileReadError;

// Error codes for different file reading scenarios
export enum FileErrorCode {
  FILE_NOT_PROVIDED = 'FILE_NOT_PROVIDED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  READ_ERROR = 'READ_ERROR',
  UNSUPPORTED_BROWSER = 'UNSUPPORTED_BROWSER',
}

// Configuration options for file reading
export interface FileReadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  encoding?: string; // For text files
}

// Specific options for different file types
export interface ImageReadOptions extends FileReadOptions {
  maxSizeBytes?: number; // Default: 5MB
  allowedTypes?: string[]; // Default: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}

export interface CSVReadOptions extends FileReadOptions {
  maxSizeBytes?: number; // Default: 10MB
  allowedTypes?: string[]; // Default: ['text/csv', 'application/csv', 'text/plain']
  encoding?: string; // Default: 'UTF-8'
}

// Hook state interface
export interface UseFileReaderState {
  isReading: boolean;
  error: string | null;
  progress: number; // 0-100
}
