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
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const hasAutoFittedRef = useRef(false);
  
  const background = useCanvasBackground();
  const elements = useCanvasElements();
  const zoom = useCanvasZoom();
  const panX = useCanvasPanX();
  const panY = useCanvasPanY();
  const canvasWidth = useCanvasWidth();
  const canvasHeight = useCanvasHeight();
  const setZoom = useCanvasStore((s) => s.setZoom);
  const setPan = useCanvasStore((s) => s.setPan);
  const fitRequestId = useCanvasStore((s) => s.fitRequestId);
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
        // Allow a fresh auto-fit when background/template changes
        hasAutoFittedRef.current = false;
      };
      img.src = background.value;
    }
  }, [background]);

  // Auto-fit and center the canvas once when dimensions are known
  const performFit = React.useCallback(() => {
    const container = containerRef.current;
    if (!container || canvasWidth <= 0 || canvasHeight <= 0) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const fitZoom = Math.min(rect.width / canvasWidth, rect.height / canvasHeight);
    const offsetX = (rect.width - canvasWidth * fitZoom) / 2;
    const offsetY = (rect.height - canvasHeight * fitZoom) / 2;
    setZoom(fitZoom);
    setPan(offsetX, offsetY);
    hasAutoFittedRef.current = true;
  }, [canvasWidth, canvasHeight, setZoom, setPan]);

  useEffect(() => {
    if (hasAutoFittedRef.current) return;
    performFit();
  }, [canvasWidth, canvasHeight, performFit]);

  useEffect(() => {
    if (fitRequestId == null) return;
    performFit();
  }, [fitRequestId, performFit]);

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
        textDecoration={element.textDecoration || 'none'}
        wrap={element.wrap || 'word'}
        lineHeight={element.lineHeight || 1}
        ellipsis={element.ellipsis ?? true}
        padding={2}
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
      className={`relative w-full h-full border border-border rounded-lg ${className}`}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div ref={containerRef} className="w-full h-full">
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
        onWheel={(e) => {
          e.evt.preventDefault();
          const stage = stageRef.current;
          if (!stage) return;
          const oldScale = zoom;
          const pointer = stage.getPointerPosition();
          if (!pointer) return;
          const scaleBy = 1.05;
          const direction = e.evt.deltaY > 0 ? -1 : 1;
          const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
          const clamped = Math.max(0.1, Math.min(5, newScale));
          const mousePointTo = {
            x: (pointer.x - panX) / oldScale,
            y: (pointer.y - panY) / oldScale,
          };
          const newPos = {
            x: pointer.x - mousePointTo.x * clamped,
            y: pointer.y - mousePointTo.y * clamped,
          };
          setZoom(clamped);
          setPan(newPos.x, newPos.y);
        }}
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
    </div>
  );
}

export const CanvasStage = React.memo(CanvasStageComponent);
