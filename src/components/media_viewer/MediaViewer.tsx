"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

type MediaType = {
  url: string;
  aid?: string;
  name?: string;
  type: 'image' | 'video' | 'drawing';
};

interface MediaViewerProps {
  mediaList: MediaType[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaViewer({ mediaList, initialIndex, isOpen, onClose }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  // Touch state
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState<number>(1);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
      setIsInitialRender(true);
      // アニメーションを有効にするために少し遅延させる
      timer = setTimeout(() => setIsInitialRender(false), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, initialIndex]);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const nextImage = () => {
    if (currentIndex < mediaList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetZoom();
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      resetZoom();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, mediaList.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted || !isOpen) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    nextImage();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    prevImage();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY * -0.002;
    const newScale = Math.min(Math.max(1, scale + delta), 5);
    setScale(newScale);
    if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDistance(dist);
      setInitialScale(scale);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      // e.preventDefault(); 
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    } else if (e.touches.length === 2 && initialPinchDistance) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.max(1, Math.min(5, initialScale * (dist / initialPinchDistance)));
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialPinchDistance(null);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2"
        onClick={onClose}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      {currentIndex > 0 && (
        <button 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50 p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
          onClick={handlePrev}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
      )}

      {currentIndex < mediaList.length - 1 && (
        <button 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50 p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
          onClick={handleNext}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      )}

      <div 
        className="relative w-full h-full overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={`flex h-full ease-out ${isInitialRender ? 'transition-none' : 'transition-transform duration-300'}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {mediaList.map((media, index) => (
            <div key={media.aid || index} className="w-full h-full flex-shrink-0 flex items-center justify-center">
              {media.type === 'image' || media.type === 'drawing' ? (
                <img 
                  src={media.url} 
                  alt={media.name || "Preview"}
                  className="max-w-full max-h-full object-contain select-none"
                  style={index === currentIndex ? { 
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    imageRendering: media.type === 'drawing' ? 'pixelated' : undefined
                  } : {
                    imageRendering: media.type === 'drawing' ? 'pixelated' : undefined
                  }}
                  draggable={false}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                >
                  <video 
                    src={media.url} 
                    className="max-w-full max-h-full" 
                    controls 
                    autoPlay={index === currentIndex}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {mediaList[currentIndex].name && (
          <div className="text-white/90 text-sm font-medium drop-shadow-md select-text cursor-text">
            {mediaList[currentIndex].name}
          </div>
        )}
        <div className="text-white/80 bg-black/40 px-3 py-1 rounded-full text-sm backdrop-blur-sm select-text cursor-text">
          {currentIndex + 1} / {mediaList.length}
        </div>
      </div>
    </div>,
    document.body
  );
}
