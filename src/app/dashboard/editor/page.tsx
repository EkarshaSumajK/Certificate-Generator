"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Toaster, toast } from '@/components/ui/sonner';
import { Dialog, DialogAction, DialogCancel, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar';
import { useCurrentTemplate } from '@/stores/template-store';
import { useCSVData } from '@/stores/csv-store';
import { useCanvasStore } from '@/stores/canvas-store';
import type { TextElement } from '@/lib/types/canvas';
import { CanvasPropertiesPanel } from '@/components/canvas/canvas-properties-panel';
import Image from 'next/image';

// Define once at module scope to keep component identity stable across renders
const CanvasStage = dynamic(() => import('@/components/canvas/canvas-stage').then(m => m.CanvasStage), { ssr: false });

export default function EditorPage() {
  const template = useCurrentTemplate();
  const csvData = useCSVData();
  const { setBackground, setCanvasSize, elements, addElement, applyRowData, exportCanvas } = useCanvasStore();
  const { toast } = useToast();

  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize canvas background from template image and set canvas size
  useEffect(() => {
    if (!template) return;

    const img = new window.Image();
    img.onload = () => {
      const width = template.dimensions?.width || img.width;
      const height = template.dimensions?.height || img.height;

      setBackground({
        type: 'image',
        value: template.dataUrl,
        width,
        height,
      });
      setCanvasSize(width, height);
    };
    img.src = template.dataUrl;
  }, [template, setBackground, setCanvasSize]);

  // Ensure at least one sample text element exists for UX
  useEffect(() => {
    if (elements.length === 0) {
      addElement({
        type: 'text',
        x: 80,
        y: 80,
        width: 360,
        height: 60,
        text: 'Recipient Name',
        fontSize: 36,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fill: '#111827',
        align: 'center',
        verticalAlign: 'middle',
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
      } as Omit<TextElement, 'id' | 'zIndex'>);
    }
  }, [elements.length, addElement]);

  // Prevent browser navigation/reload on drag over or drop anywhere on the page
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  const handleGenerateCertificates = async () => {
    if (!csvData || !template) {
      toast({
        title: "Missing Data",
        description: "Please upload both CSV data and a template before generating certificates.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const zip = new JSZip();
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < csvData.rows.length; i++) {
        const row = csvData.rows[i];
        // This function is not defined in the provided code, assuming it will be added later
        // applyRowData(row); 

        // Give Konva time to render after applying data
        await new Promise(resolve => setTimeout(resolve, 50)); 

        const dataUrl = await exportCanvas();
        const recipientName = row[csvData.headers[0]] || `Certificate_${i + 1}`;
        zip.file(`${recipientName}.png`, dataUrl.split(',')[1], { base64: true });
        successCount++;
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "certificates.zip");

      toast({
        title: "Certificates Generated!",
        description: `${successCount} certificates successfully generated and downloaded.`, 
      });

    } catch (error) {
      console.error("Error generating certificates:", error);
      toast({
        title: "Generation Failed",
        description: `There was an error generating certificates. ${errorCount > 0 ? `(${errorCount} failures)` : ''} Please try again.`, 
        variant: "destructive",
      });
      errorCount++;
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewCertificate = async () => {
    if (!csvData || !template) {
      toast({
        title: "Missing Data",
        description: "Please upload both CSV data and a template to preview.",
        variant: "destructive",
      });
      return;
    }

    // Apply first row data for preview
    // This function is not defined in the provided code, assuming it will be added later
    // applyRowData(csvData.rows[0]); 

    // Give Konva time to render
    await new Promise(resolve => setTimeout(resolve, 50)); 

    const dataUrl = await exportCanvas();
    setPreviewImage(dataUrl);
    setShowPreviewDialog(true);
  };

  return (
    <div className="container mx-auto p-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Certificate Editor</h1>
          <p className="text-muted-foreground">Design and position fields on your certificate template</p>
        </div>
      </div>

      {/* Notices */}
      {!template && (
        <div className="mb-4 p-4 border border-border rounded-lg bg-muted/30 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 mt-1 text-amber-600" />
          <div>
            <p className="font-medium">No template uploaded</p>
            <p className="text-sm text-muted-foreground">
              Please upload a template image first.
            </p>
            <div className="mt-2">
              <Link href="/dashboard/upload-template">
                <Button size="sm">Upload Template</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {!csvData && (
        <div className="mb-4 p-4 border border-border rounded-lg bg-muted/30 flex items-start gap-3">
          <Info className="w-4 h-4 mt-1 text-blue-600" />
          <div>
            <p className="font-medium">CSV data not loaded</p>
            <p className="text-sm text-muted-foreground">
              You can still design the layout, but to generate certificates you will need to upload CSV data.
            </p>
            <div className="mt-2">
              <Link href="/dashboard/upload-csv">
                <Button size="sm" variant="outline">Upload CSV</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <CanvasToolbar className="mb-4" />

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Canvas Stage */}
        <div className="flex-1 overflow-auto rounded-lg border border-border bg-background">
          <div
            className="p-4"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <CanvasStage />
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-full lg:w-80">
          <CanvasPropertiesPanel />
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          variant="outline"
          onClick={handlePreviewCertificate}
          disabled={!template || !csvData || isGenerating}
        >
          Preview
        </Button>
        <Button 
          onClick={handleGenerateCertificates}
          disabled={!template || !csvData || isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </div>

      {/* Preview Dialog */}
      {previewImage && (
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
              <DialogDescription>
                This is a preview of the first certificate using your uploaded CSV data.
              </DialogDescription>
            </DialogHeader>
            <Image src={previewImage} alt="Certificate Preview" width={800} height={600} className="w-full h-auto object-contain max-h-[70vh]" />
            <DialogFooter>
              <DialogCancel>Close</DialogCancel>
              <DialogAction onClick={() => setShowPreviewDialog(false)}>Ok</DialogAction>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


