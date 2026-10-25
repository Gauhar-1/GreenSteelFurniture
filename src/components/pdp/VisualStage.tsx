"use client";

import React, { useRef, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisualDimensionGuide } from "./VisualDimensionGuide";
import type { CategoryTheme } from "@/lib/categoryThemes";

export interface VisualStageProps {
  finishMedia: Record<string, string>;
  finishName: string;
  productTitle: string;
  slot3Label: string;
  blueprintType?: string;
  dimensions?: {
    height?: number;
    width?: number;
    depth?: number;
    length?: number;
    headboard_height?: number;
    total_height?: number;
    seat_height?: number;
    unit?: "inches";
  };
  theme: CategoryTheme;
  className?: string;
}

interface VisualMode {
  id: string;
  label: string;
  media?: string;
  isSvg?: boolean;
}

/**
 * VisualStage — Seamless Swipable Product Showcase
 * 
 * - Smooth horizontal multi-slide track: images slide side-by-side with 0 snapping.
 * - Real-time follow-through dragging for all devices (mobile touch swipe + desktop mouse drag).
 * - Apple-style cubic-bezier deceleration easing curve for fluid, responsive transitions.
 * - Dot and dash pagination indicator: active image is an elongated dash, inactive are dots.
 * - Clean website theme styling (transparent background inheriting theme.bgSurface).
 * - Dynamically resolves only uploaded images (1 required, 3 optional) + Size Chart (SVG).
 */
export function VisualStage({
  finishMedia,
  finishName,
  productTitle,
  slot3Label,
  blueprintType = "wardrobe",
  dimensions,
  theme,
  className,
}: VisualStageProps) {
  const [activeModeId, setActiveModeId] = useState<string>("lifestyle");
  const stageRef = useRef<HTMLDivElement>(null);

  // Drag / Swipe State for Touch & Mouse
  const [isDragging, setIsDragging] = useState(false);
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Helper: Validate non-empty string URL
  const isValidMedia = (url?: unknown): url is string => {
    if (typeof url !== "string") return false;
    const trimmed = url.trim();
    return (
      trimmed.length > 0 &&
      trimmed !== "undefined" &&
      trimmed !== "null" &&
      !trimmed.endsWith("/undefined") &&
      !trimmed.endsWith("/null")
    );
  };

  // Inspect all possible keys for the 4 slots
  const lifestyleUrl =
    (isValidMedia(finishMedia?.lifestyle) && finishMedia.lifestyle) ||
    (isValidMedia(finishMedia?.lifestyle_image) && finishMedia.lifestyle_image);

  const frontUrl =
    (isValidMedia(finishMedia?.front) && finishMedia.front) ||
    (isValidMedia(finishMedia?.studio) && finishMedia.studio) ||
    (isValidMedia(finishMedia?.studio_front_image) && finishMedia.studio_front_image);

  const functionalUrl =
    (isValidMedia(finishMedia?.functional) && finishMedia.functional) ||
    (isValidMedia(finishMedia?.functional_view_image) && finishMedia.functional_view_image) ||
    (isValidMedia(finishMedia?.dynamic_functional_image) && finishMedia.dynamic_functional_image) ||
    (isValidMedia(finishMedia?.inside) && finishMedia.inside);

  const macroUrl =
    (isValidMedia(finishMedia?.macro) && finishMedia.macro) ||
    (isValidMedia(finishMedia?.macro_detail_image) && finishMedia.macro_detail_image);

  // Dynamically assemble ONLY the photo modes that are actually available
  const availableModes = useMemo<VisualMode[]>(() => {
    const modes: VisualMode[] = [];

    if (lifestyleUrl) {
      modes.push({
        id: "lifestyle",
        label: "Room View",
        media: lifestyleUrl,
      });
    }

    if (frontUrl) {
      modes.push({
        id: "front",
        label: "Studio View",
        media: frontUrl,
      });
    }

    if (functionalUrl) {
      modes.push({
        id: "functional",
        label: slot3Label || "Inside Locker",
        media: functionalUrl,
      });
    }

    if (macroUrl) {
      modes.push({
        id: "macro",
        label: "Steel Detail",
        media: macroUrl,
      });
    }

    // Fallback if none of standard slot keys matched but some media was provided
    if (modes.length === 0) {
      const anyValid = Object.entries(finishMedia || {}).find(
        ([k, v]) =>
          isValidMedia(v) &&
          !["id", "finish_name", "hex_code", "is_default"].includes(k)
      );
      if (anyValid) {
        modes.push({
          id: "primary",
          label: "Showroom View",
          media: anyValid[1],
        });
      } else {
        modes.push({
          id: "fallback",
          label: "Room View",
          media: "/hero-bedroom.png",
        });
      }
    }

    // Architectural Size Chart (SVG)
    modes.push({
      id: "size-chart",
      label: "Size Chart (SVG)",
      isSvg: true,
    });

    return modes;
  }, [lifestyleUrl, frontUrl, functionalUrl, macroUrl, finishMedia, slot3Label]);

  // Resolve active index based on activeModeId; fallback to 0 if not found
  const activeModeIndex = useMemo(() => {
    const idx = availableModes.findIndex((m) => m.id === activeModeId);
    return idx !== -1 ? idx : 0;
  }, [availableModes, activeModeId]);

  const activeModeItem = availableModes[activeModeIndex] || availableModes[0];
  const isAtFirst = activeModeIndex === 0;
  const isAtLast = activeModeIndex === availableModes.length - 1;

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (activeModeIndex < availableModes.length - 1) {
      setActiveModeId(availableModes[activeModeIndex + 1].id);
    }
  }, [availableModes, activeModeIndex]);

  const handlePrev = useCallback(() => {
    if (activeModeIndex > 0) {
      setActiveModeId(availableModes[activeModeIndex - 1].id);
    }
  }, [availableModes, activeModeIndex]);

  // Touch Swipe Handlers (Mobile / Tablets)
  const handleTouchStart = (e: React.TouchEvent) => {
    isPointerDownRef.current = true;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    startTimeRef.current = Date.now();
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPointerDownRef.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;

    // Only drag horizontally if horizontal movement dominates vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if ((isAtFirst && diffX > 0) || (isAtLast && diffX < 0)) {
        setDragOffset(diffX * 0.25); // Elastic rubber-band resistance
      } else {
        setDragOffset(diffX);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isPointerDownRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startXRef.current;
    const diffY = endY - startYRef.current;
    const elapsed = Date.now() - startTimeRef.current;
    const velocity = Math.abs(diffX) / (elapsed || 1);

    isPointerDownRef.current = false;
    setIsDragging(false);
    setDragOffset(0);

    if (Math.abs(diffX) > Math.abs(diffY)) {
      const isFlick = velocity > 0.35 && Math.abs(diffX) > 30;
      const isDragCross = Math.abs(diffX) > 60;

      if (isFlick || isDragCross) {
        if (diffX < 0 && !isAtLast) {
          setActiveModeId(availableModes[activeModeIndex + 1].id);
        } else if (diffX > 0 && !isAtFirst) {
          setActiveModeId(availableModes[activeModeIndex - 1].id);
        }
      }
    }
  };

  // Desktop Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary left click
    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startTimeRef.current = Date.now();
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPointerDownRef.current) return;
    const diffX = e.clientX - startXRef.current;

    if ((isAtFirst && diffX > 0) || (isAtLast && diffX < 0)) {
      setDragOffset(diffX * 0.25);
    } else {
      setDragOffset(diffX);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isPointerDownRef.current) return;
    const diffX = e.clientX - startXRef.current;
    const elapsed = Date.now() - startTimeRef.current;
    const velocity = Math.abs(diffX) / (elapsed || 1);

    isPointerDownRef.current = false;
    setIsDragging(false);
    setDragOffset(0);

    const isFlick = velocity > 0.35 && Math.abs(diffX) > 30;
    const isDragCross = Math.abs(diffX) > 60;

    if (isFlick || isDragCross) {
      if (diffX < 0 && !isAtLast) {
        setActiveModeId(availableModes[activeModeIndex + 1].id);
      } else if (diffX > 0 && !isAtFirst) {
        setActiveModeId(availableModes[activeModeIndex - 1].id);
      }
    }
  };

  const handleMouseLeave = () => {
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="region"
      aria-label="Product Showcase Visual Stage"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative w-full h-full flex flex-col justify-between overflow-hidden select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
        "cursor-grab active:cursor-grabbing",
        className
      )}
    >
      {/* Top Floating Badge on Visual Stage */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase bg-black/75 text-white backdrop-blur-md border border-white/15 shadow-xs">
          {activeModeItem.label}
        </span>
        <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/85 text-[#18181B] backdrop-blur-md border border-black/10 shadow-xs">
          Finish: {finishName}
        </span>
      </div>

      {/* Main Continuous Sliding Track Frame */}
      <div className="relative w-full flex-1 overflow-hidden min-h-0 flex items-center justify-center">
        <div
          className={cn(
            "w-full h-full flex flex-row will-change-transform",
            isDragging
              ? "transition-none"
              : "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          )}
          style={{
            transform: `translateX(calc(-${activeModeIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {availableModes.map((mode, idx) => (
            <div
              key={mode.id}
              className="w-full h-full shrink-0 flex-none flex items-center justify-center py-2 sm:py-3 px-2 sm:px-4 select-none relative"
              aria-hidden={activeModeIndex !== idx}
            >
              {mode.isSvg ? (
                <div className="w-full h-full max-h-[70vh] flex items-center justify-center p-2 sm:p-4 pointer-events-auto">
                  <VisualDimensionGuide
                    variant="light"
                    heightInches={dimensions?.height || 78}
                    widthInches={dimensions?.width || 36}
                    depthInches={dimensions?.depth || 22}
                    lengthInches={dimensions?.length}
                    headboardHeight={dimensions?.headboard_height}
                    seatHeight={dimensions?.seat_height}
                    blueprintType={blueprintType}
                    note="Laser-measured precision steel fabrication. All dimensions in inches."
                    className="h-full w-full max-w-xl mx-auto shadow-sm"
                  />
                </div>
              ) : (
                <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center p-2">
                  <Image
                    src={mode.media || "/hero-bedroom.png"}
                    alt={`${productTitle} - ${mode.label}`}
                    fill
                    priority={idx === 0 || idx === activeModeIndex}
                    draggable={false}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-contain object-center pointer-events-none select-none"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Desktop Hover Chevrons */}
      {availableModes.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            disabled={isAtFirst}
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className={cn(
              "hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#18181B] items-center justify-center backdrop-blur-md border border-black/10 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95",
              isAtFirst && "opacity-0 group-hover:opacity-20 pointer-events-none"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            disabled={isAtLast}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className={cn(
              "hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#18181B] items-center justify-center backdrop-blur-md border border-black/10 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95",
              isAtLast && "opacity-0 group-hover:opacity-20 pointer-events-none"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom Bar: Dot & Dash Pagination Indicator + Counter */}
      {availableModes.length > 0 && (
        <div className="w-full pb-2.5 pt-2 px-3 sm:px-4 z-20 flex items-center justify-between shrink-0">
          {/* Active Image Counter & Label */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] sm:text-xs font-bold text-[#18181B] tracking-wider bg-black/5 px-2 py-0.5 rounded-md border border-black/10">
              {String(activeModeIndex + 1).padStart(2, "0")} / {String(availableModes.length).padStart(2, "0")}
            </span>
            <span className="text-[11px] sm:text-xs text-[#18181B]/75 font-medium truncate max-w-[130px] sm:max-w-[220px]">
              {activeModeItem.label}
            </span>
          </div>

          {/* Dot and Dash Indicator Bar */}
          <div
            className="flex items-center gap-1.5 sm:gap-2"
            role="tablist"
            aria-label="Image views"
          >
            {availableModes.map((mode, idx) => {
              const isActive = activeModeIndex === idx;
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`View ${idx + 1} of ${availableModes.length}: ${mode.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModeId(mode.id);
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]/40",
                    isActive
                      ? "w-7 sm:w-9 bg-[#18181B] shadow-xs"
                      : "w-2 sm:w-2.5 bg-[#18181B]/20 hover:bg-[#18181B]/45 hover:scale-125"
                  )}
                />
              );
            })}
          </div>

          {/* Swipe Hint */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#71717A] tracking-wider uppercase font-medium">
            <span>Swipe to view</span>
          </div>
        </div>
      )}
    </div>
  );
}
