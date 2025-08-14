"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ArrowLeft, AlertTriangle, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar';
import { CanvasPropertiesPanel } from '@/components/canvas/canvas-properties-panel';

import { useCurrentTemplate } from '@/stores/template-store';
import { useCSVData } from '@/stores/csv-store';
import { useCanvasStore } from '@/stores/canvas-store';
import type { TextElement } from '@/lib/types/canvas';
// FIXED: Import the `toast` function directly from sonner to create toasts
import { toast } from 'sonner';

// Dynamically import the CanvasStage component to prevent SSR issues with canvas libraries
const CanvasStage = dynamic(() => import('@/components/canvas/canvas-stage').then(m => m.CanvasStage), { ssr: false });

export default function EditorPage() {
  const template = useCurrentTemplate();
  const csvData = useCSVData();
  const setBackground = useCanvasStore((s) => s.setBackground);
  const setCanvasSize = useCanvasStore((s) => s.setCanvasSize);
  const addElement = useCanvasStore((s) => s.addElement);
  const applyRowData = useCanvasStore((s) => s.applyRowData);
  const exportCanvas = useCanvasStore((s) => s.exportCanvas);
  const elementsLength = useCanvasStore((s) => s.elements.length);
  // REMOVED: const { toast } = useSonner(); // This hook is for reading toast state, not creating toasts.

  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customCount, setCustomCount] = useState<number | ''>('');

  // Initialize canvas background from template image and set canvas size
  useEffect(() => {
    if (!template?.dataUrl) return;

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

  // Ensure at least one sample text element exists for better user experience
  useEffect(() => {
    if (elementsLength === 0 && template) {
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
  }, [elementsLength, addElement, template]);

  // Prevent default browser behavior for drag-and-drop on the page
  useEffect(() => {
    const preventDefault = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  const handleGenerateCertificates = async () => {
    if (!csvData || !template) {
      // FIXED: Changed to sonner's toast.error() syntax
      toast.error("Missing Data", {
        description: "Please upload both CSV data and a template before generating.",
      });
      return;
    }

    setIsGenerating(true);
    // FIXED: Changed to sonner's direct toast() syntax
    toast("Generation Started", {
      description: `Generating ${csvData.rows.length} certificates. This may take a moment...`,
    });

    const zip = new JSZip();
    const usedNames = new Set<string>();
    let successCount = 0;
    const errorRows = [];

    const totalRows = csvData.rows.length;
    const limit = typeof customCount === 'number' && customCount > 0 ? Math.min(Math.floor(customCount), totalRows) : totalRows;
    const rowsToProcess = csvData.rows.slice(0, limit);

    for (const [index, row] of rowsToProcess.entries()) {
      try {
        applyRowData(row);
        await new Promise(resolve => setTimeout(resolve, 50));

        const dataUrl = await exportCanvas();
        if (dataUrl) {
          const rawName = row[csvData.headers[0]]?.toString().trim() || `Certificate_${index + 1}`;
          const sanitize = (s: string) => s.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim();
          const baseName = sanitize(rawName) || `Certificate_${index + 1}`;
          let fileName = `${baseName}.png`;
          let dupe = 1;
          while (usedNames.has(fileName)) {
            fileName = `${baseName} (${dupe++}).png`;
          }
          usedNames.add(fileName);
          zip.file(fileName, dataUrl.split(',')[1], { base64: true });
          successCount++;
        } else {
           throw new Error('Canvas export returned null');
        }
      } catch (error) {
        console.error(`Error generating certificate for row ${index + 1}:`, error);
        errorRows.push(index + 1);
      }
    }

    if (successCount > 0) {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "certificates.zip");
      // FIXED: Used toast.success() for semantic correctness
      toast.success("Certificates Generated!", {
        description: `${successCount} of ${csvData.rows.length} certificates were generated successfully.`,
      });
    }

    if (errorRows.length > 0) {
        // FIXED: Changed to sonner's toast.error() syntax
        toast.error("Some Certificates Failed", {
            description: `Could not generate certificates for rows: ${errorRows.join(', ')}.`,
        });
    }

    setIsGenerating(false);
  };

  const handlePreviewCertificate = async () => {
    if (!csvData || !template) {
      // FIXED: Changed to sonner's toast.error() syntax
      toast.error("Missing Data", {
        description: "Please upload CSV data and a template to preview.",
      });
      return;
    }

    applyRowData(csvData.rows[0]);
    await new Promise(resolve => setTimeout(resolve, 50));

    const dataUrl = await exportCanvas();
    if (dataUrl) {
      setPreviewImage(dataUrl);
      setShowPreviewDialog(true);
    } else {
        // FIXED: Changed to sonner's toast.error() syntax
        toast.error("Preview Failed", {
            description: "Could not generate a preview image.",
        })
    }
  };

  return (
    // ... rest of your JSX remains the same
    <div className="flex flex-col h-screen">
      <header className="container mx-auto p-4 sm:p-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Certificate Editor</h1>
            <p className="text-sm text-muted-foreground">Design your certificate and map data fields</p>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {!template && (
              <div className="mb-4 p-4 border rounded-lg bg-muted/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium">No Template Uploaded</p>
                  <p className="text-sm text-muted-foreground">Please upload a template to begin designing.</p>
                  <Button size="sm" asChild className="mt-2">
                    <Link href="/dashboard/upload-template">Upload Template</Link>
                  </Button>
                </div>
              </div>
            )}
            {!csvData && (
              <div className="mb-4 p-4 border rounded-lg bg-muted/30 flex items-start gap-3">
                <Info className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium">No CSV Data Loaded</p>
                  <p className="text-sm text-muted-foreground">Design your layout now, and upload CSV data later to generate.</p>
                  <Button size="sm" variant="outline" asChild className="mt-2">
                    <Link href="/dashboard/upload-csv">Upload CSV</Link>
                  </Button>
                </div>
              </div>
            )}
            <CanvasToolbar className="mb-4" />
            <div className="flex-1 relative rounded-lg border bg-muted/20 overflow-auto p-2">
              <div className="w-full h-full flex items-center justify-center">
                 {template ? <CanvasStage /> : <p className="text-muted-foreground">Upload a template to see the canvas.</p>}
              </div>
            </div>
          </div>
          <aside className="w-full lg:w-80 border-l flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto">
              <CanvasPropertiesPanel />
            </div>
             <div className="p-4 border-t bg-background">
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="custom-count">Number to generate</Label>
                    <Input
                      id="custom-count"
                      type="number"
                      min={1}
                      placeholder={csvData ? String(csvData.rows.length) : '0'}
                      value={customCount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') { setCustomCount(''); return; }
                        const num = Number(val);
                        if (!Number.isNaN(num)) setCustomCount(num);
                      }}
                    />
                  </div>
                </div>
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
                  {isGenerating ? "Generating..." : (() => {
                    if (!csvData) return 'Generate Certificates';
                    const total = csvData.rows.length;
                    const limit = typeof customCount === 'number' && customCount > 0 ? Math.min(Math.floor(customCount), total) : total;
                    return `Generate (${limit}) Certificates`;
                  })()}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>
      {previewImage && (
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
              <DialogDescription>
                This is a preview using the first row of your CSV data.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              <Image src={previewImage} alt="Certificate Preview" width={1200} height={800} className="w-full h-auto object-contain" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}