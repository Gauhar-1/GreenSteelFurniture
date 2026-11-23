import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisualCraftsmanshipSplitBlockData } from "@/types/blocks";

interface VisualCraftsmanshipSplitProps {
  data?: VisualCraftsmanshipSplitBlockData;
  className?: string;
}

/**
 * VisualCraftsmanshipSplit — React Server Component
 * 
 * Dark-Mode Engineering & Craftsmanship Split:
 * - Deep Obsidian (#121214) surface with hairline dividers creating rhythmic contrast.
 * - Elevated charcoal (#18181B) card frames highlighting mirror-polished steel, welds, and finials.
 * - High-contrast editorial titles and engineering captions.
 */
export function VisualCraftsmanshipSplit({ data, className }: VisualCraftsmanshipSplitProps) {
  if (!data || (!data.left?.imageUrl && !data.right?.imageUrl)) {
    return (
      <section className={cn("w-full py-16 px-4 sm:px-8 bg-[#121214] text-[#FAF8F5] border-y border-white/10", className)}>
        <div className="max-w-7xl mx-auto p-8 rounded-2xl border border-white/10 bg-white/5 text-[#A1A1AA] text-center text-xs sm:text-sm font-medium">
          Visual craftsmanship content not yet configured in Admin Studio.
        </div>
      </section>
    );
  }

  const { left, right } = data;

  const visuals = [
    {
      ...left,
      key: "left",
      badge: "01 · SURFACE & FINISH",
      defaultCaption: "Mirror-grade 304 stainless steel hand-buffed to optical brilliance.",
    },
    {
      ...right,
      key: "right",
      badge: "02 · STRUCTURAL INTEGRITY",
      defaultCaption: "Precision argon-welded joints engineered for zero deflection.",
    },
  ];

  return (
    <section 
      aria-label="Materials and Architectural Craftsmanship"
      className={cn("w-full py-16 sm:py-24 px-4 sm:px-8 bg-[#121214] text-[#FAF8F5] border-y border-white/10 select-none", className)}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-left max-w-xl">
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-emerald-400 block mb-2">
            Architectural Jewelry
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-tight leading-tight">
            The Anatomy of Heavy-Gauge Steel
          </h2>
        </div>

        {/* 2-Column Visual Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {visuals.map((item) => {
            const hasImage = Boolean(item.imageUrl && item.imageUrl.trim() !== "");
            const captionText = item.caption || item.defaultCaption;

            return (
              <div
                key={item.key}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#18181B] border border-white/10 shadow-xl transition-all duration-300 hover:border-white/25 hover:shadow-2xl"
              >
                {/* Macro Detail Image Frame */}
                <div className="relative w-full aspect-4/3 sm:aspect-16/10 overflow-hidden bg-[#27272A]">
                  {hasImage && item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt || captionText || "Craftsmanship detail"}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#27272A] to-[#18181B]" />
                  )}

                  {/* Spec Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-[0.2em] bg-[#163826]/90 text-[#FAF8F5] border border-emerald-500/30 backdrop-blur-md shadow-xs">
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Bottom Caption Strip */}
                <div className="p-5 sm:p-6 flex items-end justify-between gap-4 bg-[#18181B]">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-[0.22em] text-[#A1A1AA] block mb-1">
                      Engineering Detail
                    </span>
                    <p className="text-base sm:text-lg font-light text-white tracking-tight leading-snug">
                      {captionText}
                    </p>
                  </div>

                  {item.href && (
                    <Link
                      href={item.href}
                      className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white hover:text-[#121214] flex items-center justify-center transition-colors shrink-0 ml-2"
                      aria-label={`Learn more about ${captionText}`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
