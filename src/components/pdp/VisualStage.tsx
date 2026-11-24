"use client";

import React, { useRef, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisualDimensionGuide } from "./VisualDimensionGuide";
import { BlueprintScaleChart } from "./BlueprintScaleChart";
import { ImageZoomLightbox } from "@/components/ui/ImageZoomLightbox";
import { NetworkResilientImage } from "@/components/ui/NetworkResilientImage";
import { resolveBlueprintType, BLUEPRINT_TYPES, type BlueprintType } from "@/lib/blueprintUtils";
import type { CategoryTheme } from "@/lib/categoryThemes";
import type { ProductCatalogItem } from "@/services/ProductService";

export interface VisualStageProps {
  finishMedia: Record<string, string>;
  finishName: string;
  productTitle: string;
  categoryName?: string;
  slot3Label: string;
  blueprintType?: string;
  productBlueprintType?: string | null;
  selectedSize?: ProductCatalogItem["sizes"][number] | null;
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
  activeModeId?: string;
  onModeChange?: (modeId: string) => void;
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
  categoryName,
  slot3Label,
  blueprintType = "wardrobe",
  productBlueprintType,
  selectedSize,
  dimensions,
  theme,
  className,
  activeModeId: propActiveModeId,
  onModeChange,
}: VisualStageProps) {
  const [internalModeId, setInternalModeId] = useState<string>("lifestyle");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const activeModeId = propActiveModeId !== undefined ? propActiveModeId : internalModeId;

  const handleSetModeId = useCallback(
    (id: string) => {
      if (onModeChange) {
        onModeChange(id);
      } else {
        setInternalModeId(id);
      }
    },
    [onModeChange]
  );

  const resolvedBlueprint = useMemo(() => {
    return resolveBlueprintType(
      productBlueprintType,
      blueprintType,
      `${productTitle} ${categoryName || ""}`
    );
  }, [productBlueprintType, blueprintType, productTitle, categoryName]);

  const hasProductBlueprint = Boolean(
    (productBlueprintType && productBlueprintType.trim()) ||
    resolvedBlueprint !== "generic_box"
  );
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
      label: hasProductBlueprint ? "Scale Blueprint" : "Size Chart (SVG)",
      isSvg: true,
    });

    return modes;
  }, [lifestyleUrl, frontUrl, functionalUrl, macroUrl, finishMedia, slot3Label, hasProductBlueprint]);

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
      handleSetModeId(availableModes[activeModeIndex + 1].id);
    }
  }, [availableModes, activeModeIndex, handleSetModeId]);

  const handlePrev = useCallback(() => {
    if (activeModeIndex > 0) {
      handleSetModeId(availableModes[activeModeIndex - 1].id);
    }
  }, [availableModes, activeModeIndex, handleSetModeId]);

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
          handleSetModeId(availableModes[activeModeIndex + 1].id);
        } else if (diffX > 0 && !isAtFirst) {
          handleSetModeId(availableModes[activeModeIndex - 1].id);
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
        handleSetModeId(availableModes[activeModeIndex + 1].id);
      } else if (diffX > 0 && !isAtFirst) {
        handleSetModeId(availableModes[activeModeIndex - 1].id);
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

      {/* Top-Right Floating Zoom Button (Active on Image Slides) */}
      {!activeModeItem.isSvg && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-black/65 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
          title="Zoom & Inspect High-Res Details"
        >
          <Maximize2 className="w-3.5 h-3.5 text-white/90" />
          <span className="hidden sm:inline">Zoom</span>
        </button>
      )}

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
                <div className="w-full h-full min-h-[320px] sm:min-h-[380px] max-h-[75vh] flex items-center justify-center p-1 sm:p-4 pointer-events-auto overflow-y-auto">
                  {hasProductBlueprint ? (
                    <BlueprintScaleChart
                      blueprintType={resolvedBlueprint}
                      selectedSize={selectedSize}
                      productTitle={productTitle}
                      className="w-full max-w-xl mx-auto shadow-sm"
                    />
                  ) : (
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
                  )}
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (Math.abs(dragOffset) < 5) {
                      setIsLightboxOpen(true);
                    }
                  }}
                  className="relative w-full h-full max-h-[70vh] flex items-center justify-center p-2 cursor-zoom-in"
                  title="Click to Zoom Fullscreen"
                >
                  <NetworkResilientImage
                    src={mode.media || "/hero-bedroom.png"}
                    alt={`${productTitle} - ${mode.label}`}
                    fill
                    priority={idx === 0}
                    draggable={false}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-contain object-center select-none"
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

      {/* Bottom Bar: Visual Mode Switcher Pills + Active Indicator */}
      {availableModes.length > 0 && (
        <div className="w-full pb-2.5 pt-2 px-3 sm:px-4 z-20 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Visual Mode Pills */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 max-w-full"
            role="tablist"
            aria-label="Image and blueprint views"
          >
            {availableModes.map((mode, idx) => {
              const isActive = activeModeIndex === idx;
              const isBlueprint = mode.id === "size-chart";

              return (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`View ${mode.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetModeId(mode.id);
                  }}
                  className={cn(
                    "px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide transition-all duration-200 cursor-pointer touch-manipulation flex items-center gap-1.5 select-none whitespace-nowrap",
                    isActive
                      ? isBlueprint
                        ? "bg-[#163826] text-emerald-300 ring-2 ring-emerald-500/40 shadow-xs"
                        : "bg-[#18181B] text-white shadow-xs"
                      : isBlueprint
                      ? "bg-white/85 text-[#163826] hover:bg-white border border-[#163826]/30 font-bold shadow-2xs"
                      : "bg-white/80 text-[#18181B]/70 hover:text-[#18181B] hover:bg-white border border-black/10"
                  )}
                >
                  {isBlueprint ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>📐 {mode.label}</span>
                    </>
                  ) : (
                    <span>{mode.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Image Counter */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#18181B] tracking-wider bg-black/5 px-2 py-0.5 rounded-md border border-black/10">
              {String(activeModeIndex + 1).padStart(2, "0")} / {String(availableModes.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      )}

      {/* High-Resolution Full-Screen Image Zoom Lightbox */}
      {!activeModeItem.isSvg && (
        <ImageZoomLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          imageUrl={activeModeItem.media || "/hero-bedroom.png"}
          alt={`${productTitle} - ${activeModeItem.label}`}
          caption={`${productTitle} — ${activeModeItem.label} in ${finishName}`}
        />
      )}
    </div>
  );
}
