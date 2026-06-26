"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

type MediaType = {
  url: string;
  aid?: string;
  name?: string;
  description?: string;
  type: 'image' | 'video' | 'drawing';
};

interface MediaViewerProps {
  mediaList: MediaType[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const DISMISS_THRESHOLD = 120;
const DIRECTION_LOCK_THRESHOLD = 10;
const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const DOUBLE_TAP_DELAY = 300;
const DOUBLE_TAP_ZOOM = 2.5;
const SINGLE_TAP_MAX_MOVE = 10;

export default function MediaViewer({ mediaList, initialIndex, isOpen, onClose }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [showUI, setShowUI] = useState(true);

  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState<number>(1);

  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const [swipeOffsetY, setSwipeOffsetY] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'none' | 'horizontal' | 'vertical'>('none');
  const [isSwipeTransitioning, setIsSwipeTransitioning] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouseDownRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    const originalContent = viewportMeta?.getAttribute('content') || '';

    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    );

    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    const preventBrowserZoom = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
      }
    };

    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('gestureend', preventGesture, { passive: false });
    document.addEventListener('touchmove', preventBrowserZoom, { passive: false });

    return () => {
      if (viewportMeta) {
        if (originalContent) {
          viewportMeta.setAttribute('content', originalContent);
        } else {
          viewportMeta.removeAttribute('content');
        }
      }
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
      document.removeEventListener('touchmove', preventBrowserZoom);
    };
  }, [isOpen]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setSwipeOffsetX(0);
      setSwipeOffsetY(0);
      setSwipeDirection('none');
      setShowUI(true);
      document.body.style.overflow = 'hidden';
      setIsInitialRender(true);
      timer = setTimeout(() => setIsInitialRender(false), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    return () => {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
      }
    };
  }, []);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const nextImage = useCallback(() => {
    if (currentIndex < mediaList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetZoom();
    }
  }, [currentIndex, mediaList.length]);

  const prevImage = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      resetZoom();
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, mediaList.length, nextImage, prevImage, onClose]);

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
    const newScale = Math.min(Math.max(MIN_SCALE, scale + delta), MAX_SCALE);
    setScale(newScale);
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownRef.current = { x: e.clientX, y: e.clientY };
    didDragRef.current = false;
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseDownRef.current) {
      const dx = e.clientX - mouseDownRef.current.x;
      const dy = e.clientY - mouseDownRef.current.y;
      if (Math.abs(dx) > SINGLE_TAP_MAX_MOVE || Math.abs(dy) > SINGLE_TAP_MAX_MOVE) {
        didDragRef.current = true;
      }
    }
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    if (mouseDownRef.current && !didDragRef.current) {
      setShowUI(prev => !prev);
    }
    mouseDownRef.current = null;
    didDragRef.current = false;
    setIsDragging(false);
  };

  const handleDoubleTap = (x: number, y: number) => {
    if (scale !== 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const offsetX = (centerX - x) * (DOUBLE_TAP_ZOOM - 1);
      const offsetY = (centerY - y) * (DOUBLE_TAP_ZOOM - 1);
      setScale(DOUBLE_TAP_ZOOM);
      setPosition({ x: offsetX, y: offsetY });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const now = Date.now();
      const touch = e.touches[0];

      if (
        lastTapRef.current &&
        now - lastTapRef.current.time < DOUBLE_TAP_DELAY &&
        Math.abs(touch.clientX - lastTapRef.current.x) < 30 &&
        Math.abs(touch.clientY - lastTapRef.current.y) < 30
      ) {
        if (singleTapTimerRef.current) {
          clearTimeout(singleTapTimerRef.current);
          singleTapTimerRef.current = null;
        }
        lastTapRef.current = null;
        handleDoubleTap(touch.clientX, touch.clientY);
        touchStartRef.current = null;
        return;
      }

      lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };

      if (scale > 1 || scale < 1) {
        setIsDragging(true);
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      } else {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: now
        };
        setSwipeDirection('none');
        setSwipeOffsetX(0);
        setSwipeOffsetY(0);
      }
    } else if (e.touches.length === 2) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      touchStartRef.current = null;
      lastTapRef.current = null;
      setSwipeDirection('none');
      setSwipeOffsetX(0);
      setSwipeOffsetY(0);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDistance(dist);
      setInitialScale(scale);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if (scale !== 1 && isDragging) {
        setPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y
        });
      } else if (scale <= 1 && touchStartRef.current) {
        const dx = e.touches[0].clientX - touchStartRef.current.x;
        const dy = e.touches[0].clientY - touchStartRef.current.y;

        if (swipeDirection === 'none') {
          if (Math.abs(dx) > DIRECTION_LOCK_THRESHOLD || Math.abs(dy) > DIRECTION_LOCK_THRESHOLD) {
            if (Math.abs(dx) > Math.abs(dy)) {
              setSwipeDirection('horizontal');
            } else {
              setSwipeDirection('vertical');
            }
          }
          return;
        }

        if (swipeDirection === 'horizontal') {
          const isAtStart = currentIndex === 0 && dx > 0;
          const isAtEnd = currentIndex === mediaList.length - 1 && dx < 0;
          const resistance = (isAtStart || isAtEnd) ? 0.3 : 1;
          setSwipeOffsetX(dx * resistance);
        } else if (swipeDirection === 'vertical') {
          setSwipeOffsetY(dy);
        }
      }
    } else if (e.touches.length === 2 && initialPinchDistance) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, initialScale * (dist / initialPinchDistance)));
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    const wasSwiping = swipeDirection !== 'none';
    const wasDragging = isDragging && scale !== 1;
    const touchStart = touchStartRef.current;

    if (scale <= 1 && touchStart && wasSwiping) {
      const elapsed = Date.now() - touchStart.time;

      if (swipeDirection === 'horizontal') {
        const velocity = Math.abs(swipeOffsetX) / elapsed;
        const shouldSwipe = Math.abs(swipeOffsetX) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;

        if (shouldSwipe) {
          if (swipeOffsetX < 0 && currentIndex < mediaList.length - 1) {
            setIsSwipeTransitioning(true);
            nextImage();
            setTimeout(() => setIsSwipeTransitioning(false), 300);
          } else if (swipeOffsetX > 0 && currentIndex > 0) {
            setIsSwipeTransitioning(true);
            prevImage();
            setTimeout(() => setIsSwipeTransitioning(false), 300);
          }
        }
        setSwipeOffsetX(0);
      } else if (swipeDirection === 'vertical') {
        if (Math.abs(swipeOffsetY) > DISMISS_THRESHOLD) {
          onClose();
        }
        setSwipeOffsetY(0);
      }

      setSwipeDirection('none');
    }

    if (!wasSwiping && !wasDragging && touchStart) {
      const dx = lastTapRef.current ? Math.abs(lastTapRef.current.x - touchStart.x) : 0;
      const dy = lastTapRef.current ? Math.abs(lastTapRef.current.y - touchStart.y) : 0;
      const didMove = dx > SINGLE_TAP_MAX_MOVE || dy > SINGLE_TAP_MAX_MOVE;

      if (!didMove) {
        singleTapTimerRef.current = setTimeout(() => {
          singleTapTimerRef.current = null;
          setShowUI(prev => !prev);
        }, DOUBLE_TAP_DELAY);
      }
    }

    setIsDragging(false);
    setInitialPinchDistance(null);
    touchStartRef.current = null;
  };

  const dismissProgress = swipeDirection === 'vertical' ? Math.min(Math.abs(swipeOffsetY) / DISMISS_THRESHOLD, 1) : 0;
  const overlayOpacity = 1 - dismissProgress * 0.6;

  const uiStyle: React.CSSProperties = {
    opacity: showUI ? 1 : 0,
    pointerEvents: showUI ? 'auto' : 'none',
    transition: 'opacity 0.25s ease-out',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: `rgba(0, 0, 0, ${0.9 * overlayOpacity})`,
        backdropFilter: 'blur(4px)',
        transition: swipeDirection === 'vertical' ? 'none' : 'background-color 0.2s ease-out',
      }}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2 bg-black/30 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors"
        onClick={onClose}
        style={uiStyle}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      {currentIndex > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50 p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
          onClick={handlePrev}
          style={uiStyle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
      )}

      {currentIndex < mediaList.length - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50 p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
          onClick={handleNext}
          style={uiStyle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      )}

      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        style={{ touchAction: 'none' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          mouseDownRef.current = null;
          didDragRef.current = false;
          setIsDragging(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`flex h-full ease-out ${isInitialRender ? 'transition-none' : ''}`}
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${swipeOffsetX}px))`,
            transition: isInitialRender
              ? 'none'
              : swipeDirection === 'horizontal'
                ? 'none'
                : 'transform 0.3s ease-out',
          }}
        >
          {mediaList.map((media, index) => (
            <div key={media.aid || index} className="w-full h-full flex-shrink-0 flex items-center justify-center p-4">
              {media.type === 'image' || media.type === 'drawing' ? (
                <img
                  src={media.url}
                  alt={media.name || "Preview"}
                  className="object-contain select-none"
                  style={index === currentIndex ? {
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: '100%',
                    height: '100%',
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${(position.y + (swipeDirection === 'vertical' ? swipeOffsetY : 0)) / scale}px)`,
                    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    transition: isDragging || swipeDirection === 'vertical' ? 'none' : 'transform 0.2s ease-out',
                    opacity: 1 - dismissProgress * 0.3,
                    imageRendering: media.type === 'drawing' ? 'pixelated' : undefined
                  } : {
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: '100%',
                    height: '100%',
                    imageRendering: media.type === 'drawing' ? 'pixelated' : undefined
                  }}
                  draggable={false}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={index === currentIndex && swipeDirection === 'vertical' ? {
                    transform: `translateY(${swipeOffsetY}px)`,
                    transition: 'none',
                    opacity: 1 - dismissProgress * 0.3,
                  } : undefined}
                >
                  <video
                    src={media.url}
                    className="max-w-full max-h-full"
                    controls
                    autoPlay={index === currentIndex}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute top-4 left-4 z-50 text-white/80 bg-black/40 px-3 py-1 rounded-full text-sm backdrop-blur-sm select-text cursor-text"
        style={uiStyle}
      >
        {currentIndex + 1} / {mediaList.length}
      </div>

      {(mediaList[currentIndex].name || mediaList[currentIndex].description) && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2 max-w-[80vw] text-center"
          style={uiStyle}
        >
          {mediaList[currentIndex].name && (
            <div className="text-white/90 text-sm font-medium select-text cursor-text">
              {mediaList[currentIndex].name}
            </div>
          )}
          {mediaList[currentIndex].description && (
            <div className="text-white/70 text-xs select-text cursor-text mt-1">
              {mediaList[currentIndex].description}
            </div>
          )}
        </div>
      )}
    </div>,
    document.body
  );
}
