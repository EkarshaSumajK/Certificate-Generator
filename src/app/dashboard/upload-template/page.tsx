"use client";

import React, { useState } from 'react';
import { ArrowLeft, ImageIcon, CheckCircle, AlertTriangle, Info, Palette } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TemplateUpload } from '@/components/template-upload';
import { TemplatePreview } from '@/components/template-preview';
import { useCurrentTemplate, useTemplateError } from '@/stores/template-store';
import { useCSVData } from '@/stores/csv-store';
import { WorkflowProgress } from '@/components/workflow-progress';

export default function UploadTemplatePage() {
  const template = useCurrentTemplate();
  const error = useTemplateError();
  const csvData = useCSVData();
  const [uploadComplete, setUploadComplete] = useState(false);

  // Determine workflow progress
  const completedSteps: ('csv' | 'template' | 'editor')[] = [];
  if (csvData) completedSteps.push('csv');
  if (template) completedSteps.push('template');

  const handleUploadComplete = (success: boolean) => {
    setUploadComplete(success);
  };

  const handleContinue = () => {
    // Direct to certificate editor as final step
    window.location.href = '/dashboard/create';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ImageIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Upload Certificate Template</h1>
            <p className="text-muted-foreground">
              Upload a template image that will be used as the background for your certificates
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="mb-8">
        <WorkflowProgress 
          currentStep="template"
          completedSteps={completedSteps}
        />
      </div>

      {/* Instructions */}
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Template Requirements:</p>
            <ul className="text-sm space-y-1 list-disc list-inside ml-4">
              <li>Supported formats: PNG, JPG, JPEG, SVG</li>
              <li>Maximum file size: 5MB</li>
              <li>Recommended: High resolution images (300 DPI) for print quality</li>
              <li>Leave space for text placement (recipient name, course, date, etc.)</li>
              <li>SVG format recommended for scalable vector graphics</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">1. Upload Your Template Image</h2>
            <TemplateUpload
              onUploadComplete={handleUploadComplete}
              validationOptions={{
                maxSizeBytes: 5 * 1024 * 1024, // 5MB
                allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
                // Optional dimension constraints
                // minWidth: 800,
                // minHeight: 600,
              }}
              maxFileSize={5 * 1024 * 1024} // 5MB
            />
          </div>

          {/* Upload Status */}
          {uploadComplete && template && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Template Uploaded Successfully!</p>
                  <p className="text-sm">
                    Your template &quot;{template.name}&quot; is ready to use. 
                    {template.dimensions && ` Dimensions: ${template.dimensions.width} × ${template.dimensions.height}px.`}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Upload Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">2. Preview Your Template</h2>
            <TemplatePreview 
              className="min-h-[400px]"
              showActions={true}
            />
          </div>

          {/* Design Tips */}
          {template && (
            <Alert>
              <Palette className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Design Tips for Better Certificates:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                    <li>Use high contrast colors for text readability</li>
                    <li>Consider the placement of dynamic text elements</li>
                    <li>Test with different name lengths to ensure proper fit</li>
                    <li>Include your organization&apos;s branding and logos</li>
                    <li>Maintain consistent margins and spacing</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions Section */}
        {template && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Next Steps</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your template is ready! You can now proceed to map CSV fields to positions on your certificate 
                or generate certificates directly.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleContinue} className="flex-1">
                  Next: Create Certificates
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Upload Different Template
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Examples */}
      {!template && (
        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Template Design Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">✅ Good Template Practices</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>High resolution (300 DPI minimum)</li>
                <li>Clear, uncluttered design</li>
                <li>Space reserved for dynamic text</li>
                <li>Professional color scheme</li>
                <li>Readable fonts and proper contrast</li>
                <li>Organization branding included</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">❌ Avoid These Issues</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Low resolution or pixelated images</li>
                <li>Overcrowded design elements</li>
                <li>Poor color contrast</li>
                <li>No space for variable text</li>
                <li>Unprofessional or informal design</li>
                <li>Missing essential information areas</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
