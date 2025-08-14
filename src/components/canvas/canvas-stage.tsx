"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva';
import Konva from 'konva';
import { 
  useCanvasStore, 
  useCanvasBackground, 
  useCanvasElements, 
  useCanvasZoom, 
  useCanvasPanX,
  useCanvasPanY,
  useCanvasWidth,
  useCanvasHeight 
} from '@/stores/canvas-store';
import { CanvasElement, TextElement } from '@/lib/types/canvas';

interface CanvasStageProps {
  className?: string;
}

function CanvasStageComponent({ className = "" }: CanvasStageProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  
  const background = useCanvasBackground();
  const elements = useCanvasElements();
  const zoom = useCanvasZoom();
  const panX = useCanvasPanX();
  const panY = useCanvasPanY();
  const canvasWidth = useCanvasWidth();
  const canvasHeight = useCanvasHeight();
  const selectedElementIds = useCanvasStore((s) => s.selectedElementIds);
  const selectElements = useCanvasStore((s) => s.selectElements);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  const updateElement = useCanvasStore((s) => s.updateElement);

  // Load background image
  useEffect(() => {
    if (background?.type === 'image' && background.value) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setBackgroundImage(img);
      };
      img.src = background.value;
    }
  }, [background]);

  // Handle transformer selection
  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const transformer = transformerRef.current;
      const stage = stageRef.current;
      
      if (selectedElementIds.length > 0) {
        const selectedNodes = selectedElementIds
          .map(id => stage.findOne(`#${id}`))
          .filter(Boolean) as Konva.Node[];
        
        transformer.nodes(selectedNodes);
        transformer.getLayer()?.batchDraw();
      } else {
        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
      }
    }
  }, [selectedElementIds]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If clicked on stage, clear selection
    if (e.target === e.target.getStage()) {
      clearSelection();
      return;
    }

    // If clicked on an element, select it
    const clickedElement = e.target;
    const elementId = clickedElement.id();
    
    if (elementId && elements.find(el => el.id === elementId)) {
      selectElements([elementId]);
    }
  };

  const handleElementDragEnd = (e: Konva.KonvaEventObject<DragEvent>, elementId: string) => {
    const node = e.target;
    const newX = node.x();
    const newY = node.y();
    // Avoid triggering Zustand updates if position did not change
    const element = elements.find((el) => el.id === elementId);
    if (!element || (element.x === newX && element.y === newY)) return;
    updateElement(elementId, { x: newX, y: newY });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const elementId = node.id();
    if (!elementId) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newProps = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      scaleX: scaleX,
      scaleY: scaleY,
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY)
    } as const;

    const element = elements.find((el) => el.id === elementId);
    if (
      !element ||
      (element.x === newProps.x &&
       element.y === newProps.y &&
       (element.rotation || 0) === newProps.rotation &&
       (element.scaleX || 1) === newProps.scaleX &&
       (element.scaleY || 1) === newProps.scaleY &&
       (element.width || 0) === newProps.width &&
       (element.height || 0) === newProps.height)
    ) {
      // Reset scale and return if no changes
      node.scaleX(1);
      node.scaleY(1);
      return;
    }

    updateElement(elementId, newProps);
    // Reset scale to 1 after applying to width/height
    node.scaleX(1);
    node.scaleY(1);
  };

  const renderTextElement = (element: TextElement) => {
    return (
      <KonvaText
        key={element.id}
        id={element.id}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        text={element.text}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontStyle={element.fontStyle || 'normal'}
        textDecoration={element.textDecoration || ''}
        fill={element.fill}
        align={element.align || 'left'}
        verticalAlign={element.verticalAlign || 'top'}
        rotation={element.rotation || 0}
        scaleX={element.scaleX || 1}
        scaleY={element.scaleY || 1}
        opacity={element.opacity || 1}
        visible={element.visible !== false}
        draggable={!element.locked}
        // Improve drag performance by avoiding frequent redraws
        perfectDrawEnabled={false}
        listening={true}
        onDragEnd={(e) => handleElementDragEnd(e, element.id)}
        onTransformEnd={handleTransformEnd}
      />
    );
  };

  const renderElement = (element: CanvasElement) => {
    switch (element.type) {
      case 'text':
        return renderTextElement(element as TextElement);
      // Add other element types here
      default:
        return null;
    }
  };

  const sortedElements = useMemo(() => {
    // Avoid mutating the original store array to prevent re-render loops/flicker
    return [...elements].sort((a, b) => a.zIndex - b.zIndex);
  }, [elements]);

  useEffect(() => {
    // Register konva stage reference in store for export/use elsewhere
    useCanvasStore.getState().registerStage(stageRef.current);
  }, []);

  return (
    <div 
      className={`relative overflow-hidden border border-border rounded-lg ${className}`}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={canvasHeight}
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
        onClick={handleStageClick}
        onTap={handleStageClick}
        // improve performance by throttling pointer events
        listening={true}
      >
        <Layer>
          {/* Background Image */}
          {backgroundImage && (
            <KonvaImage
              image={backgroundImage}
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              listening={false} // Background shouldn't be interactive
            />
          )}
          
          {/* Canvas Elements */}
          {sortedElements.map(renderElement)}
          
          {/* Transformer for selected elements */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize to minimum size
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            anchorStroke="#0066cc"
            anchorFill="#ffffff"
            anchorSize={8}
            borderStroke="#0066cc"
            borderDash={[3, 3]}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export const CanvasStage = React.memo(CanvasStageComponent);
