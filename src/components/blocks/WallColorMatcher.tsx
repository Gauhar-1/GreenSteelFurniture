"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import type { WallColorMatcherBlockData, WallColorOption } from "@/types/blocks";

interface WallColorMatcherProps {
  data?: WallColorMatcherBlockData;
  className?: string;
}

/**
 * WallColorMatcher — Client Component ("Design by Color")
 * 
 * Interactive Wall Color Matcher:
 * - 100% Dynamic combinations driven by Supabase storefront_sections.
 * - Real-time state-driven visual preview across curated interior wall combinations.
 * - Mobile: Top image (aspect-[4/5]) + Bottom wrapped swatches, advice & CTA.
 * - Desktop: 50/50 split view with large editorial imagery and generous tappable swatches.
 */
export function WallColorMatcher({ data, className }: WallColorMatcherProps) {
  const combinations: WallColorOption[] = data?.combinations || [];
  const [activeWallColor, setActiveWallColor] = useState<string>(() => combinations[0]?.id || "");

  if (!combinations || combinations.length === 0) {
    return (
      <section className={cn("w-full py-16 px-4 sm:px-8 max-w-7xl mx-auto bg-[#FAF8F5]", className)}>
        <div className="p-8 rounded-2xl border border-black/10 bg-[#EDE9E1]/50 text-[#71717A] text-center text-xs sm:text-sm font-medium">
          Wall color combinations not yet configured in Admin Studio.
        </div>
      </section>
    );
  }

  const currentOption =
    combinations.find((opt) => opt.id === activeWallColor) ||
    combinations[0];

  const hasImage = Boolean(currentOption?.image && currentOption.image.trim() !== "");

  return (
    <section
      id="design-by-color"
      aria-label="Design by Color - Wall Color Matcher"
      className={cn(
        "w-full py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto bg-[#FAF8F5] scroll-mt-20",
        className
      )}
    >
      {/* Editorial Section Label */}
      <div className="mb-8 sm:mb-12 text-left">
        <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#71717A] block mb-2">
          Harmonious Living
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#18181B] tracking-tight">
          Design by Color
        </h2>
      </div>

      {/* 50/50 Split View (Mobile: Stacked, Desktop: Side-by-Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        {/* Left / Top: Active Visual Preview with Smooth Cross-Fade */}
        <div className="relative w-full aspect-[4/5] max-h-[580px] rounded-2xl overflow-hidden bg-[#EDE9E1] shadow-xs">
          {hasImage ? (
            <Image
              key={currentOption.id}
              src={currentOption.image}
              alt={`${currentOption.wallName} paired with pure steel furniture`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-opacity duration-500 ease-out"
              priority={false}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center transition-colors duration-500"
              style={{ backgroundColor: currentOption.hex }}
            >
              <span className="text-xs sm:text-sm font-medium text-white/90 uppercase tracking-widest px-4 py-2 bg-black/30 rounded-full backdrop-blur-xs">
                {currentOption.wallName}
              </span>
            </div>
          )}

          {/* Minimal Floating Badge on Image */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#18181B] bg-white/90 backdrop-blur-md shadow-xs">
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                style={{ backgroundColor: currentOption.hex }}
              />
              <span>{currentOption.wallName}</span>
            </span>
          </div>
        </div>

        {/* Right / Bottom: Content, Swatches, Advice & CTA */}
        <div className="flex flex-col justify-center gap-6 sm:gap-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-light text-[#18181B] tracking-tight leading-snug">
              What color are your walls?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-[#71717A] font-normal leading-relaxed">
              Select your room&apos;s wall palette to see our curated pure steel finish recommendations.
            </p>
          </div>

          {/* Color Swatches Row with flex-wrap and responsive alignment */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#18181B]/70">
              Select Wall Tone:
            </span>
            <div
              role="radiogroup"
              aria-label="Wall palette choices"
              className="flex flex-wrap justify-center sm:justify-start items-center gap-3.5 sm:gap-4.5"
            >
              {combinations.map((option) => {
                const isSelected = activeWallColor === option.id;
                const shortLabel = option.wallName.replace(" Walls", "");

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setActiveWallColor(option.id)}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer touch-manipulation focus-visible:outline-2 focus-visible:outline-[#18181B]"
                  >
                    <div
                      style={{ backgroundColor: option.hex }}
                      className={cn(
                        "relative w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 transition-transform duration-200 flex items-center justify-center active:scale-95 shadow-xs",
                        isSelected
                          ? "ring-2 ring-offset-2 ring-[#18181B] border-white scale-110 shadow-md"
                          : "border-black/10 group-hover:scale-105"
                      )}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#18181B] drop-shadow-xs stroke-[2.5]" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] sm:text-[11px] font-medium transition-colors text-center whitespace-nowrap",
                        isSelected
                          ? "text-[#18181B] font-semibold"
                          : "text-[#71717A] group-hover:text-[#18181B]"
                      )}
                    >
                      {shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Advice Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F1EB] border border-[#18181B]/5 flex items-start gap-3.5 transition-all">
            <div className="w-8 h-8 rounded-full bg-[#18181B]/5 flex items-center justify-center text-[#9A3412] shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9A3412] block mb-1">
                Showroom Stylist Advice
              </span>
              <p className="text-sm sm:text-base font-normal text-[#18181B] leading-relaxed">
                &ldquo;{currentOption.advice}&rdquo;
              </p>
            </div>
          </div>

          {/* CTA: Shop This Look */}
          <div>
            <Link
              href={currentOption.ctaLink || "/categories"}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#FAF8F5] bg-[#18181B] hover:bg-[#18181B]/90 shadow-sm active:scale-95 transition-all min-h-[44px] group"
            >
              <span>{currentOption.ctaText || "Shop Collections"}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
