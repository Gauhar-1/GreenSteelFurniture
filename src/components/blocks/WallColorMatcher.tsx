"use client";

import { useState } from "react";
import Link from "next/link";
import { NetworkResilientImage } from "@/components/ui/NetworkResilientImage";
import {
  ArrowRight,
  Check,
  Sparkles,
  ShieldCheck,
  Layers,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageZoomLightbox } from "@/components/ui/ImageZoomLightbox";
import type { WallColorMatcherBlockData, WallColorOption } from "@/types/blocks";

interface WallColorMatcherProps {
  data?: WallColorMatcherBlockData;
  className?: string;
}

/**
 * WallColorMatcher — Client Component ("Style & Material Matcher")
 * 
 * Luxury Dark-Mode Material Configurator & Steel-vs-Wood Architectural Bento:
 * - Surface: Deep Obsidian (#121214) to maintain the Dark-Light-Dark alternating cadence.
 * - Tactile material pills for velvet, leatherette, and etched glass with live cross-fade preview.
 * - Upgraded Architectural Bento Grid highlighting 4 core engineering advantages over traditional wood.
 */
export function WallColorMatcher({ data, className }: WallColorMatcherProps) {
  const combinations: WallColorOption[] = data?.combinations || [];
  const [activeWallColor, setActiveWallColor] = useState<string>(() => combinations[0]?.id || "");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!combinations || combinations.length === 0) {
    return (
      <section className={cn("w-full py-16 px-4 sm:px-8 bg-[#121214] text-[#FAF8F5] border-y border-white/10", className)}>
        <div className="max-w-7xl mx-auto p-8 rounded-2xl border border-white/10 bg-white/5 text-[#A1A1AA] text-center text-xs sm:text-sm font-medium">
          Material & style combinations not yet configured in Admin Studio.
        </div>
      </section>
    );
  }

  const currentOption =
    combinations.find((opt) => opt.id === activeWallColor) ||
    combinations[0];

  const hasImage = Boolean(currentOption?.image && currentOption.image.trim() !== "");
  const sectionTitle = data?.sectionTitle || data?.title || "Tailored to Your Interior";
  const sectionSubtitle =
    data?.sectionSubtitle ||
    data?.description ||
    "Pair our mirror-finish stainless steel frames with signature upholstery, tempered glass, and architectural finishes.";
  const showDurability = data?.showDurabilityStrip !== false;

  return (
    <section
      id="design-by-color"
      aria-label="Style & Material Matcher"
      className={cn(
        "w-full py-16 sm:py-24 px-4 sm:px-8 bg-[#121214] text-[#FAF8F5] border-y border-white/10 scroll-mt-20 select-none",
        className
      )}
    >
      <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
        {/* ============================================================ */}
        {/* 1. EDITORIAL HEADER & 50/50 MATERIAL STAGE                   */}
        {/* ============================================================ */}
        <div>
          {/* Header */}
          <div className="mb-8 sm:mb-12 text-left max-w-2xl">
            <span className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.25em] uppercase text-emerald-400 block mb-2">
              {data?.label || "Signature Material Pairings"}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-tight">
              {sectionTitle}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>

          {/* 50/50 Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            {/* Left / Top: Active Visual Stage with Smooth Cross-Fade & Zoom Lightbox */}
            <div 
              onClick={() => hasImage && setIsLightboxOpen(true)}
              className={cn(
                "group/stage relative w-full aspect-[4/5] max-h-[560px] rounded-3xl overflow-hidden bg-[#18181B] border border-white/10 shadow-2xl transition-all duration-300",
                hasImage && "cursor-zoom-in hover:border-white/30"
              )}
            >
              {hasImage ? (
                <NetworkResilientImage
                  key={currentOption.id}
                  src={currentOption.image}
                  alt={`${currentOption.wallName} with mirror stainless steel`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover/stage:scale-105"
                  priority={false}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center transition-colors duration-500"
                  style={{ backgroundColor: currentOption.hex }}
                >
                  <span className="text-xs sm:text-sm font-medium text-white/90 uppercase tracking-widest px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm border border-white/10">
                    {currentOption.wallName}
                  </span>
                </div>
              )}

              {/* Floating Pill on Image */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-white bg-[#121214]/90 backdrop-blur-md shadow-lg border border-white/15">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: currentOption.hex }}
                  />
                  <span>{currentOption.wallName}</span>
                </span>
              </div>

              {/* Corner Zoom Hint Pill */}
              {hasImage && (
                <button
                  type="button"
                  aria-label="Inspect finish up close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-[#121214]/85 hover:bg-[#121214] backdrop-blur-md border border-white/20 shadow-lg transition-all duration-200 cursor-pointer group-hover/stage:scale-105"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zoom</span>
                </button>
              )}

              {/* Bottom Caption Scrim */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 bg-gradient-to-t from-[#121214] via-[#121214]/60 to-transparent text-white pointer-events-none">
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block mb-1">
                  Active Material Finish
                </span>
                <p className="text-base sm:text-lg font-light text-white tracking-tight leading-snug">
                  {currentOption.wallName}
                </p>
              </div>
            </div>

            {/* Right / Bottom: Tactile Material Pills, Advice & CTA */}
            <div className="flex flex-col justify-center gap-6 sm:gap-7">
              <div>
                <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight leading-snug">
                  Select Your Signature Finish
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                  Explore how hand-finished 304 steel harmonizes with your room&apos;s upholstery and ambient light.
                </p>
              </div>

              {/* Tactile Material Selector Pills */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-[#A1A1AA]">
                  Curated Style Swatches:
                </span>
                <div
                  role="radiogroup"
                  aria-label="Material and finish choices"
                  className="flex flex-wrap gap-2.5"
                >
                  {combinations.map((option) => {
                    const isSelected = activeWallColor === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setActiveWallColor(option.id)}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer touch-manipulation active:scale-95",
                          isSelected
                            ? "bg-white text-[#121214] border-white shadow-lg font-semibold ring-1 ring-white"
                            : "bg-[#18181B] text-[#FAF8F5] border-white/15 hover:border-white/35 hover:bg-white/5"
                        )}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: option.hex }}
                        />
                        <span>{option.wallName}</span>
                        {isSelected && (
                          <Check className="w-3 h-3 ml-0.5 text-emerald-600 stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Styling Advice Card */}
              {currentOption.advice && (
                <div className="p-5 rounded-2xl bg-[#18181B] border border-white/10 flex items-start gap-4 transition-all">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
                      Architectural Styling Note
                    </span>
                    <p className="text-xs sm:text-sm font-normal text-[#D4D4D8] leading-relaxed italic">
                      &ldquo;{currentOption.advice}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* CTA Link */}
              <div>
                <Link
                  href={currentOption.ctaLink || currentOption.href || "/categories"}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#121214] bg-white hover:bg-emerald-400 shadow-xl active:scale-95 transition-all min-h-[44px] group"
                >
                  <span>{currentOption.ctaText || "Explore Matching Designs"}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. UPGRADED ARCHITECTURAL BENTO: PURE STEEL VS. WOOD         */}
        {/* ============================================================ */}
        {showDurability && (
          <div className="pt-12 sm:pt-16 border-t border-white/10 space-y-8">
            {/* Header */}
            <div className="text-left max-w-2xl">
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-emerald-400 block mb-2">
                Architectural Superiority · Pure Steel vs. Wood
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-tight leading-tight">
                Engineered for Generations, Not Seasons
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                Why modern Indian households are replacing wooden wardrobes and beds with precision 304-grade steel.
              </p>
            </div>

            {/* Asymmetric 12-Column Architectural Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
              {/* Card 1: Master Feature Anchor (7 Cols) */}
              <div className="md:col-span-12 lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#18181B] via-[#18181B] to-[#121214] border border-emerald-500/30 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl">
                {/* Subtle Ambient Radial Glow */}
                <div
                  className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
                  aria-hidden="true"
                />

                <div className="space-y-4 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-widest uppercase bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pillar 01 · Lifetime Structural Defense</span>
                  </div>

                  <h4 className="text-xl sm:text-2xl font-light text-white tracking-tight leading-snug">
                    100% Termite, Borer & Monsoon Immunity
                  </h4>

                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-xl">
                    Indian monsoon humidity causes wooden wardrobes to absorb moisture, swell, warp, and fall victim to hidden subterranean termites. Pure CRCA and 304-grade steel are impervious to dampness and biological decay.
                  </p>
                </div>

                {/* Head-to-Head Comparison Strip */}
                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-mono font-semibold uppercase">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Traditional Wood</span>
                    </div>
                    <p className="text-xs text-[#A1A1AA]">
                      45% moisture absorption, seasonal sticking drawers, and severe termite hollow risk.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono font-semibold uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Green Steel</span>
                    </div>
                    <p className="text-xs text-emerald-100/90 font-medium">
                      0% water absorption, 100% termite proof with 25-Year Anti-Sag Structural Warranty.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Surface Purity (5 Cols) */}
              <div className="md:col-span-12 sm:col-span-6 lg:col-span-5 rounded-3xl bg-[#18181B] border border-white/10 p-6 sm:p-8 flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-widest uppercase bg-white/5 border border-white/10 text-[#A1A1AA]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pillar 02 · Surface Purity</span>
                  </div>

                  <h4 className="text-xl font-light text-white tracking-tight">
                    Optical Mirror Brilliance
                  </h4>

                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                    Heavy-gauge hand-buffed 304 stainless steel wipes spotless in 10 seconds with a microfiber cloth. Never requires toxic chemical polishes, varnishing, or sanding.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span>Wipes Clean in 10s</span>
                  <span className="text-[#A1A1AA]">Zero Toxic Fumes</span>
                </div>
              </div>

              {/* Card 3: Structural Strength (6 Cols) */}
              <div className="md:col-span-12 sm:col-span-6 lg:col-span-6 rounded-3xl bg-[#18181B] border border-white/10 p-6 sm:p-8 flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-widest uppercase bg-white/5 border border-white/10 text-[#A1A1AA]">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pillar 03 · TIG Argon Seams</span>
                  </div>

                  <h4 className="text-xl font-light text-white tracking-tight">
                    300kg+ Load Bearing & Zero Creak
                  </h4>

                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                    Wooden joints rely on glue dowels and drywall screws that loosen and creak under humidity shifts. Continuous argon-welded steel seams unite as a monolithic frame with zero wobble.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span>300kg+ Tested Load</span>
                  <span className="text-[#A1A1AA]">Zero Joint Squeaks</span>
                </div>
              </div>

              {/* Card 4: Economic Value & Safety (6 Cols) */}
              <div className="md:col-span-12 lg:col-span-6 rounded-3xl bg-[#18181B] border border-white/10 p-6 sm:p-8 flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-widest uppercase bg-white/5 border border-white/10 text-[#A1A1AA]">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pillar 04 · Economic Intelligence</span>
                  </div>

                  <h4 className="text-xl font-light text-white tracking-tight">
                    ₹0 Annual Maintenance Expense
                  </h4>

                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                    Recurring carpentry fixes, pest treatments, and hinge replacements cost ₹15,000–₹25,000 every few seasons. Green Steel investment stays factory-new for life with non-combustible fire safety.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>Non-Combustible Fire Rating</span>
                  </span>
                  <span className="text-[#A1A1AA]">100% Recyclable</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Zoom Lightbox Modal */}
      <ImageZoomLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageUrl={currentOption?.image || ""}
        alt={currentOption?.wallName || "Material Finish"}
        caption={`${currentOption?.wallName || "Signature Steel Pairing"}${currentOption?.advice ? ` • ${currentOption.advice}` : ""}`}
      />
    </section>
  );
}
