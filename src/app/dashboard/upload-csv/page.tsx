"use client";

import React, { useState } from 'react';
import { ArrowLeft, FileSpreadsheet, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CSVUpload } from '@/components/csv-upload';
import { CSVPreview } from '@/components/csv-preview';
import { useCSVData, useCSVError } from '@/stores/csv-store';
import { useCurrentTemplate } from '@/stores/template-store';
import { WorkflowProgress } from '@/components/workflow-progress';

export default function UploadCSVPage() {
  const csvData = useCSVData();
  const error = useCSVError();
  const template = useCurrentTemplate();
  const [uploadComplete, setUploadComplete] = useState(false);

  // Determine workflow progress
  const completedSteps: ('csv' | 'template' | 'editor')[] = [];
  if (csvData) completedSteps.push('csv');
  if (template) completedSteps.push('template');

  const handleUploadComplete = (success: boolean) => {
    setUploadComplete(success);
  };

  const handleContinue = () => {
    // Direct to template upload as next step
    window.location.href = '/dashboard/upload-template';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
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
            <FileSpreadsheet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Upload CSV Data</h1>
            <p className="text-muted-foreground">
              Upload a CSV file containing recipient information for bulk certificate generation
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="mb-8">
        <WorkflowProgress 
          currentStep="csv"
          completedSteps={completedSteps}
        />
      </div>

      {/* Instructions */}
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">CSV Format Requirements:</p>
            <ul className="text-sm space-y-1 list-disc list-inside ml-4">
              <li>First row should contain column headers (e.g., Name, Email, Course, Date)</li>
              <li>Each subsequent row should contain recipient data</li>
              <li>Common headers: Name, Email, Course, Completion Date, Grade, Institution</li>
              <li>File size limit: 10MB</li>
              <li>Supported formats: .csv files</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">1. Upload Your CSV File</h2>
            <CSVUpload
              onUploadComplete={handleUploadComplete}
              validationOptions={{
                minRows: 1,
                maxRows: 10000,
                allowEmptyRows: false,
              }}
              maxFileSize={10 * 1024 * 1024} // 10MB
            />
          </div>

          {/* Upload Status */}
          {uploadComplete && csvData && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Upload Successful!</p>
                  <p className="text-sm">
                    Loaded {csvData.totalRows} rows with {csvData.headers.length} columns.
                    Review the data preview and continue when ready.
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
            <h2 className="text-lg font-semibold mb-4">2. Preview Your Data</h2>
            <CSVPreview 
              className="min-h-[400px]"
              showStats={true}
              maxDisplayColumns={8}
            />
          </div>

          {/* Data Validation Tips */}
          {csvData && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Data Quality Tips:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                    <li>Ensure all required fields are filled</li>
                    <li>Check for consistent date formats</li>
                    <li>Verify email addresses are valid</li>
                    <li>Remove or fix any duplicate entries</li>
                    <li>Confirm names are properly capitalized</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions Section - Moved after preview */}
        {csvData && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Next Steps</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your CSV data is ready! You can now proceed to create certificates using this data.
              </p>
                              <div className="flex gap-2">
                  <Button onClick={handleContinue} className="flex-1">
                    Next: Upload Template
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Upload Different File
                  </Button>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Sample CSV Format */}
      {!csvData && (
        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Sample CSV Format</h3>
          <div className="bg-background border rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <div className="whitespace-pre">
{`Name,Email,Course,Completion Date,Grade,Institution
John Doe,john.doe@email.com,Web Development,2024-01-15,A+,Tech Academy
Jane Smith,jane.smith@email.com,Data Science,2024-01-20,A,Tech Academy
Mike Johnson,mike.j@email.com,UI/UX Design,2024-01-22,B+,Tech Academy`}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Copy this format or download a sample template to get started.
          </p>
        </div>
      )}
    </div>
  );
}
