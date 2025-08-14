import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  CanvasStoreState, 
  AnyCanvasElement,
  CanvasBackground
} from '@/lib/types/canvas';
import { useMemo } from 'react';

// Removed unused local CanvasState interface

const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getHighestZIndex = (elements: AnyCanvasElement[]): number => {
  return elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) : 0;
};

const getLowestZIndex = (elements: AnyCanvasElement[]): number => {
  return elements.length > 0 ? Math.min(...elements.map(el => el.zIndex)) : 0;
};

export const useCanvasStore = create<CanvasStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      background: null,
      elements: [],
      selectedElementIds: [],
      clipboardElements: [],
      stageRef: null,
      
      zoom: 1,
      panX: 0,
      panY: 0,
      canvasWidth: 800,
      canvasHeight: 600,
      
      history: {
        past: [],
        present: [],
        future: []
      },
      
      isGridVisible: false,
      isRulersVisible: false,
      snapToGrid: false,
      gridSize: 20,
      fitRequestId: 0,
      
      // Background actions
      setBackground: (background: CanvasBackground) => {
        set(() => ({
          background,
          canvasWidth: background.width,
          canvasHeight: background.height
        }));
      },
      registerStage: (ref: unknown | null) => {
        set({ stageRef: ref });
      },
      
      // Element actions
      addElement: (elementData) => {
        const newElement = {
          ...(elementData as AnyCanvasElement),
          id: generateId(),
          zIndex: getHighestZIndex(get().elements) + 1,
          visible: true,
          locked: false
        } as AnyCanvasElement;
        
        set((state) => ({
          elements: [...state.elements, newElement],
          selectedElementIds: [newElement.id]
        }));
        
        get().saveToHistory();
      },
      
      updateElement: (id: string, updates: Partial<AnyCanvasElement>) => {
        set((state) => ({
          elements: state.elements.map(element =>
            element.id === id ? ({ ...element, ...(updates as Partial<AnyCanvasElement>) } as AnyCanvasElement) : element
          ) as AnyCanvasElement[]
        }));
      },
      
      deleteElement: (id: string) => {
        set((state) => ({
          elements: state.elements.filter(element => element.id !== id),
          selectedElementIds: state.selectedElementIds.filter(selectedId => selectedId !== id)
        }));
        
        get().saveToHistory();
      },
      
      duplicateElement: (id: string) => {
        const element = get().elements.find(el => el.id === id);
        if (element) {
          const duplicatedElement: AnyCanvasElement = {
            ...element,
            id: generateId(),
            x: element.x + 10,
            y: element.y + 10,
            zIndex: getHighestZIndex(get().elements) + 1
          };
          
          set((state) => ({
            elements: [...state.elements, duplicatedElement],
            selectedElementIds: [duplicatedElement.id]
          }));
          
          get().saveToHistory();
        }
      },
      
      // Selection actions
      selectElements: (ids: string[]) => {
        set({ selectedElementIds: ids });
      },
      
      clearSelection: () => {
        set({ selectedElementIds: [] });
      },
      
      // Z-index actions
      moveElementToFront: (id: string) => {
        const highestZ = getHighestZIndex(get().elements);
        get().updateElement(id, { zIndex: highestZ + 1 });
      },
      
      moveElementToBack: (id: string) => {
        const lowestZ = getLowestZIndex(get().elements);
        get().updateElement(id, { zIndex: lowestZ - 1 });
      },
      
      moveElementForward: (id: string) => {
        const element = get().elements.find(el => el.id === id);
        if (element) {
          const elementsAbove = get().elements.filter(el => el.zIndex > element.zIndex);
          if (elementsAbove.length > 0) {
            const nextZ = Math.min(...elementsAbove.map(el => el.zIndex));
            get().updateElement(id, { zIndex: nextZ + 1 });
          }
        }
      },
      
      moveElementBackward: (id: string) => {
        const element = get().elements.find(el => el.id === id);
        if (element) {
          const elementsBelow = get().elements.filter(el => el.zIndex < element.zIndex);
          if (elementsBelow.length > 0) {
            const prevZ = Math.max(...elementsBelow.map(el => el.zIndex));
            get().updateElement(id, { zIndex: prevZ - 1 });
          }
        }
      },
      
      // History actions
      saveToHistory: () => {
        set((state) => ({
          history: {
            past: [...state.history.past, state.history.present],
            present: state.elements.map((el) => ({ ...el })),
            future: []
          }
        }));
      },
      
      undo: () => {
        const { history } = get();
        if (history.past.length > 0) {
          const previous = history.past[history.past.length - 1];
          const newPast = history.past.slice(0, history.past.length - 1);
          
          set({
            elements: previous,
            history: {
              past: newPast,
              present: previous,
              future: [history.present, ...history.future]
            }
          });
        }
      },
      
      redo: () => {
        const { history } = get();
        if (history.future.length > 0) {
          const next = history.future[0];
          const newFuture = history.future.slice(1);
          
          set({
            elements: next,
            history: {
              past: [...history.past, history.present],
              present: next,
              future: newFuture
            }
          });
        }
      },
      
      // Canvas view actions
      setZoom: (zoom: number) => {
        set({ zoom: Math.max(0.1, Math.min(5, zoom)) });
      },
      
      setPan: (x: number, y: number) => {
        set({ panX: x, panY: y });
      },
      
      resetView: () => {
        set({ zoom: 1, panX: 0, panY: 0 });
      },
      triggerFit: () => {
        set((state) => ({ fitRequestId: (state.fitRequestId || 0) + 1 }));
      },
      
      setCanvasSize: (width: number, height: number) => {
        set({ canvasWidth: width, canvasHeight: height });
      },
      
      // Utility actions
      copyElements: (ids: string[]) => {
        const elementsToCopy = get().elements.filter(el => ids.includes(el.id));
        set({ clipboardElements: elementsToCopy });
      },
      
      pasteElements: () => {
        const { clipboardElements } = get();
        if (clipboardElements.length > 0) {
          const pastedElements = clipboardElements.map(element => ({
            ...element,
            id: generateId(),
            x: element.x + 20,
            y: element.y + 20,
            zIndex: getHighestZIndex(get().elements) + 1
          }));
          
          set((state) => ({
            elements: [...state.elements, ...pastedElements],
            selectedElementIds: pastedElements.map(el => el.id)
          }));
          
          get().saveToHistory();
        }
      },
      
      clearCanvas: () => {
        set({ 
          elements: [], 
          selectedElementIds: [],
          history: { past: [], present: [], future: [] }
        });
      },
      
      exportCanvas: async (): Promise<string> => {
        const { stageRef } = get();
        try {
          const stage = stageRef as unknown as { toDataURL?: (opts?: { pixelRatio?: number }) => string };
          if (stage && typeof stage.toDataURL === 'function') {
            return stage.toDataURL({ pixelRatio: 2 });
          }
        } catch {}
        return 'data:image/png;base64,';
      },

      applyRowData: (row: Record<string, string | number | boolean | null>) => {
        set((state) => ({
          elements: state.elements.map((el) => {
            if (el.type === 'text') {
              const te = el as unknown as { dataKey?: string; text: string } & typeof el;
              if (te.dataKey && row[te.dataKey] != null) {
                return { ...te, text: String(row[te.dataKey]) };
              }
            }
            return el;
          })
        }));
      }
    }),
    { name: 'canvas-store' }
  )
);

// Selector hooks for better performance
export const useCanvasBackground = () => useCanvasStore((state) => state.background);
export const useCanvasElements = () => useCanvasStore((state) => state.elements);
export const useSelectedElements = () => {
  const elements = useCanvasStore((state) => state.elements);
  const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);

  return useMemo(() => {
    return elements.filter((el) => selectedElementIds.includes(el.id));
  }, [elements, selectedElementIds]);
};
export const useCanvasZoom = () => useCanvasStore((state) => state.zoom);
export const useCanvasPanX = () => useCanvasStore((state) => state.panX);
export const useCanvasPanY = () => useCanvasStore((state) => state.panY);
export const useCanvasWidth = () => useCanvasStore((state) => state.canvasWidth);
export const useCanvasHeight = () => useCanvasStore((state) => state.canvasHeight);
export const useCanvasCanUndo = () => useCanvasStore((state) => state.history.past.length > 0);
export const useCanvasCanRedo = () => useCanvasStore((state) => state.history.future.length > 0);
export const useCanvasUndo = () => useCanvasStore((state) => state.undo);
export const useCanvasRedo = () => useCanvasStore((state) => state.redo);
