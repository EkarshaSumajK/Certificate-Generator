import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CSVStoreState, CSVData } from '@/lib/types/csv';

/**
 * Zustand store for managing CSV data state
 * Handles file upload, parsing, preview, and pagination
 */
export const useCSVStore = create<CSVStoreState>()(
  devtools(
    (set) => ({
      // Initial state
      csvData: null,
      isUploading: false,
      isParsing: false,
      uploadProgress: 0,
      error: null,
      currentFile: null,
      currentPage: 1,
      rowsPerPage: 10,

      // Actions
      setCsvData: (data: CSVData | null) =>
        set(
          (state) => ({
            ...state,
            csvData: data,
            currentPage: 1, // Reset to first page when new data is loaded
            error: null,
          }),
          false,
          'setCsvData'
        ),

      setLoading: (isUploading: boolean, isParsing: boolean) =>
        set(
          (state) => ({
            ...state,
            isUploading,
            isParsing,
            error: isUploading || isParsing ? null : state.error, // Clear error when starting new operation
          }),
          false,
          'setLoading'
        ),

      setProgress: (progress: number) =>
        set(
          (state) => ({
            ...state,
            uploadProgress: Math.max(0, Math.min(100, progress)), // Clamp between 0-100
          }),
          false,
          'setProgress'
        ),

      setError: (error: string | null) =>
        set(
          (state) => ({
            ...state,
            error,
            isUploading: false,
            isParsing: false,
          }),
          false,
          'setError'
        ),

      setCurrentFile: (file: File | null) =>
        set(
          (state) => ({
            ...state,
            currentFile: file,
            uploadProgress: 0,
            error: null,
          }),
          false,
          'setCurrentFile'
        ),

      clearData: () =>
        set(
          () => ({
            csvData: null,
            isUploading: false,
            isParsing: false,
            uploadProgress: 0,
            error: null,
            currentFile: null,
            currentPage: 1,
            rowsPerPage: 10,
          }),
          false,
          'clearData'
        ),

      setPagination: (page: number, rowsPerPage: number) =>
        set(
          (state) => ({
            ...state,
            currentPage: Math.max(1, page),
            rowsPerPage: Math.max(1, rowsPerPage),
          }),
          false,
          'setPagination'
        ),


    }),
    {
      name: 'csv-store', // Name for Redux DevTools
    }
  )
);

// Selector hooks for better performance
export const useCSVData = () => useCSVStore((state) => state.csvData);

export const useCSVLoading = () => useCSVStore((state) => ({ 
  isUploading: state.isUploading, 
  isParsing: state.isParsing,
  uploadProgress: state.uploadProgress
}));

export const useCSVError = () => useCSVStore((state) => state.error);

// Individual selectors to avoid object recreation
export const useCSVCurrentPage = () => useCSVStore((state) => state.currentPage);
export const useCSVRowsPerPage = () => useCSVStore((state) => state.rowsPerPage);
export const useCSVTotalPages = () => useCSVStore((state) => {
  if (!state.csvData) return 0;
  return Math.ceil(state.csvData.totalRows / state.rowsPerPage);
});
// Note: Removed useCSVCurrentPageData to avoid infinite loops
// Components should calculate current page data using useMemo locally

// Combined pagination hook
export const useCSVPagination = () => {
  const currentPage = useCSVCurrentPage();
  const rowsPerPage = useCSVRowsPerPage();
  const totalPages = useCSVTotalPages();
  const { setPagination } = useCSVStore();
  
  return {
    currentPage,
    rowsPerPage,
    totalPages,
    setPagination,
  };
};
