"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoomHotspot } from "@/types/blocks";
import { InteractiveLinkCard } from "@/components/ui/InteractiveLinkCard";

interface RoomHotspotsProps {
  hotspots: RoomHotspot[];
}

/**
 * RoomHotspots — Client Component
 * 
 * Dual-Mode Interactive Hotspots:
 * - Product Hotspots: Pulsing white beacon revealing frosted glass PDP preview.
 * - Craft Spec Callouts: Metallic/emerald beacon revealing engineering tolerances.
 * - Dynamic 4-way boundary flipping preventing viewport clipping on 360px mobile viewports.
 */
export function RoomHotspots({ hotspots }: RoomHotspotsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {hotspots.map((hotspot) => {
        const isActive = activeId === hotspot.id;
        const isCraft = hotspot.kind === "craft";

        // Dynamic edge detection to prevent viewport overflow
        const isNearRight = hotspot.xPercent > 65;
        const isNearLeft = hotspot.xPercent < 35;
        const isNearTop = hotspot.yPercent < 30;

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
            {/* Hotspot Beacon (Min 44x44px touch target) */}
            <button
              type="button"
              onClick={() => setActiveId((prev) => (prev === hotspot.id ? null : hotspot.id))}
              aria-label={isCraft ? `Spec: ${hotspot.label || hotspot.title}` : `View ${hotspot.title}`}
              aria-expanded={isActive}
              className="relative w-11 h-11 flex items-center justify-center cursor-pointer touch-manipulation group"
            >
              {/* Outer pulsing ring */}
              <span
                className={cn(
                  "absolute w-8 h-8 rounded-full animate-ping pointer-events-none",
                  isCraft ? "bg-emerald-400/40" : "bg-white/40"
                )}
              />

              {/* Main disc */}
              <span
                className={cn(
                  "relative w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-2xl backdrop-blur-sm border flex items-center justify-center transition-transform duration-200 group-hover:scale-110 active:scale-95",
                  isCraft
                    ? "bg-[#163826]/90 text-emerald-300 border-emerald-500/40"
                    : "bg-white/95 text-[#121214] border-black/10"
                )}
              >
                {isCraft ? (
                  <Sparkles
                    className={cn(
                      "w-3.5 h-3.5 text-emerald-400 transition-transform duration-200",
                      isActive && "scale-110"
                    )}
                  />
                ) : (
                  <Plus
                    className={cn(
                      "w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] transition-transform duration-200",
                      isActive && "rotate-45"
                    )}
                  />
                )}
              </span>
            </button>

            {/* Dual-Mode Floating Card */}
            {isActive && (
              <div
                className={cn(
                  "absolute z-30 transition-all duration-200 ease-out animate-in fade-in zoom-in-95",
                  // Vertical placement
                  isNearTop ? "top-full mt-2.5" : "bottom-full mb-2.5",
                  // Horizontal placement
                  isNearRight
                    ? "right-0 translate-x-0"
                    : isNearLeft
                    ? "left-0 translate-x-0"
                    : "left-1/2 -translate-x-1/2"
                )}
              >
                {isCraft ? (
                  /* Craft Spec Callout Popover */
                  <div className="p-3.5 rounded-2xl bg-[#121214]/95 backdrop-blur-md border border-emerald-500/30 text-[#FAF8F5] shadow-2xl space-y-1.5 w-[240px] sm:w-[270px]">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Architectural Spec</span>
                    </div>
                    <h4 className="text-xs font-semibold text-white tracking-tight leading-snug">
                      {hotspot.label || hotspot.title}
                    </h4>
                    <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                      {hotspot.detail ||
                        "Argon-welded 304-grade stainless steel with mirror-polish longevity."}
                    </p>
                  </div>
                ) : (
                  /* Live Product Preview Popover */
                  <InteractiveLinkCard
                    href={hotspot.href || "/categories"}
                    ariaLabel={`Open ${hotspot.title}`}
                    className="group/card flex items-center gap-3 p-2.5 rounded-2xl bg-[#121214]/95 backdrop-blur-md shadow-2xl border border-white/15 text-[#FAF8F5] transition-transform duration-150 hover:scale-[1.02] active:scale-95 w-[240px] sm:w-[280px]"
                  >
                    {hotspot.imageUrl && (
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
                        <Image
                          src={hotspot.imageUrl}
                          alt={hotspot.title}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                    )}
                    <div className="flex flex-col text-left overflow-hidden min-w-0 flex-1">
                      <span className="text-xs font-semibold text-white leading-tight truncate group-hover/card:text-emerald-300 transition-colors">
                        {hotspot.title}
                      </span>
                      {hotspot.price && (
                        <span className="text-[11px] font-mono font-medium text-emerald-400 mt-0.5">
                          {hotspot.price}
                        </span>
                      )}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover/card:bg-white group-hover/card:text-[#121214] transition-colors shrink-0 ml-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </InteractiveLinkCard>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
