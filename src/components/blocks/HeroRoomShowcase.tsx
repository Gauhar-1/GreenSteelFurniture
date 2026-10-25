import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RoomHotspots } from "@/components/blocks/RoomHotspots";
import type { HeroRoomShowcaseBlockData } from "@/types/blocks";

interface HeroRoomShowcaseProps {
  data: HeroRoomShowcaseBlockData;
  className?: string;
}

/**
 * HeroRoomShowcase — React Server Component
 * 
 * Editorial "Shop the Room" Hero:
 * - Natural, unobstructed sunlit photography (NO colored overlays).
 * - Interactive pulsing hotspots revealing floating product cards.
 * - Minimal, high-end editorial typography positioned strictly in bottom-left.
 */
export function HeroRoomShowcase({ data, className }: HeroRoomShowcaseProps) {
  const { label, headline, imageUrl, imageAlt, cta, hotspots = [] } = data;

  if (!imageUrl || imageUrl.trim() === "") {
    return (
      <section className={`w-full py-16 px-6 bg-[#FAF8F5] flex items-center justify-center text-center ${className || ""}`}>
        <div className="p-8 rounded-2xl border border-black/10 bg-[#EDE9E1]/50 text-[#71717A] text-xs sm:text-sm font-medium">
          Hero Room Showcase image not yet configured in Admin Studio.
        </div>
      </section>
    );
  }

  return (
    <section 
      aria-label="Room Showcase Hero"
      className={`relative w-full h-[80vh] sm:h-[84vh] md:h-[88vh] overflow-hidden bg-[#FAF8F5] select-none ${className || ""}`}
    >
      {/* 1. Natural Room Photography with Priority LCP (100% Unobstructed) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={imageAlt || headline || "Architectural steel furniture room setting"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* 2. Interactive "Shop the Room" Pins */}
      <RoomHotspots hotspots={hotspots} />

      {/* 3. Minimal Bottom-Left Vignette & Title Overlay */}
      <div 
        className="absolute inset-x-0 bottom-0 z-10 pt-28 pb-8 sm:pb-12 px-6 sm:px-12 bg-gradient-to-t from-black/75 via-black/35 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="absolute bottom-6 sm:bottom-12 left-6 sm:left-12 z-20 max-w-xl text-left pointer-events-auto">
        {/* Uppercase Tracking-Widest Label */}
        <span className="inline-block text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-white/80 drop-shadow-sm mb-2 sm:mb-3">
          {label}
        </span>

        {/* Clean Editorial Heading (Max 5-7 words) */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-tight leading-[1.12] drop-shadow-md">
          {headline}
        </h1>

        {/* Sleek White Pill Button */}
        {cta?.href && (
          <div className="mt-5 sm:mt-7">
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-[#18181B] bg-white hover:bg-white/90 shadow-xl transition-all duration-200 active:scale-95 min-h-[44px] touch-manipulation group"
            >
              <span>{cta.label || "Explore Collections"}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
