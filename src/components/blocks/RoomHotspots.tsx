"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoomHotspot } from "@/types/blocks";

interface RoomHotspotsProps {
  hotspots: RoomHotspot[];
}

/**
 * RoomHotspots — Client Component
 * 
 * Interactive "Shop the Room" pins overlaid on the hero lifestyle image.
 * Supports hover and mobile thumb tap to reveal a sleek floating mini-card.
 */
export function RoomHotspots({ hotspots }: RoomHotspotsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {hotspots.map((hotspot) => {
        const isActive = activeId === hotspot.id;

        return (
          <div
            key={hotspot.id}
            style={{
              left: `${hotspot.xPercent}%`,
              top: `${hotspot.yPercent}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            onMouseEnter={() => setActiveId(hotspot.id)}
            onMouseLeave={() => setActiveId(null)}
          >
            {/* Pulsing White Circular Pin (Min 44x44px clickable target) */}
            <button
              type="button"
              onClick={() => setActiveId((prev) => (prev === hotspot.id ? null : hotspot.id))}
              aria-label={`View ${hotspot.title}`}
              aria-expanded={isActive}
              className="relative w-11 h-11 flex items-center justify-center cursor-pointer touch-manipulation group"
            >
              {/* Outer pulsing ring */}
              <span className="absolute w-8 h-8 rounded-full bg-white/40 animate-ping pointer-events-none" />

              {/* Main white disc */}
              <span className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 text-[#18181B] shadow-xl backdrop-blur-sm border border-black/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 active:scale-95">
                <Plus className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] transition-transform duration-200", isActive && "rotate-45")} />
              </span>
            </button>

            {/* Sleek Floating Glass / White Mini-Card */}
            {isActive && (
              <div 
                className={cn(
                  "absolute z-30 bottom-full mb-2.5 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-2",
                  // Flip position if near top/edge
                  hotspot.yPercent < 25 && "bottom-auto top-full mt-2.5",
                  hotspot.xPercent > 70 && "left-auto right-0 translate-x-0"
                )}
              >
                <Link
                  href={hotspot.href}
                  className="group/card flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-2xl border border-black/10 transition-transform duration-150 hover:scale-[1.02] active:scale-95 whitespace-nowrap min-w-[160px]"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-[#18181B] leading-tight group-hover/card:text-[#9A3412] transition-colors">
                      {hotspot.title}
                    </span>
                    <span className="text-[11px] font-medium text-[#71717A] mt-0.5">
                      {hotspot.price}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#18181B]/5 flex items-center justify-center text-[#18181B] group-hover/card:bg-[#18181B] group-hover/card:text-white transition-colors ml-auto">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
