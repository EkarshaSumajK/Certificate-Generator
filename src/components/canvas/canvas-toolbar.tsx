"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Type, 
  Image as ImageIcon, 
  Square, 
  Undo, 
  Redo, 
  Copy, 
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move3D,
  Layers
} from 'lucide-react';
import { 
  useCanvasStore, 
  useCanvasZoom,
  useCanvasCanUndo,
  useCanvasCanRedo,
  useCanvasUndo,
  useCanvasRedo
} from '@/stores/canvas-store';
import { TextElement } from '@/lib/types/canvas';
import { useCSVData } from '@/stores/csv-store';

interface CanvasToolbarProps {
  className?: string;
}

export function CanvasToolbar({ className = "" }: CanvasToolbarProps) {
  const addElement = useCanvasStore((s) => s.addElement);
  const deleteElement = useCanvasStore((s) => s.deleteElement);
  const duplicateElement = useCanvasStore((s) => s.duplicateElement);
  const copyElements = useCanvasStore((s) => s.copyElements);
  const pasteElements = useCanvasStore((s) => s.pasteElements);
  const selectedElementIds = useCanvasStore((s) => s.selectedElementIds);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const resetView = useCanvasStore((s) => s.resetView);
  const triggerFit = useCanvasStore((s) => s.triggerFit);
  
  const canUndo = useCanvasCanUndo();
  const canRedo = useCanvasCanRedo();
  const undo = useCanvasUndo();
  const redo = useCanvasRedo();
  const zoom = useCanvasZoom();
  const csvData = useCSVData();

  const addTextElement = () => {
    const textElement: Omit<TextElement, 'id' | 'zIndex'> = {
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      text: 'New Text',
      fontSize: 24,
      fontFamily: 'Arial',
      fontStyle: 'normal',
      fill: '#000000',
      align: 'left',
      verticalAlign: 'top',
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1
    };
    
    addElement(textElement);
  };

  const handleZoomIn = () => {
    setZoom(zoom * 1.2);
  };

  const handleZoomOut = () => {
    setZoom(zoom / 1.2);
  };

  const handleDelete = () => {
    selectedElementIds.forEach(id => deleteElement(id));
  };

  const handleDuplicate = () => {
    selectedElementIds.forEach(id => duplicateElement(id));
  };

  const handleCopy = () => {
    copyElements(selectedElementIds);
  };

  const hasSelection = selectedElementIds.length > 0;
  const selectedTextElement = useCanvasStore((s) => {
    if (s.selectedElementIds.length !== 1) return null;
    const el = s.elements.find(e => e.id === s.selectedElementIds[0]);
    return el && el.type === 'text' ? el as TextElement : null;
  });

  return (
    <div className={`bg-background border border-border rounded-lg p-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {/* Add Elements */}
        <div className="flex gap-1 border-r border-border pr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addTextElement}
            className="flex items-center gap-2"
          >
            <Type className="w-4 h-4" />
            Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex items-center gap-2 opacity-50"
          >
            <ImageIcon className="w-4 h-4" />
            Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex items-center gap-2 opacity-50"
          >
            <Square className="w-4 h-4" />
            Shape
          </Button>
        </div>

        {/* History Actions */}
        <div className="flex gap-1 border-r border-border pr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="flex items-center gap-2"
          >
            <Undo className="w-4 h-4" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="flex items-center gap-2"
          >
            <Redo className="w-4 h-4" />
            Redo
          </Button>
        </div>

        {/* Element Actions */}
        <div className="flex gap-1 border-r border-border pr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!hasSelection}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={pasteElements}
            className="flex items-center gap-2"
          >
            <Move3D className="w-4 h-4" />
            Paste
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            disabled={!hasSelection}
            className="flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={!hasSelection}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>

        {/* View Controls */}
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="flex items-center gap-2"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="flex items-center px-2 text-sm text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="flex items-center gap-2"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetView}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFit}
            className="flex items-center gap-2"
          >
            Fit
          </Button>
        </div>
        
        {/* Data Binding row: reserve height by keeping it in DOM and toggling visibility */}
        <div className={`flex items-center gap-2 pl-2 ${selectedTextElement ? '' : 'invisible'}`}>
          <span className="text-sm text-muted-foreground">Bind to column:</span>
          <select
            className="h-8 rounded-md border border-border bg-background px-2 text-sm"
            value={selectedTextElement?.dataKey || ''}
            disabled={!selectedTextElement}
            onChange={(e) => {
              const val = e.target.value;
              if (!selectedTextElement) return;
              useCanvasStore.getState().updateElement(selectedTextElement.id, { dataKey: val || undefined });
            }}
          >
            <option value="">Unbound</option>
            {(csvData?.headers || []).map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className={`mt-3 pt-3 border-t border-border ${hasSelection ? '' : 'invisible'}`}>
        <p className="text-sm text-muted-foreground">
          {selectedElementIds.length} element{selectedElementIds.length > 1 ? 's' : ''} selected
        </p>
      </div>
    </div>
  );
}
