"use client";

import {
  Grid,
  DoorClosed,
  ShieldCheck,
  Tv,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterPillItem } from "@/types/catalog";

interface VisualFilterStripProps {
  filters: FilterPillItem[];
  activeTag: string;
  onSelectTag: (tag: string) => void;
  className?: string;
}

/**
 * VisualFilterStrip — Client Component
 * 
 * Luxury Editorial Filter Strip:
 * - Sticky below header: sticky top-16 md:top-20 z-40 bg-[#FAF8F5]/90 backdrop-blur-md py-4
 * - Horizontally scrollable (overflow-x-auto) with hidden scrollbars
 * - Thumb-friendly pills (min 44px tap target)
 * - Active: solid #18181B background with #FAF8F5 text
 * - Inactive: thin #18181B/20 border with #18181B text
 */
export function VisualFilterStrip({
  filters,
  activeTag,
  onSelectTag,
  className,
}: VisualFilterStripProps) {
  // Render icon or color swatch
  const renderIcon = (filter: FilterPillItem, isActive: boolean) => {
    if (filter.swatchHex) {
      return (
        <span
          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
          style={{ backgroundColor: filter.swatchHex }}
          aria-hidden="true"
        />
      );
    }

    const iconClass = cn(
      "w-4 h-4 shrink-0 transition-colors",
      isActive ? "text-[#FAF8F5]" : "text-[#18181B]/70"
    );

    switch (filter.iconName) {
      case "wardrobe":
        return <DoorClosed className={iconClass} aria-hidden="true" />;
      case "lock":
        return <ShieldCheck className={iconClass} aria-hidden="true" />;
      case "tv":
        return <Tv className={iconClass} aria-hidden="true" />;
      case "briefcase":
        return <Briefcase className={iconClass} aria-hidden="true" />;
      case "grid":
      default:
        return <Grid className={iconClass} aria-hidden="true" />;
    }
  };

  return (
    <nav
      aria-label="Filter catalog products"
      className={cn(
        "sticky top-16 md:top-20 z-40 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#18181B]/10 py-4 px-4 sm:px-8 transition-all",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Horizontally scrollable track */}
        <div
          role="tablist"
          aria-label="Product categories"
          className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full"
        >
          {filters.map((filter) => {
            const isActive = activeTag === filter.tag;

            return (
              <button
                key={filter.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => onSelectTag(filter.tag)}
                className={cn(
                  "inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 shrink-0 min-h-[44px] cursor-pointer touch-manipulation select-none active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181B]",
                  isActive
                    ? "bg-[#18181B] text-[#FAF8F5] shadow-sm"
                    : "bg-white/60 text-[#18181B] border border-[#18181B]/20 hover:border-[#18181B]/50 hover:bg-white"
                )}
              >
                {renderIcon(filter, isActive)}
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
