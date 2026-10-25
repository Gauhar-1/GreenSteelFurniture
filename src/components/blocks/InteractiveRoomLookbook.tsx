"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InteractiveRoomLookbookBlockData } from "@/types/blocks";

interface InteractiveRoomLookbookProps {
  data: InteractiveRoomLookbookBlockData;
  className?: string;
}

/**
 * InteractiveRoomLookbook — Client Component
 * 
 * "Complete the Room" Switcher:
 * - Minimalist horizontal tabs (Bedroom, Living Room, Dining, Home Office).
 * - 60/40 Split layout: large lifestyle showcase on left, 3 matching isolated furniture cards on right.
 * - Mobile-friendly horizontal swipe for the furniture pieces.
 */
export function InteractiveRoomLookbook({ data, className }: InteractiveRoomLookbookProps) {
  const { title, rooms = [] } = data;
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  if (!rooms || rooms.length === 0) {
    return (
      <section className={cn("w-full py-16 px-4 sm:px-8 max-w-7xl mx-auto bg-[#FAF8F5]", className)}>
        <div className="p-8 rounded-2xl border border-black/10 bg-[#EDE9E1]/50 text-[#71717A] text-center text-xs sm:text-sm font-medium">
          Lookbook room sets not yet configured in Admin Studio.
        </div>
      </section>
    );
  }

  const activeRoom = rooms[activeRoomIndex] || rooms[0];
  const hasLifestyleImage = Boolean(activeRoom?.lifestyleImageUrl && activeRoom.lifestyleImageUrl.trim() !== "");
  const products = activeRoom?.products || [];

  return (
    <section 
      aria-label="Complete the Room Lookbook"
      className={cn("w-full py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto bg-[#FAF8F5]", className)}
    >
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#71717A] block mb-2">
            Curated Collections
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#18181B] tracking-tight">
            {title || "Complete the Look"}
          </h2>
        </div>

        {/* Minimal Horizontal Tabs */}
        <div 
          role="tablist" 
          aria-label="Room categories"
          className="flex items-center gap-6 sm:gap-10 border-b border-[#E7E0D2] pb-3 overflow-x-auto scrollbar-none"
        >
          {rooms.map((room, idx) => {
            const isSelected = idx === activeRoomIndex;

            return (
              <button
                key={room.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => setActiveRoomIndex(idx)}
                className={cn(
                  "text-sm sm:text-base transition-colors duration-150 cursor-pointer whitespace-nowrap pb-3 -mb-3 relative font-normal touch-manipulation",
                  isSelected
                    ? "text-[#18181B] font-semibold"
                    : "text-[#71717A] hover:text-[#18181B]"
                )}
              >
                {room.tabLabel}
                {isSelected && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#18181B] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 60/40 Split View */}
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-stretch">
        {/* Left: 60% Large Lifestyle Showcase Photo (Natural, Unobstructed) */}
        <div className="lg:w-[60%] w-full relative min-h-[360px] sm:min-h-[460px] lg:min-h-[560px] rounded-2xl overflow-hidden bg-[#EDE9E1] shadow-xs flex items-center justify-center">
          {hasLifestyleImage ? (
            <Image
              key={activeRoom.id}
              src={activeRoom.lifestyleImageUrl}
              alt={activeRoom.lifestyleImageAlt || `${activeRoom.tabLabel} furniture set`}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center transition-opacity duration-500"
            />
          ) : (
            <div className="text-center p-6 text-[#71717A] text-xs sm:text-sm">
              Lifestyle photo not uploaded for {activeRoom.tabLabel}
            </div>
          )}

          {/* Minimal Clean Room Tag */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#18181B] bg-white/90 backdrop-blur-md shadow-xs">
              {activeRoom.tabLabel} Set
            </span>
          </div>
        </div>

        {/* Right: 40% Matching Furniture Pieces on Clean Warm Off-White Cards */}
        <div className="lg:w-[40%] w-full flex flex-col justify-between gap-3.5">
          {products.length === 0 ? (
            <div className="p-8 rounded-2xl border border-black/10 bg-[#EDE9E1]/40 text-[#71717A] text-center text-xs sm:text-sm my-auto">
              No matching products linked to this room set yet.
            </div>
          ) : (
            products.map((item) => {
              const hasProductImage = Boolean(item.imageUrl && item.imageUrl.trim() !== "");

              return (
                <Link
                  key={item.id}
                  href={item.href || "/categories"}
                  className="group/item flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#F4F1EB] hover:bg-[#EAE4D9] transition-all duration-200 border border-black/5 shadow-2xs"
                >
                  {/* Isolated Product Image Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-black/5 p-1.5 flex items-center justify-center">
                    {hasProductImage ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="120px"
                        className="object-contain object-center group-hover/item:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#EDE9E1] rounded-lg" />
                    )}
                  </div>

                  {/* Clean Typography: Title and Price */}
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-sm sm:text-base font-medium text-[#18181B] group-hover/item:text-[#9A3412] transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm font-semibold text-[#18181B] mt-1">
                      {item.price}
                    </p>
                    <span className="text-[11px] text-[#71717A] mt-0.5 block">
                      Part of this room set
                    </span>
                  </div>

                  {/* Minimalist Arrow */}
                  <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#18181B] group-hover/item:bg-[#18181B] group-hover/item:text-white transition-colors shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })
          )}

          {/* Action Link to Explore Specific Category */}
          <div className="pt-2 text-right">
            <Link
              href={
                products[0]?.href
                  ? products[0].href.replace(/\/product\/[^/]+$/, "")
                  : "/categories"
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18181B] hover:text-[#9A3412] transition-colors"
            >
              <span>Explore {activeRoom.tabLabel} Collection</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
