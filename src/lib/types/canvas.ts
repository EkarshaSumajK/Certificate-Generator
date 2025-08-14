export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  zIndex: number;
  locked?: boolean;
  visible?: boolean;
}

export interface TextElement extends CanvasElement {
  type: 'text';
  text: string;
  // Optional CSV binding: when set, this element will be populated from CSV rows
  dataKey?: string;
  fontSize: number;
  fontFamily: string;
  fontStyle?: 'normal' | 'bold' | 'italic' | 'bold italic';
  fill: string;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: 'none' | 'underline' | 'line-through';
  wrap?: 'word' | 'char' | 'none';
  ellipsis?: boolean;
}

export interface ImageElement extends CanvasElement {
  type: 'image';
  src: string;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
}

export interface ShapeElement extends CanvasElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line' | 'arrow';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

export interface CanvasBackground {
  type: 'color' | 'image' | 'gradient';
  value: string; // color hex, image URL, or gradient definition
  width: number;
  height: number;
}

export type AnyCanvasElement = TextElement | ImageElement | ShapeElement;

export interface CanvasHistory {
  past: AnyCanvasElement[][];
  present: AnyCanvasElement[];
  future: AnyCanvasElement[][];
}

export interface CanvasStoreState {
  // Canvas configuration
  background: CanvasBackground | null;
  elements: AnyCanvasElement[];
  selectedElementIds: string[];
  clipboardElements: AnyCanvasElement[];
  // Non-serializable runtime refs
  stageRef?: unknown | null;
  
  // Canvas settings
  zoom: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;
  
  // History for undo/redo
  history: CanvasHistory;
  
  // UI state
  isGridVisible: boolean;
  isRulersVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
  // View fit requests
  fitRequestId?: number;
  
  // Actions
  setBackground: (background: CanvasBackground) => void;
  addElement: (element: Omit<AnyCanvasElement, 'id' | 'zIndex'>) => void;
  updateElement: (id: string, updates: Partial<AnyCanvasElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;
  moveElementToFront: (id: string) => void;
  moveElementToBack: (id: string) => void;
  moveElementForward: (id: string) => void;
  moveElementBackward: (id: string) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Canvas actions
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
  setCanvasSize: (width: number, height: number) => void;
  triggerFit?: () => void;
  
  // Utility actions
  copyElements: (ids: string[]) => void;
  pasteElements: () => void;
  clearCanvas: () => void;
  exportCanvas: () => Promise<string>; // Returns data URL
  registerStage: (ref: unknown | null) => void;
  applyRowData: (row: Record<string, string | number | boolean | null>) => void;
}
