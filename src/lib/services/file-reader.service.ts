import {
  FileReadResponse,
  FileErrorCode,
  ImageReadOptions,
  CSVReadOptions,
  FileReadOptions,
} from '@/lib/types/file';

/**
 * FileReaderService - A utility service for reading files using the browser's FileReader API
 * Provides promise-based methods for reading images and CSV files with proper error handling
 */
export class FileReaderService {
  /**
   * Default options for image file reading
   */
  private static readonly DEFAULT_IMAGE_OPTIONS: Required<ImageReadOptions> = {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    encoding: 'UTF-8',
  };

  /**
   * Default options for CSV file reading
   */
  private static readonly DEFAULT_CSV_OPTIONS: Required<CSVReadOptions> = {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['text/csv', 'application/csv', 'text/plain'],
    encoding: 'UTF-8',
  };

  /**
   * Check if FileReader API is supported
   */
  private static isFileReaderSupported(): boolean {
    return typeof window !== 'undefined' && 'FileReader' in window;
  }

  /**
   * Validate file against options
   */
  private static validateFile(
    file: File,
    options: Required<FileReadOptions>
  ): FileReadResponse<never> | null {
    if (!file) {
      return {
        success: false,
        error: 'No file provided',
        code: FileErrorCode.FILE_NOT_PROVIDED,
      };
    }

    if (file.size > options.maxSizeBytes) {
      return {
        success: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(options.maxSizeBytes / 1024 / 1024).toFixed(2)}MB)`,
        code: FileErrorCode.FILE_TOO_LARGE,
        fileName: file.name,
      };
    }

    if (options.allowedTypes.length > 0 && !options.allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `File type "${file.type}" is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`,
        code: FileErrorCode.INVALID_FILE_TYPE,
        fileName: file.name,
      };
    }

    return null; // No validation errors
  }

  /**
   * Generic file reader method
   */
  private static readFile<T>(
    file: File,
    readMethod: (reader: FileReader, file: File) => void,
    options: Required<FileReadOptions>
  ): Promise<FileReadResponse<T>> {
    return new Promise((resolve) => {
      // Check browser support
      if (!this.isFileReaderSupported()) {
        resolve({
          success: false,
          error: 'FileReader API is not supported in this browser',
          code: FileErrorCode.UNSUPPORTED_BROWSER,
          fileName: file.name,
        });
        return;
      }

      // Validate file
      const validationError = this.validateFile(file, options);
      if (validationError) {
        resolve(validationError as FileReadResponse<T>);
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result;
        if (result) {
          resolve({
            success: true,
            data: result as T,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          });
        } else {
          resolve({
            success: false,
            error: 'Failed to read file - no result returned',
            code: FileErrorCode.READ_ERROR,
            fileName: file.name,
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: `Failed to read file: ${reader.error?.message || 'Unknown error'}`,
          code: FileErrorCode.READ_ERROR,
          fileName: file.name,
        });
      };

      reader.onabort = () => {
        resolve({
          success: false,
          error: 'File reading was aborted',
          code: FileErrorCode.READ_ERROR,
          fileName: file.name,
        });
      };

      // Start reading
      readMethod(reader, file);
    });
  }

  /**
   * Read an image file as a Data URL (base64)
   * @param file - The image file to read
   * @param options - Optional configuration for reading
   * @returns Promise that resolves with the image data URL or error
   */
  public static async readImageAsDataURL(
    file: File,
    options: Partial<ImageReadOptions> = {}
  ): Promise<FileReadResponse<string>> {
    const mergedOptions = { ...this.DEFAULT_IMAGE_OPTIONS, ...options };

    return this.readFile<string>(
      file,
      (reader, file) => reader.readAsDataURL(file),
      mergedOptions
    );
  }

  /**
   * Read a CSV file as text string
   * @param file - The CSV file to read
   * @param options - Optional configuration for reading
   * @returns Promise that resolves with the CSV text content or error
   */
  public static async readCSVAsText(
    file: File,
    options: Partial<CSVReadOptions> = {}
  ): Promise<FileReadResponse<string>> {
    const mergedOptions = { ...this.DEFAULT_CSV_OPTIONS, ...options };

    return this.readFile<string>(
      file,
      (reader, file) => reader.readAsText(file, mergedOptions.encoding),
      mergedOptions
    );
  }

  /**
   * Read any text file as string
   * @param file - The text file to read
   * @param options - Optional configuration for reading
   * @returns Promise that resolves with the text content or error
   */
  public static async readTextFile(
    file: File,
    options: Partial<FileReadOptions> = {}
  ): Promise<FileReadResponse<string>> {
    const defaultOptions: Required<FileReadOptions> = {
      maxSizeBytes: 50 * 1024 * 1024, // 50MB
      allowedTypes: [], // Allow all types
      encoding: 'UTF-8',
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return this.readFile<string>(
      file,
      (reader, file) => reader.readAsText(file, mergedOptions.encoding),
      mergedOptions
    );
  }

  /**
   * Read file as ArrayBuffer (useful for binary files)
   * @param file - The file to read
   * @param options - Optional configuration for reading
   * @returns Promise that resolves with the ArrayBuffer or error
   */
  public static async readAsArrayBuffer(
    file: File,
    options: Partial<FileReadOptions> = {}
  ): Promise<FileReadResponse<ArrayBuffer>> {
    const defaultOptions: Required<FileReadOptions> = {
      maxSizeBytes: 100 * 1024 * 1024, // 100MB
      allowedTypes: [], // Allow all types
      encoding: 'UTF-8',
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return this.readFile<ArrayBuffer>(
      file,
      (reader, file) => reader.readAsArrayBuffer(file),
      mergedOptions
    );
  }

  /**
   * Utility method to check if a file is an image
   */
  public static isImageFile(file: File): boolean {
    return this.DEFAULT_IMAGE_OPTIONS.allowedTypes.includes(file.type);
  }

  /**
   * Utility method to check if a file is a CSV
   */
  public static isCSVFile(file: File): boolean {
    return this.DEFAULT_CSV_OPTIONS.allowedTypes.includes(file.type) || 
           file.name.toLowerCase().endsWith('.csv');
  }

  /**
   * Format file size in human readable format
   */
  public static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
