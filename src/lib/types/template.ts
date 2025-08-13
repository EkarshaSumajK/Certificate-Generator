// Template data structure types
export interface TemplateData {
  id: string;
  name: string;
  dataUrl: string; // Base64 data URL of the image
  fileName: string;
  fileSize: number;
  fileType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  uploadedAt: Date;
}

// Template upload result
export interface TemplateUploadResult {
  success: true;
  data: TemplateData;
}

export interface TemplateUploadError {
  success: false;
  error: string;
  details?: string;
}

export type TemplateUploadResponse = TemplateUploadResult | TemplateUploadError;

// Template store state
export interface TemplateStoreState {
  // Current template data
  currentTemplate: TemplateData | null;
  
  // Loading states
  isUploading: boolean;
  uploadProgress: number;
  
  // Error states
  error: string | null;
  
  // File info
  currentFile: File | null;
  
  // Actions
  setTemplate: (template: TemplateData | null) => void;
  setLoading: (isUploading: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setCurrentFile: (file: File | null) => void;
  clearTemplate: () => void;
}

// Template validation options
export interface TemplateValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
}
