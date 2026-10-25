"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types/pdp";

interface ProductImageGalleryProps {
  galleryOutside: GalleryImage[];
  galleryInside: GalleryImage[];
  selectedFinishOutsideImage?: string;
  selectedFinishInsideImage?: string;
  className?: string;
}

/**
 * ProductImageGallery — Client Component
 * 
 * Luxury Editorial PDP Gallery:
 * - Mobile: Swipeable full-width carousel with slide dots.
 * - Desktop: Vertical stack of massive edge-to-edge images (md:col-span-7).
 * - "Bahar/Andar" Floating Pill: Swaps image array between Outside View & Inside Locker.
 */
export function ProductImageGallery({
  galleryOutside,
  galleryInside,
  selectedFinishOutsideImage,
  selectedFinishInsideImage,
  className,
}: ProductImageGalleryProps) {
  const [viewMode, setViewMode] = useState<"outside" | "inside">("outside");
  const [activeSlide, setActiveSlide] = useState(0);

  // Dynamically reflect active finish in the hero image of the gallery
  const effectiveOutside = selectedFinishOutsideImage
    ? [
        { src: selectedFinishOutsideImage, alt: galleryOutside[0]?.alt || "Product view" },
        ...galleryOutside.slice(1),
      ]
    : galleryOutside;

  const effectiveInside = selectedFinishInsideImage
    ? [
        { src: selectedFinishInsideImage, alt: galleryInside[0]?.alt || "Interior safe locker view" },
        ...galleryInside.slice(1),
      ]
    : galleryInside;

  const activeImages = viewMode === "outside" ? effectiveOutside : effectiveInside;

  return (
    <div className={cn("relative w-full flex flex-col gap-4", className)}>
      {/* ================= DESKTOP VERTICAL IMAGE STACK (hidden md:flex) ================= */}
      <div className="hidden md:flex flex-col gap-6">
        {activeImages.map((img, idx) => (
          <div
            key={`${viewMode}-${img.src}-${idx}`}
            className="group relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-[#EDE9E1] shadow-2xs"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={idx === 0}
              sizes="(max-width: 1200px) 60vw, 55vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />

            {/* Subtle Gradient for Bottom Contrast on First Image */}
            {idx === 0 && (
              <div 
                className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" 
                aria-hidden="true" 
              />
            )}

            {/* Floating "Bahar / Andar" Toggle on First Image */}
            {idx === 0 && (
              <div className="absolute bottom-6 inset-x-0 flex justify-center z-20 pointer-events-auto">
                <div
                  role="group"
                  aria-label="Toggle outside and inside locker view"
                  className="inline-flex items-center p-1 rounded-full bg-white/90 backdrop-blur-xl border border-black/10 shadow-xl"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("outside");
                      setActiveSlide(0);
                    }}
                    aria-pressed={viewMode === "outside"}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer touch-manipulation min-h-[36px]",
                      viewMode === "outside"
                        ? "bg-[#18181B] text-[#FAF8F5] shadow-xs"
                        : "text-[#18181B]/70 hover:text-[#18181B]"
                    )}
                  >
                    Outside View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("inside");
                      setActiveSlide(0);
                    }}
                    aria-pressed={viewMode === "inside"}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer touch-manipulation min-h-[36px]",
                      viewMode === "inside"
                        ? "bg-[#18181B] text-[#FAF8F5] shadow-xs"
                        : "text-[#18181B]/70 hover:text-[#18181B]"
                    )}
                  >
                    Inside Locker
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ================= MOBILE SWIPEABLE CAROUSEL (flex md:hidden) ================= */}
      <div className="flex md:hidden flex-col relative">
        <div
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / el.clientWidth);
            setActiveSlide(index);
          }}
          className="w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-2xl"
        >
          {activeImages.map((img, idx) => (
            <div
              key={`mobile-${viewMode}-${img.src}-${idx}`}
              className="relative w-full aspect-[4/5] shrink-0 snap-center overflow-hidden bg-[#EDE9E1]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover object-center"
              />

              {/* Bottom Gradient for View Toggle Contrast */}
              <div 
                className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" 
                aria-hidden="true" 
              />
            </div>
          ))}
        </div>

        {/* Floating Mobile "Bahar / Andar" Pill Overlay */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center z-20 pointer-events-auto">
          <div
            role="group"
            aria-label="Toggle outside and inside locker view"
            className="inline-flex items-center p-1 rounded-full bg-white/95 backdrop-blur-xl border border-black/10 shadow-lg"
          >
            <button
              type="button"
              onClick={() => {
                setViewMode("outside");
                setActiveSlide(0);
              }}
              aria-pressed={viewMode === "outside"}
              className={cn(
                "px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all duration-150 cursor-pointer touch-manipulation min-h-[34px]",
                viewMode === "outside"
                  ? "bg-[#18181B] text-[#FAF8F5] shadow-xs"
                  : "text-[#18181B]/70"
              )}
            >
              Outside View
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("inside");
                setActiveSlide(0);
              }}
              aria-pressed={viewMode === "inside"}
              className={cn(
                "px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all duration-150 cursor-pointer touch-manipulation min-h-[34px]",
                viewMode === "inside"
                  ? "bg-[#18181B] text-[#FAF8F5] shadow-xs"
                  : "text-[#18181B]/70"
              )}
            >
              Inside Locker
            </button>
          </div>
        </div>

        {/* Carousel Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {activeImages.map((_, dotIdx) => (
            <span
              key={`dot-${dotIdx}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                activeSlide === dotIdx
                  ? "w-6 bg-[#18181B]"
                  : "w-1.5 bg-[#18181B]/20"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
