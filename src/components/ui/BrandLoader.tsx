import React from "react";
import { cn } from "@/lib/utils";

export interface BrandLoaderProps {
  variant?: "fullscreen" | "section" | "inline";
  className?: string;
  label?: string;
  showLabel?: boolean;
}

/**
 * BrandLoader — Server Component (Zero Client JS, GPU-Composited)
 *
 * Recreates the exact 7-facet isometric hexagonal "GS" brand monogram from logo.png:
 * - Left "G" (3 facets in deep forest green #163826):
 *     • G1: Top-left angled bar
 *     • G2: Outer left-to-bottom L-frame
 *     • G3: Inner vertical hook
 * - Right "S" (4 facets in matte charcoal #18181B):
 *     • S1: Upper-left slant
 *     • S2: Upper-right angled bar
 *     • S3: Central diagonal spine
 *     • S4: Lower-right base bar
 * - Pure CSS GPU-composited animation (anti-flash 120ms delay, staggered facet assembly,
 *   breathing pulse, and diagonal clipped silver sheen sweep).
 * - Full reduced-motion accessibility support.
 */
export function BrandLoader({
  variant = "fullscreen",
  className,
  label = "GREEN STEEL",
  showLabel = true,
}: BrandLoaderProps) {
  // Unique clip-path ID for the diagonal sheen sweep across the 7 facets
  const clipId = "gs-monogram-clip";
  const gradId = "gs-sheen-gradient";

  const monogramSvg = (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-xs"
      aria-hidden="true"
    >
      <defs>
        {/* Soft metallic silver reflection gradient */}
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.38" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Clip path enclosing all 7 steel facets for the sheen */}
        <clipPath id={clipId}>
          {/* G1 */}
          <polygon points="82,9 84,35 76,41 34,65 10,51 81,10" />
          {/* G2 */}
          <polygon points="8,57 32,72 32,133 79,161 79,188 9,149 8,58" />
          {/* G3 */}
          <polygon points="59,86 106,111 94,120 95,126 109,118 109,173 86,186 85,132 92,128 81,126 59,111 59,87" />
          {/* S1 */}
          <polygon points="128,20 128,48 111,58 110,67 85,53 87,43 127,21" />
          {/* S2 */}
          <polygon points="133,21 188,52 188,92 163,79 163,66 133,48 133,22" />
          {/* S3 */}
          <polygon points="85,59 185,116 161,129 154,126 86,88 85,60" />
          {/* S4 */}
          <polygon points="186,121 186,149 116,188 117,160 185,122" />
        </clipPath>
      </defs>

      {/* Breathing group around the central isometric anchor */}
      <g className="gs-breathing-group">
        {/* ============================================================ */}
        {/* LEFT "G": Deep Forest Green (#163826)                        */}
        {/* ============================================================ */}
        <g fill="#163826">
          {/* G1: Top-Left Angled Bar */}
          <polygon
            className="gs-facet-g1 will-change-transform"
            points="82,9 84,35 76,41 34,65 10,51 81,10"
          />
          {/* G2: Outer Left-to-Bottom L-Frame */}
          <polygon
            className="gs-facet-g2 will-change-transform"
            points="8,57 32,72 32,133 79,161 79,188 9,149 8,58"
          />
          {/* G3: Inner Vertical Hook */}
          <polygon
            className="gs-facet-g3 will-change-transform"
            points="59,86 106,111 94,120 95,126 109,118 109,173 86,186 85,132 92,128 81,126 59,111 59,87"
          />
        </g>

        {/* ============================================================ */}
        {/* RIGHT "S": Matte Deep Charcoal (#18181B)                     */}
        {/* ============================================================ */}
        <g fill="#18181B">
          {/* S1: Upper-Left Slant */}
          <polygon
            className="gs-facet-s1 will-change-transform"
            points="128,20 128,48 111,58 110,67 85,53 87,43 127,21"
          />
          {/* S2: Upper-Right Angled Bar */}
          <polygon
            className="gs-facet-s2 will-change-transform"
            points="133,21 188,52 188,92 163,79 163,66 133,48 133,22"
          />
          {/* S3: Central Diagonal Spine */}
          <polygon
            className="gs-facet-s3 will-change-transform"
            points="85,59 185,116 161,129 154,126 86,88 85,60"
          />
          {/* S4: Lower-Right Base Bar */}
          <polygon
            className="gs-facet-s4 will-change-transform"
            points="186,121 186,149 116,188 117,160 185,122"
          />
        </g>

        {/* ============================================================ */}
        {/* DIAGONAL CLIPPED SILVER SHEEN SWEEP                          */}
        {/* ============================================================ */}
        <g clipPath={`url(#${clipId})`}>
          <rect
            className="gs-sheen-bar will-change-transform"
            x="-160"
            y="-60"
            width="80"
            height="320"
            fill={`url(#${gradId})`}
          />
        </g>
      </g>
    </svg>
  );

  // 1. INLINE VARIANT: Mini w-5 h-5 mark for buttons & compact indicators
  if (variant === "inline") {
    return (
      <span
        role="status"
        aria-label="Loading..."
        className={cn(
          "inline-flex items-center justify-center relative w-5 h-5 shrink-0 align-middle",
          className
        )}
      >
        <span className="gs-loader-container w-full h-full flex items-center justify-center">
          {monogramSvg}
        </span>
      </span>
    );
  }

  // 2. SECTION VARIANT: Centered inside drawers, modals, or page sections
  if (variant === "section") {
    return (
      <div
        role="status"
        aria-label="Loading section..."
        className={cn(
          "w-full py-12 px-4 flex flex-col items-center justify-center",
          className
        )}
      >
        <div className="gs-loader-container flex flex-col items-center justify-center text-center">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
            {monogramSvg}
          </div>
          {showLabel && label && (
            <span className="font-serif text-[9px] tracking-[0.24em] text-[#18181B]/55 uppercase font-medium mt-3 select-none">
              {label}
            </span>
          )}
          {/* Compact Hairline */}
          <div className="w-16 h-0.5 bg-[#18181B]/10 rounded-full mt-2.5 overflow-hidden">
            <div className="w-full h-full bg-[#163826] rounded-full gs-hairline-thumb" />
          </div>
        </div>
      </div>
    );
  }

  // 3. FULLSCREEN VARIANT: Luxury viewport-centered presentation
  return (
    <div
      role="status"
      aria-label="Loading Green Steel Furniture..."
      className={cn(
        "min-h-[75dvh] w-full flex flex-col items-center justify-center bg-[#FAF8F5] px-4",
        className
      )}
    >
      <div className="gs-loader-container flex flex-col items-center justify-center text-center">
        {/* Animated GS Isometric Monogram */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          {monogramSvg}
        </div>

        {/* Editorial Subtitle */}
        {showLabel && (
          <span className="font-serif text-[10px] sm:text-[11px] tracking-[0.28em] text-[#18181B]/60 uppercase font-semibold mt-5 select-none">
            {label}
          </span>
        )}

        {/* Slim Indeterminate Hairline Progress Bar */}
        <div className="w-24 sm:w-28 h-0.5 bg-[#18181B]/10 rounded-full mt-3.5 overflow-hidden">
          <div className="w-full h-full bg-[#163826] rounded-full gs-hairline-thumb" />
        </div>
      </div>
    </div>
  );
}

