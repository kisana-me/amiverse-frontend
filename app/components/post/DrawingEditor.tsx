"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Icons
const IconPen = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path></svg>
);
const IconEraser = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.586 15.414a2 2 0 0 0 0 2.828l4.172 4.172a2 2 0 0 0 2.828 0l11.828-11.828a2 2 0 0 0 0-2.828l-4.172-4.172a2 2 0 0 0-2.828 0L2.586 15.414z" />
    <line x1="10" y1="8" x2="18" y2="16" />
  </svg>
);
const IconHand = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>
);
const IconSquare = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
);
const IconCircle = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const IconBrush = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M12 19l7-7 3 3-7 7-3-3z"></path></svg>
);
const IconUndo = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
);
const IconRedo = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 3.7"></path></svg>
);

// Constants for touch gesture detection
const PINCH_DETECTION_DELAY = 80; // ms to wait before starting touch drawing
const TOUCH_MOVEMENT_THRESHOLD = 3; // pixels of movement to trigger immediate drawing

interface PendingTouch {
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  timerId: ReturnType<typeof setTimeout>;
}

interface DrawingEditorProps {
  onClose: () => void;
  onSave: (imageBlob: Blob, packedData: string, name: string, description: string) => void;
  initialData?: string;
  initialName?: string;
  initialDescription?: string;
}

export default function DrawingEditor({ onClose, onSave, initialData, initialName = '', initialDescription = '' }: DrawingEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // State for UI
  const [tool, setTool] = useState<'pen' | 'eraser' | 'hand'>('pen');
  const [brushSize, setBrushSize] = useState(1);
  const [brushShape, setBrushShape] = useState<'square' | 'circle'>('circle');
  const [scale, setScale] = useState(1);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  
  // History
  const historyRef = useRef<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // State for portal mounting
  const [isMounted, setIsMounted] = useState(false);

  // Refs for mutable state (drawing/panning logic)
  const state = useRef({
    scale: 1,
    panX: 0,
    panY: 0,
    isDrawing: false,
    isPanning: false,
    isPinching: false,
    pinchStartDist: 0,
    pinchStartScale: 1,
    pinchCenterWorldX: 0,
    pinchCenterWorldY: 0,
    lastX: 0,
    lastY: 0,
    lastClientX: 0,
    lastClientY: 0,
    // For delayed touch drawing detection
    pendingTouch: null as PendingTouch | null,
  });

  // Mount effect for portal and cleanup
  useEffect(() => {
    setIsMounted(true);
    const stateRef = state.current;
    return () => {
      // Clear any pending touch timeout to prevent memory leaks
      if (stateRef.pendingTouch) {
        clearTimeout(stateRef.pendingTouch.timerId);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (canvas && ctx) {
      // Initialize canvas
      ctx.imageSmoothingEnabled = false;
      
      if (initialData) {
        // Restore from packed data
        try {
          const binary = window.atob(initialData);
          const len = binary.length;
          const packedData = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            packedData[i] = binary.charCodeAt(i);
          }

          const width = 320;
          const height = 120;
          const imageData = ctx.createImageData(width, height);
          const data = imageData.data;

          for (let i = 0; i < width * height; i++) {
            const byteIndex = Math.floor(i / 8);
            const bitIndex = 7 - (i % 8);
            const isWhite = (packedData[byteIndex] >> bitIndex) & 1;
            
            const pixelIndex = i * 4;
            const color = isWhite ? 255 : 0;
            data[pixelIndex] = color;     // R
            data[pixelIndex + 1] = color; // G
            data[pixelIndex + 2] = color; // B
            data[pixelIndex + 3] = 255;   // A
          }
          ctx.putImageData(imageData, 0, 0);
        } catch (e) {
          console.error("Failed to restore canvas data", e);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 320, 120);
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 320, 120);
      }
      
      // Delay centering to ensure layout is ready
      setTimeout(() => {
        centerCanvas();
        saveHistory();
      }, 100);
    }
  }, []);

  // Helper functions
  const saveHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const newHistory = historyRef.current.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    
    if (newHistory.length > 50) {
        newHistory.shift();
    } else {
        setHistoryIndex(newHistory.length - 1);
    }
    historyRef.current = newHistory;
  };

  const undo = () => {
    if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        restoreCanvas(historyRef.current[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < historyRef.current.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        restoreCanvas(historyRef.current[newIndex]);
    }
  };

  const restoreCanvas = (imageData: ImageData) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.putImageData(imageData, 0, 0);
  };

  const updateTransform = () => {
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${state.current.panX}px, ${state.current.panY}px) scale(${state.current.scale})`;
      setScale(state.current.scale);
    }
  };

  const centerCanvas = () => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const margin = 20;
    const availableW = rect.width - margin;
    const availableH = rect.height - margin;
    
    const scaleW = availableW / 320;
    const scaleH = availableH / 120;
    let newScale = Math.min(scaleW, scaleH, 2);
    if (newScale < 0.5) newScale = 0.5;

    state.current.scale = newScale;
    state.current.panX = (rect.width - 320 * newScale) / 2;
    state.current.panY = (rect.height - 120 * newScale) / 2;
    updateTransform();
  };

  const getLocalCoordinates = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / state.current.scale;
    const y = (clientY - rect.top) / state.current.scale;
    return { x, y };
  };

  const getWorldCoordinates = (clientX: number, clientY: number) => {
    if (!viewportRef.current) return { x: 0, y: 0 };
    const rect = viewportRef.current.getBoundingClientRect();
    const viewportRelX = clientX - rect.left;
    const viewportRelY = clientY - rect.top;
    return {
      x: (viewportRelX - state.current.panX) / state.current.scale,
      y: (viewportRelY - state.current.panY) / state.current.scale
    };
  };

  const drawPoint = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, shape: 'square' | 'circle') => {
    const startX = Math.floor(cx - size / 2);
    const startY = Math.floor(cy - size / 2);

    if (shape === 'square' || size <= 2) {
      ctx.fillRect(startX, startY, size, size);
    } else {
      const radiusSq = (size / 2) * (size / 2);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = x - size / 2 + 0.5;
          const dy = y - size / 2 + 0.5;
          if (dx * dx + dy * dy <= radiusSq) {
            ctx.fillRect(startX + x, startY + y, 1, 1);
          }
        }
      }
    }
  };

  const plotLine = (x0: number, y0: number, x1: number, y1: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    ctx.fillStyle = (tool === 'pen') ? '#000000' : '#ffffff';
    
    while(true) {
      drawPoint(ctx, x0, y0, brushSize, brushShape);

      if ((x0 === x1) && (y0 === y1)) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  };

  // Event Handlers
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to stop scrolling on touch devices
    // e.preventDefault(); // This might block button clicks if not careful, but we are on viewport

    const isTouch = 'touches' in e;
    const clientX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    if (isTouch && (e as React.TouchEvent).touches.length === 2) {
      // Cancel any pending touch drawing
      if (state.current.pendingTouch) {
        clearTimeout(state.current.pendingTouch.timerId);
        state.current.pendingTouch = null;
      }
      
      state.current.isPinching = true;
      state.current.isDrawing = false;
      state.current.isPanning = false;
      
      const t1 = (e as React.TouchEvent).touches[0];
      const t2 = (e as React.TouchEvent).touches[1];
      state.current.pinchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      state.current.pinchStartScale = state.current.scale;
      
      const centerX = (t1.clientX + t2.clientX) / 2;
      const centerY = (t1.clientY + t2.clientY) / 2;
      const worldPos = getWorldCoordinates(centerX, centerY);
      state.current.pinchCenterWorldX = worldPos.x;
      state.current.pinchCenterWorldY = worldPos.y;
      
      state.current.lastClientX = centerX;
      state.current.lastClientY = centerY;
      return;
    }

    const isRightClick = !isTouch && (e as React.MouseEvent).button === 2;

    if (tool === 'hand' || isRightClick || (isTouch && (e as React.TouchEvent).touches.length > 1)) {
      state.current.isPanning = true;
      if (viewportRef.current) viewportRef.current.style.cursor = 'grabbing';
      state.current.lastClientX = clientX;
      state.current.lastClientY = clientY;
    } else if (isTouch) {
      // For touch, delay drawing start to detect potential pinch gesture
      const coords = getLocalCoordinates(clientX, clientY);
      state.current.lastClientX = clientX;
      state.current.lastClientY = clientY;
      
      const timerId = setTimeout(() => {
        // If still pending (no second finger detected), start drawing
        if (state.current.pendingTouch && !state.current.isPinching) {
          state.current.isDrawing = true;
          state.current.lastX = coords.x;
          state.current.lastY = coords.y;
          plotLine(coords.x, coords.y, coords.x, coords.y);
          state.current.pendingTouch = null;
        }
      }, PINCH_DETECTION_DELAY);
      
      state.current.pendingTouch = { x: coords.x, y: coords.y, clientX, clientY, timerId };
    } else {
      // For mouse, draw immediately
      state.current.isDrawing = true;
      const coords = getLocalCoordinates(clientX, clientY);
      state.current.lastX = coords.x;
      state.current.lastY = coords.y;
      plotLine(coords.x, coords.y, coords.x, coords.y);
      state.current.lastClientX = clientX;
      state.current.lastClientY = clientY;
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const isTouch = 'touches' in e;
    
    // If we have 2 touches and pending touch exists, cancel it and start pinching
    if (isTouch && (e as React.TouchEvent).touches.length === 2) {
      // Cancel any pending touch drawing
      if (state.current.pendingTouch) {
        clearTimeout(state.current.pendingTouch.timerId);
        state.current.pendingTouch = null;
      }
      
      if (!state.current.isPinching) {
        // Start pinching
        state.current.isPinching = true;
        state.current.isDrawing = false;
        state.current.isPanning = false;
        
        const t1 = (e as React.TouchEvent).touches[0];
        const t2 = (e as React.TouchEvent).touches[1];
        state.current.pinchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        state.current.pinchStartScale = state.current.scale;
        
        const centerX = (t1.clientX + t2.clientX) / 2;
        const centerY = (t1.clientY + t2.clientY) / 2;
        const worldPos = getWorldCoordinates(centerX, centerY);
        state.current.pinchCenterWorldX = worldPos.x;
        state.current.pinchCenterWorldY = worldPos.y;
        
        state.current.lastClientX = centerX;
        state.current.lastClientY = centerY;
      }
    }
    
    if (state.current.isPinching && isTouch && (e as React.TouchEvent).touches.length === 2) {
      e.preventDefault();
      const t1 = (e as React.TouchEvent).touches[0];
      const t2 = (e as React.TouchEvent).touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const centerX = (t1.clientX + t2.clientX) / 2;
      const centerY = (t1.clientY + t2.clientY) / 2;

      const scaleRatio = currentDist / state.current.pinchStartDist;
      let newScale = state.current.pinchStartScale * scaleRatio;
      newScale = Math.max(0.5, Math.min(newScale, 10));

      const rect = viewportRef.current!.getBoundingClientRect();
      const viewportRelX = centerX - rect.left;
      const viewportRelY = centerY - rect.top;

      state.current.scale = newScale;
      state.current.panX = viewportRelX - state.current.pinchCenterWorldX * newScale;
      state.current.panY = viewportRelY - state.current.pinchCenterWorldY * newScale;
      updateTransform();
      return;
    }

    // If we have a pending touch, check if moved enough to start drawing immediately
    if (state.current.pendingTouch && isTouch && (e as React.TouchEvent).touches.length === 1) {
      const clientX = (e as React.TouchEvent).touches[0].clientX;
      const clientY = (e as React.TouchEvent).touches[0].clientY;
      const dx = clientX - state.current.pendingTouch.clientX;
      const dy = clientY - state.current.pendingTouch.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If moved more than threshold, start drawing
      if (distance > TOUCH_MOVEMENT_THRESHOLD) {
        clearTimeout(state.current.pendingTouch.timerId);
        state.current.isDrawing = true;
        state.current.lastX = state.current.pendingTouch.x;
        state.current.lastY = state.current.pendingTouch.y;
        plotLine(state.current.pendingTouch.x, state.current.pendingTouch.y, state.current.pendingTouch.x, state.current.pendingTouch.y);
        state.current.pendingTouch = null;
      }
    }

    if (!state.current.isDrawing && !state.current.isPanning) return;
    e.preventDefault();

    const clientX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    if (state.current.isPanning) {
      const dx = clientX - state.current.lastClientX;
      const dy = clientY - state.current.lastClientY;
      state.current.panX += dx;
      state.current.panY += dy;
      updateTransform();
      state.current.lastClientX = clientX;
      state.current.lastClientY = clientY;
    } else if (state.current.isDrawing) {
      const coords = getLocalCoordinates(clientX, clientY);
      plotLine(state.current.lastX, state.current.lastY, coords.x, coords.y);
      state.current.lastX = coords.x;
      state.current.lastY = coords.y;
      state.current.lastClientX = clientX;
      state.current.lastClientY = clientY;
    }
  };

  const handleEnd = () => {
    // Cancel any pending touch drawing
    if (state.current.pendingTouch) {
      clearTimeout(state.current.pendingTouch.timerId);
      state.current.pendingTouch = null;
    }
    
    if (state.current.isDrawing) {
        saveHistory();
    }
    state.current.isDrawing = false;
    state.current.isPanning = false;
    state.current.isPinching = false;
    if (viewportRef.current) viewportRef.current.style.cursor = tool === 'hand' ? 'grab' : 'crosshair';
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.2;
    applyZoom(delta, e.clientX, e.clientY);
  };

  const applyZoom = (delta: number, clientX?: number, clientY?: number) => {
    const oldScale = state.current.scale;
    let newScale = oldScale + delta;
    newScale = Math.max(0.5, Math.min(newScale, 10));

    const rect = viewportRef.current!.getBoundingClientRect();
    const centerX = clientX ?? (rect.left + rect.width / 2);
    const centerY = clientY ?? (rect.top + rect.height / 2);

    const worldX = (centerX - rect.left - state.current.panX) / oldScale;
    const worldY = (centerY - rect.top - state.current.panY) / oldScale;

    const newPanX = (centerX - rect.left) - worldX * newScale;
    const newPanY = (centerY - rect.top) - worldY * newScale;

    state.current.scale = newScale;
    state.current.panX = newPanX;
    state.current.panY = newPanY;
    updateTransform();
  };

  const handleClear = () => {
    if (confirm('全消去しますか？')) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 320, 120);
        saveHistory();
      }
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    
    // 1. Generate Image Blob
    canvasRef.current.toBlob((blob: Blob | null) => {
      if (!blob) return;

      // 2. Generate Packed Data
      const ctx = canvasRef.current!.getContext('2d');
      if (!ctx) return;
      
      const width = 320;
      const height = 120;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Pack bits: 1 bit per pixel. 0=black, 1=white.
      // We'll use a byte array.
      const packedLength = Math.ceil((width * height) / 8);
      const packedData = new Uint8Array(packedLength);
      
      for (let i = 0; i < width * height; i++) {
        const pixelIndex = i * 4;
        // Check if pixel is white (R > 128)
        const isWhite = data[pixelIndex] > 128;
        
        if (isWhite) {
          const byteIndex = Math.floor(i / 8);
          const bitIndex = 7 - (i % 8); // MSB first
          packedData[byteIndex] |= (1 << bitIndex);
        }
      }
      
      // Convert Uint8Array to Base64 string
      let binary = '';
      const len = packedData.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(packedData[i]);
      }
      const base64Data = window.btoa(binary);

      onSave(blob, base64Data, name, description);
    }, 'image/png');
  };

  // Don't render until mounted (for portal to work with SSR)
  if (!isMounted) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-gray-900 w-full h-full md:h-auto md:max-w-6xl md:max-h-[90vh] md:rounded-xl flex flex-col overflow-hidden shadow-2xl border border-gray-700">
        
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 shrink-0">
          <div className="px-4 py-3 flex justify-between items-center">
            <h2 className="text-white font-bold flex items-center gap-2">
              <IconBrush />
              <span>Drawing Editor</span>
            </h2>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-3 py-1.5 rounded text-gray-300 hover:bg-gray-700 transition">
                キャンセル
              </button>
              <button onClick={handleSave} className="px-4 py-1.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg">
                完了
              </button>
            </div>
          </div>
          <div className="px-4 pb-3 flex gap-2">
            <input 
              type="text" 
              placeholder="タイトル (任意)" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 text-sm flex-1"
            />
            <input 
              type="text" 
              placeholder="説明 (任意)" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 text-sm flex-[2]"
            />
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Viewport */}
          <div 
            ref={viewportRef}
            id="viewport"
            className="flex-grow relative overflow-hidden bg-[#1a1a1a] cursor-crosshair touch-none"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onWheel={handleWheel}
            style={{
                backgroundImage: `
                    linear-gradient(45deg, #2a2a2a 25%, transparent 25%), 
                    linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #2a2a2a 75%), 
                    linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          >
            <canvas 
              ref={canvasRef}
              width={320} 
              height={120}
              className="absolute left-0 top-0 shadow-lg bg-white origin-top-left pointer-events-none"
              style={{ imageRendering: 'pixelated' }}
            />
            
            {/* Zoom Controls Overlay */}
            <div className="absolute bottom-4 right-4 bg-gray-900/90 p-2 rounded-lg flex flex-col items-center gap-2 backdrop-blur-sm border border-gray-700 shadow-xl z-10">
                <button onClick={() => applyZoom(0.5)} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded transition">+</button>
                <span className="text-xs font-mono text-blue-400 select-none">{Math.round(scale * 100)}%</span>
                <button onClick={() => applyZoom(-0.5)} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded transition">-</button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-gray-800 border-t md:border-t-0 md:border-l border-gray-700 select-none shrink-0 w-full md:w-24 flex md:flex-col justify-between items-center p-2 md:p-4 gap-2 z-20 overflow-x-auto md:overflow-x-visible">
             <div className="flex md:flex-col gap-2 w-full md:w-auto justify-center min-w-max">
                <div className="flex md:flex-col gap-2">
                    <button 
                        onClick={() => setTool('pen')}
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-lg border flex justify-center items-center text-lg md:text-2xl transition ${tool === 'pen' ? 'bg-blue-600 border-blue-600 text-white shadow-md transform -translate-y-0.5' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                        title="ペン"
                    >
                        <IconPen />
                    </button>
                    <button 
                        onClick={() => setTool('eraser')}
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-lg border flex justify-center items-center text-lg md:text-2xl transition ${tool === 'eraser' ? 'bg-blue-600 border-blue-600 text-white shadow-md transform -translate-y-0.5' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                        title="消しゴム"
                    >
                        <IconEraser />
                    </button>
                    <button 
                        onClick={() => setTool('hand')}
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-lg border flex justify-center items-center text-lg md:text-2xl transition ${tool === 'hand' ? 'bg-blue-600 border-blue-600 text-white shadow-md transform -translate-y-0.5' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                        title="移動"
                    >
                        <IconHand />
                    </button>
                </div>

                <div className="w-px h-10 md:w-full md:h-px bg-gray-600 mx-1 md:mx-0 md:my-2"></div>

                <div className="flex md:flex-col gap-2">
                    <button 
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-lg border flex justify-center items-center text-lg md:text-2xl transition ${historyIndex <= 0 ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                        title="元に戻す"
                    >
                        <IconUndo />
                    </button>
                    <button 
                        onClick={redo}
                        disabled={historyIndex >= historyRef.current.length - 1}
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-lg border flex justify-center items-center text-lg md:text-2xl transition ${historyIndex >= historyRef.current.length - 1 ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                        title="やり直し"
                    >
                        <IconRedo />
                    </button>
                </div>

                <div className="w-px h-10 md:w-full md:h-px bg-gray-600 mx-1 md:mx-0 md:my-2"></div>

                <button 
                    onClick={() => setBrushShape(prev => prev === 'square' ? 'circle' : 'square')}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-lg border border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 flex justify-center items-center text-lg md:text-xl transition"
                    title="ブラシ形状"
                >
                    {brushShape === 'square' ? <IconSquare /> : <IconCircle />}
                </button>
             </div>

             <div className="flex flex-col items-center gap-1 w-32 md:w-full px-2 min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-gray-400">サイズ</span>
                    <div 
                        className="bg-white border border-gray-500" 
                        style={{
                            width: brushSize, 
                            height: brushSize, 
                            backgroundColor: tool === 'eraser' ? 'white' : 'black',
                            borderColor: tool === 'eraser' ? '#ccc' : 'transparent',
                            borderRadius: (brushShape === 'circle' && brushSize > 2) ? '50%' : '0%',
                            imageRendering: 'pixelated'
                        }}
                    ></div>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full h-6 bg-transparent cursor-pointer appearance-none min-w-[100px]"
                />
                <span className="text-xs text-blue-300 font-bold mt-1">{brushSize}px</span>
            </div>

            <button 
                onClick={handleClear}
                className="w-12 h-10 md:w-full md:h-auto md:py-3 rounded-lg border border-red-800 bg-red-900/40 text-red-400 hover:bg-red-900/60 transition text-xs flex flex-col items-center justify-center whitespace-nowrap"
            >
                <div className="md:mb-1"><IconTrash /></div>
                <span className="hidden md:inline">全消去</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
