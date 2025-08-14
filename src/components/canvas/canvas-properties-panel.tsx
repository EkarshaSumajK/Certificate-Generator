"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useCanvasStore, useSelectedElements } from '@/stores/canvas-store';
import { TextElement } from '@/lib/types/canvas';

interface CanvasPropertiesPanelProps {
  className?: string;
}

export function CanvasPropertiesPanel({ className = "" }: CanvasPropertiesPanelProps) {
  const selectedElements = useSelectedElements();
  const updateElement = useCanvasStore((s) => s.updateElement);

  const selectedTextElement = selectedElements.length === 1 && selectedElements[0].type === 'text'
    ? selectedElements[0] as TextElement
    : null;

  // Common font families
  const fontFamilies = [
    'Arial',
    'Verdana',
    'Helvetica',
    'Tahoma',
    'Trebuchet MS',
    'Georgia',
    'Times New Roman',
    'Palatino',
    'Garamond',
    'Courier New',
    'Lucida Console',
    'Monaco',
    'Brush Script MT',
    'Impact',
    'Comic Sans MS',
  ];

  if (!selectedTextElement) {
    return (
      <div className={`bg-background border border-border rounded-lg p-4 space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold">Properties</h3>
        <p className="text-muted-foreground text-sm">Select an element on the canvas to edit its properties.</p>
      </div>
    );
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedTextElement.id, { text: e.target.value });
  };

  const handleFontSizeChange = (value: number[]) => {
    updateElement(selectedTextElement.id, { fontSize: value[0] });
  };

  const handleFontFamilyChange = (value: string) => {
    updateElement(selectedTextElement.id, { fontFamily: value });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedTextElement.id, { fill: e.target.value });
  };

  const handleFontStyleChange = (value: string[]) => {
    let fontStyle = 'normal';
    if (value.includes('bold') && value.includes('italic')) {
      fontStyle = 'bold italic';
    } else if (value.includes('bold')) {
      fontStyle = 'bold';
    } else if (value.includes('italic')) {
      fontStyle = 'italic';
    }
    updateElement(selectedTextElement.id, { fontStyle: fontStyle as TextElement['fontStyle'] });
  };

  const handleTextDecorationChange = (value: string[]) => {
    let textDecoration = 'none';
    if (value.includes('underline')) {
      textDecoration = 'underline';
    } else if (value.includes('line-through')) {
      textDecoration = 'line-through';
    }
    updateElement(selectedTextElement.id, { textDecoration: textDecoration as TextElement['textDecoration'] });
  };

  const handleTextAlignChange = (value: string) => {
    updateElement(selectedTextElement.id, { align: value as 'left' | 'center' | 'right' });
  };

  const currentFontStyles = [];
  if (selectedTextElement.fontStyle?.includes('bold')) currentFontStyles.push('bold');
  if (selectedTextElement.fontStyle?.includes('italic')) currentFontStyles.push('italic');

  const currentTextDecorations = [];
  if (selectedTextElement.textDecoration?.includes('underline')) currentTextDecorations.push('underline');
  // Add other decorations if needed

  return (
    <div className={`bg-background border border-border rounded-lg p-4 space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">Text Properties</h3>

      <div className="space-y-2">
        <Label htmlFor="text-content">Content</Label>
        <Input
          id="text-content"
          type="text"
          value={selectedTextElement.text}
          onChange={handleTextChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="font-size">Font Size</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="font-size"
            min={8}
            max={128}
            step={1}
            value={[selectedTextElement.fontSize]}
            onValueChange={handleFontSizeChange}
            className="flex-1"
          />
          <Input
            type="number"
            value={selectedTextElement.fontSize}
            onChange={(e) => handleFontSizeChange([Number(e.target.value)])}
            className="w-20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="font-family">Font Family</Label>
        <Select 
          value={selectedTextElement.fontFamily}
          onValueChange={handleFontFamilyChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font} value={font}>{font}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-color">Color</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="text-color"
            type="color"
            value={selectedTextElement.fill}
            onChange={handleColorChange}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={selectedTextElement.fill}
            onChange={handleColorChange}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Style</Label>
        <ToggleGroup type="multiple" value={currentFontStyles} onValueChange={handleFontStyleChange}>
          <ToggleGroupItem value="bold" aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Toggle italic">
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label>Decoration</Label>
        <ToggleGroup type="multiple" value={currentTextDecorations} onValueChange={handleTextDecorationChange}>
          <ToggleGroupItem value="underline" aria-label="Toggle underline">
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
          {/* Add more decorations if needed, e.g., line-through */}
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label>Alignment</Label>
        <ToggleGroup type="single" value={selectedTextElement.align} onValueChange={handleTextAlignChange}>
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
