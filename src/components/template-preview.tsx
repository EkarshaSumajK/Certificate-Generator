"use client";

import React from 'react';
import Image from 'next/image';
import { Download, Eye, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrentTemplate, useTemplateStore } from '@/stores/template-store';

interface TemplatePreviewProps {
  className?: string;
  showActions?: boolean;
}

export function TemplatePreview({ 
  className = "",
  showActions = true
}: TemplatePreviewProps) {
  const template = useCurrentTemplate();
  const { clearTemplate } = useTemplateStore();

  if (!template) {
    return (
      <div className={`flex items-center justify-center p-8 border border-dashed border-border rounded-lg ${className}`}>
        <div className="text-center space-y-2">
          <Eye className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">No template uploaded</p>
          <p className="text-sm text-muted-foreground">Upload a template image to see the preview here</p>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = template.dataUrl;
    link.download = template.fileName;
    link.click();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this template?')) {
      clearTemplate();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with template info and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Template Preview</h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>📄 {template.fileName}</span>
            {template.dimensions && (
              <span>📐 {template.dimensions.width} × {template.dimensions.height}px</span>
            )}
            <span>📦 {formatFileSize(template.fileSize)}</span>
            <span>🕒 {template.uploadedAt.toLocaleDateString()}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        )}
      </div>

      {/* Template Info */}
      <Alert>
        <ImageIcon className="h-4 w-4" />
        <AlertDescription>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span> {template.name}
            </div>
            <div>
              <span className="font-medium">Type:</span> {template.fileType}
            </div>
            {template.dimensions && (
              <>
                <div>
                  <span className="font-medium">Width:</span> {template.dimensions.width}px
                </div>
                <div>
                  <span className="font-medium">Height:</span> {template.dimensions.height}px
                </div>
              </>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Image Preview */}
      <div className="border rounded-lg overflow-hidden bg-muted/30">
        <div className="p-4">
          <h4 className="font-medium mb-4">Image Preview</h4>
          <div className="flex justify-center">
            <div className="relative max-w-full">
              {template.fileType === 'image/svg+xml' ? (
                // For SVG files, use img tag to preserve vector quality
                <img
                  src={template.dataUrl}
                  alt={template.name}
                  className="max-w-full max-h-[500px] object-contain border border-border rounded-lg shadow-sm"
                />
              ) : (
                // For raster images, use Next.js Image component
                <div className="relative max-w-full max-h-[500px] border border-border rounded-lg overflow-hidden shadow-sm">
                  <Image
                    src={template.dataUrl}
                    alt={template.name}
                    width={template.dimensions?.width || 800}
                    height={template.dimensions?.height || 600}
                    className="max-w-full max-h-[500px] object-contain"
                    unoptimized // Since we're using data URLs
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Template Usage Tips */}
      <Alert>
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Template Usage Tips:</p>
            <ul className="text-sm space-y-1 list-disc list-inside ml-4">
              <li>This template will be used as the background for generated certificates</li>
              <li>Text and data from your CSV will be overlaid on this image</li>
              <li>Higher resolution images (300 DPI) work best for print quality</li>
              <li>Consider leaving space for text placement when designing your template</li>
              <li>SVG files maintain quality at any size and are recommended</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
