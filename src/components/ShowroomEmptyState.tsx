import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { TactileButton } from "@/components/ui/TactileButton";

/**
 * ShowroomEmptyState — Refined luxury fallback when zero landing blocks are active
 * Palette: #FAF8F5 surface with #18181B architectural ink
 */
export function ShowroomEmptyState() {
  return (
    <section
      aria-label="Showroom Under Curation"
      className="w-full min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 bg-[#FAF8F5] text-center select-none"
    >
      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* Subtle Decorative Architectural Badge */}
        <div className="w-14 h-14 rounded-2xl bg-[#EDE9E1] border border-black/5 flex items-center justify-center text-[#9A3412] mb-6 shadow-xs">
          <Sparkles className="w-6 h-6 stroke-[1.75]" />
        </div>

        {/* Minimal Category Header */}
        <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#71717A] mb-3">
          Architectural Steel Collections
        </span>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#18181B] tracking-tight leading-tight">
          Curated For Generations.
        </h1>

        {/* Subtext */}
        <p className="mt-4 text-sm sm:text-base text-[#71717A] font-normal leading-relaxed max-w-md">
          Our Digital Showroom is currently being curated. Explore our live furniture collections below.
        </p>

        {/* Action Button */}
        <div className="mt-8">
          <Link href="/categories" className="inline-block">
            <TactileButton variant="secondary" className="px-7 py-3.5 rounded-full flex items-center gap-2">
              <span>Explore Furniture Collections</span>
              <ArrowRight className="w-4 h-4" />
            </TactileButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
