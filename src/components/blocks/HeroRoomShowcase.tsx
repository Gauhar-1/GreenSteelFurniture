import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { RoomHotspots } from "@/components/blocks/RoomHotspots";
import type { HeroRoomShowcaseBlockData } from "@/types/blocks";
import { TactileButton } from "@/components/ui/TactileButton";

interface HeroRoomShowcaseProps {
  data: HeroRoomShowcaseBlockData;
  className?: string;
}

/**
 * HeroRoomShowcase — React Server Component
 * 
 * Architectural Flagship Showcase Hero:
 * - Obsidian framing (#121214) with edge-to-edge photography.
 * - Multi-stop dark scrim preventing text washout from chrome highlights.
 * - Dual-mode hotspots (product pins + craft spec callouts).
 * - Editorial typography with champagne/emerald eyebrow pill and tactile CTA.
 */
export function HeroRoomShowcase({ data, className }: HeroRoomShowcaseProps) {
  const { label, headline, imageUrl, imageAlt, cta, hotspots = [] } = data;

  if (!imageUrl || imageUrl.trim() === "") {
    return (
      <section className={`w-full py-16 px-6 bg-[#121214] text-[#FAF8F5] flex items-center justify-center text-center ${className || ""}`}>
        <div className="p-8 rounded-2xl border border-white/10 bg-white/5 text-[#A1A1AA] text-xs sm:text-sm font-medium">
          Hero Room Showcase image not yet configured in Admin Studio.
        </div>
      </section>
    );
  }

  const eyebrow = label || "PURE 304-GRADE STAINLESS STEEL · DIRECT FROM FACTORY";

  return (
    <section 
      aria-label="Flagship Stainless Steel Showcase"
      className={`relative w-full h-[82vh] sm:h-[86vh] md:h-[90vh] overflow-hidden bg-[#121214] text-[#FAF8F5] select-none ${className || ""}`}
    >
      {/* 1. Natural Flagship Photography with Priority LCP */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={imageAlt || headline || "304-Grade Stainless Steel Architectural Furniture Showcase"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* 2. Dual-Mode Interactive Hotspot Pins */}
      <RoomHotspots hotspots={hotspots} />

      {/* 3. Multi-Stop Dark Scrim (Bottom & Left) for Text Legibility Over Chrome & Marble */}
      <div 
        className="absolute inset-0 z-10 bg-gradient-to-t from-[#121214]/95 via-[#121214]/40 to-transparent pointer-events-none"
        aria-hidden="true"
      />
      <div 
        className="absolute inset-y-0 left-0 w-full sm:w-2/3 z-10 bg-gradient-to-r from-[#121214]/70 via-[#121214]/20 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* 4. Minimal Editorial Overlay */}
      <div className="absolute bottom-6 sm:bottom-12 left-6 sm:left-12 right-6 sm:right-auto z-20 max-w-xl text-left pointer-events-auto">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.22em] uppercase text-emerald-300 bg-[#163826]/85 border border-emerald-500/25 backdrop-blur-md mb-3 sm:mb-4 shadow-sm">
          <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>{eyebrow}</span>
        </div>

        {/* Editorial Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-tight leading-[1.12] drop-shadow-md">
          {headline}
        </h1>

        {/* Primary CTA */}
        {cta?.href && (
          <div className="mt-5 sm:mt-7">
            <Link href={cta.href} className="inline-block">
              <TactileButton
                variant="primary"
                className="bg-[#FAF8F5] text-[#121214] hover:bg-white border-0 shadow-2xl px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider group"
              >
                <span>{cta.label || "Explore Collections"}</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
              </TactileButton>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
