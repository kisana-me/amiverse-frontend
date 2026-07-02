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
// 基準倍率(1)の前後この範囲は1に吸着させ、通過時に引っかかりを作る
const SCALE_SNAP_RANGE = 0.12;
// ホイール操作がこの時間空いたら別ジェスチャとみなし、吸着後の倍率から再開する
const WHEEL_GESTURE_GAP_MS = 400;
// タッチ操作後にブラウザが発火する合成マウスイベントを無視する時間
const SYNTHETIC_MOUSE_SUPPRESS_MS = 800;

export default function MediaViewer({ mediaList, initialIndex, isOpen, onClose }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [showUI, setShowUI] = useState(true);

  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const [swipeOffsetY, setSwipeOffsetY] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'none' | 'horizontal' | 'vertical'>('none');
  const [isSwipeTransitioning, setIsSwipeTransitioning] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ジェスチャ処理は再レンダリングを待たず連続で走るため、最新値をrefでも保持する
  const scaleRef = useRef(1);
  const positionRef = useRef({ x: 0, y: 0 });
  // 吸着(スナップ)前の生の倍率。吸着帯を通り抜ける判定に使う
  const rawScaleRef = useRef(1);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const pinchRef = useRef<{ dist: number; midX: number; midY: number } | null>(null);
  const lastWheelTimeRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const touchMovedRef = useRef(false);

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
      rawScaleRef.current = 1;
      scaleRef.current = 1;
      positionRef.current = { x: 0, y: 0 };
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

  const clampScale = (value: number) => Math.min(Math.max(MIN_SCALE, value), MAX_SCALE);

  // 基準倍率付近は1に吸着させる
  const snapScale = (value: number) => (Math.abs(value - 1) < SCALE_SNAP_RANGE ? 1 : value);

  const setTransform = (nextScale: number, nextPosition: { x: number; y: number }) => {
    scaleRef.current = nextScale;
    positionRef.current = nextPosition;
    setScale(nextScale);
    setPosition(nextPosition);
  };

  // prevFocal の直下にある画像上の点が、倍率変更後に focal の位置へ来るような position を求める
  const calcFocalPosition = (
    nextScale: number,
    focal: { x: number; y: number },
    prevFocal: { x: number; y: number },
  ) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return positionRef.current;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const ratio = nextScale / scaleRef.current;
    return {
      x: focal.x - cx - (prevFocal.x - cx - positionRef.current.x) * ratio,
      y: focal.y - cy - (prevFocal.y - cy - positionRef.current.y) * ratio,
    };
  };

  const resetZoom = () => {
    rawScaleRef.current = 1;
    setTransform(1, { x: 0, y: 0 });
  };

  const nextImage = useCallback(() => {
    if (currentIndex < mediaList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      rawScaleRef.current = 1;
      scaleRef.current = 1;
      positionRef.current = { x: 0, y: 0 };
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [currentIndex, mediaList.length]);

  const prevImage = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      rawScaleRef.current = 1;
      scaleRef.current = 1;
      positionRef.current = { x: 0, y: 0 };
      setScale(1);
      setPosition({ x: 0, y: 0 });
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
    const now = Date.now();
    // 一連のホイール操作が途切れたら、吸着中の生の倍率を表示倍率に合わせ直す
    if (now - lastWheelTimeRef.current > WHEEL_GESTURE_GAP_MS) {
      rawScaleRef.current = scaleRef.current;
    }
    lastWheelTimeRef.current = now;

    rawScaleRef.current = clampScale(rawScaleRef.current + e.deltaY * -0.002);
    const newScale = snapScale(rawScaleRef.current);
    if (newScale === scaleRef.current) return;

    // マウスカーソル位置を基準に拡大縮小する
    const focal = { x: e.clientX, y: e.clientY };
    const newPosition = newScale <= 1 ? { x: 0, y: 0 } : calcFocalPosition(newScale, focal, focal);
    setTransform(newScale, newPosition);
  };

  // タッチ操作の直後に発火する合成マウスイベントか
  const isSyntheticMouse = () => Date.now() - lastTouchTimeRef.current < SYNTHETIC_MOUSE_SUPPRESS_MS;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSyntheticMouse()) return;
    mouseDownRef.current = { x: e.clientX, y: e.clientY };
    didDragRef.current = false;
    if (scaleRef.current > 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - positionRef.current.x, y: e.clientY - positionRef.current.y };
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
    if (isDragging && scaleRef.current > 1) {
      e.preventDefault();
      setTransform(scaleRef.current, {
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
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
    if (scaleRef.current !== 1) {
      resetZoom();
    } else {
      const focal = { x, y };
      rawScaleRef.current = DOUBLE_TAP_ZOOM;
      setTransform(DOUBLE_TAP_ZOOM, calcFocalPosition(DOUBLE_TAP_ZOOM, focal, focal));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    lastTouchTimeRef.current = Date.now();

    if (e.touches.length === 1) {
      const now = Date.now();
      const touch = e.touches[0];

      if (
        lastTapRef.current &&
        now - lastTapRef.current.time < DOUBLE_TAP_DELAY &&
        Math.abs(touch.clientX - lastTapRef.current.x) < 30 &&
        Math.abs(touch.clientY - lastTapRef.current.y) < 30
      ) {
        // ダブルタップ: 予約済みのシングルタップ(UI切替)を取り消してズームのみ行う
        if (singleTapTimerRef.current) {
          clearTimeout(singleTapTimerRef.current);
          singleTapTimerRef.current = null;
        }
        lastTapRef.current = null;
        touchMovedRef.current = true;
        handleDoubleTap(touch.clientX, touch.clientY);
        touchStartRef.current = null;
        return;
      }

      lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
      touchMovedRef.current = false;

      if (scaleRef.current !== 1) {
        setIsDragging(true);
        dragStartRef.current = { x: touch.clientX - positionRef.current.x, y: touch.clientY - positionRef.current.y };
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
      touchMovedRef.current = true;
      setIsDragging(false);
      setSwipeDirection('none');
      setSwipeOffsetX(0);
      setSwipeOffsetY(0);
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      pinchRef.current = {
        dist: Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY),
        midX: (t0.clientX + t1.clientX) / 2,
        midY: (t0.clientY + t1.clientY) / 2,
      };
      rawScaleRef.current = scaleRef.current;
      setIsPinching(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];

      if (
        lastTapRef.current &&
        (Math.abs(touch.clientX - lastTapRef.current.x) > SINGLE_TAP_MAX_MOVE ||
          Math.abs(touch.clientY - lastTapRef.current.y) > SINGLE_TAP_MAX_MOVE)
      ) {
        touchMovedRef.current = true;
      }

      if (scaleRef.current !== 1 && isDragging) {
        setTransform(scaleRef.current, {
          x: touch.clientX - dragStartRef.current.x,
          y: touch.clientY - dragStartRef.current.y,
        });
      } else if (scaleRef.current === 1 && touchStartRef.current) {
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;

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
    } else if (e.touches.length === 2 && pinchRef.current) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const mid = { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
      const prev = pinchRef.current;

      if (prev.dist > 0) {
        rawScaleRef.current = clampScale(rawScaleRef.current * (dist / prev.dist));
      }
      const newScale = snapScale(rawScaleRef.current);
      // 2本指の中間点を基準に拡大縮小し、中間点の移動には画像を追従させる
      const newPosition = newScale <= 1
        ? { x: 0, y: 0 }
        : calcFocalPosition(newScale, mid, { x: prev.midX, y: prev.midY });
      setTransform(newScale, newPosition);
      pinchRef.current = { dist, midX: mid.x, midY: mid.y };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    lastTouchTimeRef.current = Date.now();

    if (pinchRef.current) {
      if (e.touches.length >= 2) return;
      pinchRef.current = null;
      setIsPinching(false);
      if (scaleRef.current === 1) {
        rawScaleRef.current = 1;
      }
      if (e.touches.length === 1 && scaleRef.current !== 1) {
        // 指が1本残った場合はそのままドラッグに移行する
        const touch = e.touches[0];
        setIsDragging(true);
        dragStartRef.current = { x: touch.clientX - positionRef.current.x, y: touch.clientY - positionRef.current.y };
      } else {
        setIsDragging(false);
      }
      return;
    }

    const wasSwiping = swipeDirection !== 'none';
    const touchStart = touchStartRef.current;

    if (scaleRef.current <= 1 && touchStart && wasSwiping) {
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

    if (e.touches.length === 0 && !wasSwiping && !touchMovedRef.current && lastTapRef.current) {
      // シングルタップ: ダブルタップ猶予が過ぎてからUI表示を切り替える
      singleTapTimerRef.current = setTimeout(() => {
        singleTapTimerRef.current = null;
        setShowUI(prev => !prev);
      }, DOUBLE_TAP_DELAY);
    }

    setIsDragging(false);
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
                    transition: isDragging || isPinching || swipeDirection === 'vertical' ? 'none' : 'transform 0.2s ease-out',
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
