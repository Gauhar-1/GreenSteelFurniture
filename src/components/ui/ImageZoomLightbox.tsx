"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageZoomLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  caption?: string;
}

/**
 * ImageZoomLightbox — Full-Screen Interactive Zoom & Pan Lightbox
 * 
 * - Full-screen backdrop (#121214/95) with body scroll lock
 * - Floating pill bar: Zoom Out (-), Reset (100%), Zoom In (+), Close (X)
 * - Double-click / double-tap toggles between 1x and 2x
 * - Mouse wheel zoom (clamped 1x–3x)
 * - Pointer drag-to-pan when zoomed (scale > 1) via GPU-composited translate3d
 * - Closes on Escape or backdrop click outside the image
 */
export function ImageZoomLightbox({
  isOpen,
  onClose,
  imageUrl,
  alt,
  caption,
}: ImageZoomLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const posStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const lastTapRef = useRef<number>(0);

  // Reset zoom & pan when opening a new image or closing
  const resetTransform = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
    hasMovedRef.current = false;
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetTransform();
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, imageUrl, resetTransform]);

  // Keyboard navigation: Escape closes
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        setScale((prev) => Math.min(3, +(prev + 0.5).toFixed(2)));
      } else if (e.key === "-") {
        setScale((prev) => {
          const next = Math.max(1, +(prev - 0.5).toFixed(2));
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === "0") {
        resetTransform();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, resetTransform]);

  // Zoom helpers
  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(3, +(prev + 0.5).toFixed(2)));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(2));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    resetTransform();
  };

  // Double tap / double click toggle 1x <-> 2x
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      resetTransform();
    } else {
      setScale(2);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      if (scale > 1) {
        resetTransform();
      } else {
        setScale(2);
        setPosition({ x: 0, y: 0 });
      }
    }
    lastTapRef.current = now;
    handlePointerUp();
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((prev) => {
      const next = Math.min(3, Math.max(1, +(prev + delta).toFixed(2)));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Drag to pan when scale > 1
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (scale <= 1) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: clientX, y: clientY };
    posStartRef.current = { ...position };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging || scale <= 1) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }
    // Limit panning bounds proportional to scale
    const maxBound = (scale - 1) * 360;
    const nextX = Math.max(-maxBound, Math.min(maxBound, posStartRef.current.x + dx));
    const nextY = Math.max(-maxBound, Math.min(maxBound, posStartRef.current.y + dy));
    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Zoom Preview"
      onClick={() => {
        if (!hasMovedRef.current) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-[#121214]/95 backdrop-blur-md flex flex-col justify-between items-center select-none overflow-hidden touch-none"
    >
      {/* Top Floating Control Bar */}
      <div 
        className="w-full max-w-xl mx-auto px-4 pt-4 sm:pt-6 z-20 flex items-center justify-between pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Caption Tag / Counter */}
        <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-wider uppercase text-white/70 truncate max-w-[180px] sm:max-w-xs">
          {alt || "Architectural Inspection"}
        </span>

        {/* Floating Controls Pill Bar */}
        <div className="inline-flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-white/10 backdrop-blur-lg border border-white/15 text-white shadow-xl">
          <button
            type="button"
            aria-label="Zoom Out"
            disabled={scale <= 1}
            onClick={handleZoomOut}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            type="button"
            aria-label="Reset Zoom"
            onClick={handleReset}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold hover:bg-white/15 transition-all cursor-pointer"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            aria-label="Zoom In"
            disabled={scale >= 3}
            onClick={handleZoomIn}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

          <button
            type="button"
            aria-label="Reset Transform"
            onClick={handleReset}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/15 transition-all cursor-pointer"
            title="Reset to 100%"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            type="button"
            aria-label="Close Lightbox"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Center Image Stage */}
      <div
        className="relative w-full flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={(e) => {
          e.preventDefault();
          handlePointerDown(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => {
          if (e.touches[0]) {
            handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className={cn(
            "relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center will-change-transform",
            isDragging
              ? "transition-none"
              : "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          )}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={alt}
              fill
              priority
              draggable={false}
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-contain object-center pointer-events-none select-none drop-shadow-2xl"
            />
          )}
        </div>
      </div>

      {/* Bottom Caption Pill */}
      <div 
        className="w-full max-w-xl mx-auto px-4 pb-4 sm:pb-6 z-20 flex flex-col items-center text-center pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {caption && (
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs sm:text-sm font-light leading-relaxed max-w-md shadow-lg">
            {caption}
          </div>
        )}
        <span className="text-[10px] text-white/40 mt-2 font-mono">
          Double-click or scroll to zoom • Drag to pan • Press Esc to exit
        </span>
      </div>
    </div>
  );
}

