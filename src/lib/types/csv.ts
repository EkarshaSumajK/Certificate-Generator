// CSV data structure types
export interface CSVData {
  headers: string[];
  rows: Record<string, string | number | boolean | null>[];
  totalRows: number;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

// CSV parsing result
export interface CSVParseResult {
  success: true;
  data: CSVData;
}

export interface CSVParseError {
  success: false;
  error: string;
  details?: string;
}

export type CSVParseResponse = CSVParseResult | CSVParseError;

// CSV store state
export interface CSVStoreState {
  // Current CSV data
  csvData: CSVData | null;
  
  // Loading states
  isUploading: boolean;
  isParsing: boolean;
  uploadProgress: number;
  
  // Error states
  error: string | null;
  
  // File info
  currentFile: File | null;
  
  // Pagination for large datasets
  currentPage: number;
  rowsPerPage: number;
  
  // Actions
  setCsvData: (data: CSVData | null) => void;
  setLoading: (isUploading: boolean, isParsing: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setCurrentFile: (file: File | null) => void;
  clearData: () => void;
  setPagination: (page: number, rowsPerPage: number) => void;
}

// CSV validation options
export interface CSVValidationOptions {
  requiredHeaders?: string[];
  minRows?: number;
  maxRows?: number;
  allowEmptyRows?: boolean;
}

// CSV statistics
export interface CSVStats {
  totalRows: number;
  totalColumns: number;
  emptyRows: number;
  duplicateRows: number;
  columnStats: {
    [key: string]: {
      emptyValues: number;
      uniqueValues: number;
      dataType: 'string' | 'number' | 'date' | 'mixed';
    };
  };
}
