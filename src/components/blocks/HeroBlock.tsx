import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Layers, Factory } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroBlockData, TrustBadge } from "@/types/blocks";

interface HeroBlockProps {
  data: HeroBlockData;
  className?: string;
}

/**
 * Maps trust badge icon identifiers to Lucide icon components
 */
function TrustBadgeIcon({ icon }: { icon: TrustBadge["icon"] }) {
  switch (icon) {
    case "rust-proof":
      return <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-[#D97706] shrink-0" aria-hidden="true" />;
    case "heavy-gauge":
      return <Layers className="w-5 h-5 md:w-6 md:h-6 text-[#D97706] shrink-0" aria-hidden="true" />;
    case "factory-direct":
      return <Factory className="w-5 h-5 md:w-6 md:h-6 text-[#D97706] shrink-0" aria-hidden="true" />;
    default: {
      const _exhaustiveCheck: never = icon;
      return null;
    }
  }
}

/**
 * HeroBlock — Mobile-First React Server Component
 * 
 * Features:
 * - LCP prioritized image rendering (< 1.5s via Next.js <Image priority />)
 * - Warm Ivory background with Deep Sapphire and Warm Amber brand overlays
 * - Accessible 44x44px min tap targets
 * - Horizontal Trust Badges bar proving quality and factory direct savings
 */
export function HeroBlock({ data, className }: HeroBlockProps) {
  const { headline, subheadline, imageUrl, imageAlt, primaryCta, secondaryCta, trustBadges } = data;

  return (
    <section 
      aria-label="Featured Collection Hero"
      className={cn("relative w-full overflow-hidden bg-[#FAF9F6]", className)}
    >
      {/* Hero Visual Container with Mobile-First Aspect / Minimum Height */}
      <div className="relative min-h-[64vh] sm:min-h-[70vh] md:min-h-[78vh] lg:min-h-[84vh] w-full flex flex-col justify-between">
        {/* Background Image with LCP Priority */}
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Dual Gradient Overlay to guarantee high text contrast and brand tone */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/95 via-[#1E3A8A]/75 to-[#1E3A8A]/40" 
            aria-hidden="true"
          />
        </div>

        {/* Top Spacer / Room for Brand Header on mobile */}
        <div className="relative z-10 w-full pt-8 sm:pt-12 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E3A8A]/80 border border-white/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-medium text-amber-200 tracking-wide uppercase">
              Factory Direct • Premium Steel
            </span>
          </div>
        </div>

        {/* Central Content Section */}
        <div className="relative z-10 w-full px-4 sm:px-6 max-w-5xl mx-auto my-auto py-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#FAF9F6] tracking-tight leading-[1.15] max-w-2xl drop-shadow-sm">
            {headline}
          </h1>

          {subheadline && (
            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-[#FAF9F6]/90 max-w-xl font-normal leading-relaxed">
              {subheadline}
            </p>
          )}

          {/* Action CTAs (Min 44x44px tap targets for mobile thumbs) */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-md sm:max-w-none">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center min-h-[48px] px-7 py-3 rounded-xl font-bold text-white bg-[#D97706] hover:bg-[#F59E0B] shadow-lg shadow-amber-900/30 active:scale-[0.98] transition-all duration-150 text-base tracking-wide text-center touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706]"
            >
              {primaryCta.label}
            </Link>

            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 rounded-xl font-semibold text-[#FAF9F6] bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md active:scale-[0.98] transition-all duration-150 text-base text-center touch-manipulation"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>

        {/* 3 Visual Trust Badges — Horizontally Aligned at the bottom of the hero */}
        <div className="relative z-10 w-full px-3 sm:px-6 pb-4 sm:pb-6 max-w-5xl mx-auto">
          <div 
            className="w-full grid grid-cols-3 gap-2 sm:gap-4 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E3A8A]/85 backdrop-blur-md border border-white/15 shadow-xl"
            role="list"
            aria-label="Quality and trust guarantees"
          >
            {trustBadges.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                role="listitem"
                className="flex flex-col sm:flex-row items-center sm:items-center justify-center text-center sm:text-left gap-1.5 sm:gap-2.5 py-1 px-1 sm:px-2"
              >
                <div className="p-1.5 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <TrustBadgeIcon icon={badge.icon} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] sm:text-xs md:text-sm font-bold text-[#FAF9F6] leading-tight line-clamp-2">
                    {badge.label}
                  </span>
                  {badge.description && (
                    <span className="hidden md:inline text-[10px] text-[#FAF9F6]/70 leading-normal">
                      {badge.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
