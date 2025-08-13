import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TemplateStoreState, TemplateData } from '@/lib/types/template';

/**
 * Zustand store for managing template image state
 * Handles template upload, preview, and storage
 */
export const useTemplateStore = create<TemplateStoreState>()(
  devtools(
    (set) => ({
      // Initial state
      currentTemplate: null,
      isUploading: false,
      uploadProgress: 0,
      error: null,
      currentFile: null,

      // Actions
      setTemplate: (template: TemplateData | null) =>
        set(
          (state) => ({
            ...state,
            currentTemplate: template,
            error: null,
          }),
          false,
          'setTemplate'
        ),

      setLoading: (isUploading: boolean) =>
        set(
          (state) => ({
            ...state,
            isUploading,
            error: isUploading ? null : state.error, // Clear error when starting new operation
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

      clearTemplate: () =>
        set(
          () => ({
            currentTemplate: null,
            isUploading: false,
            uploadProgress: 0,
            error: null,
            currentFile: null,
          }),
          false,
          'clearTemplate'
        ),
    }),
    {
      name: 'template-store', // Name for Redux DevTools
    }
  )
);

// Selector hooks for better performance
export const useCurrentTemplate = () => useTemplateStore((state) => state.currentTemplate);
export const useTemplateLoading = () => useTemplateStore((state) => ({ 
  isUploading: state.isUploading, 
  uploadProgress: state.uploadProgress
}));
export const useTemplateError = () => useTemplateStore((state) => state.error);
