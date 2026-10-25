import React from "react";
import { cn } from "@/lib/utils";

interface VisualDimensionGuideProps {
  heightInches?: number;
  widthInches?: number;
  depthInches?: number;
  lengthInches?: number;
  headboardHeight?: number;
  seatHeight?: number;
  blueprintType?: "wardrobe" | "bed" | "seating" | "table" | "storage" | string;
  note?: string;
  className?: string;
  variant?: "light" | "dark";
}

/**
 * VisualDimensionGuide — Interactive Architectural Scale Diagram (SVG)
 * 
 * - Plotted with active size dimensions next to a 5'8" (68-inch) human silhouette
 * - Adapts blueprint lines based on category type (bed, wardrobe, table, seating, storage)
 * - Vector dimension arrows for height, width, and depth
 * - Supports "dark" (CAD screen) and "light" variants
 */
export function VisualDimensionGuide({
  heightInches = 78,
  widthInches = 36,
  depthInches = 22,
  lengthInches,
  headboardHeight,
  seatHeight,
  blueprintType = "wardrobe",
  note,
  className,
  variant = "light",
}: VisualDimensionGuideProps) {
  const isDark = variant === "dark";
  const isBed = blueprintType === "bed";
  const isTable = blueprintType === "table" || blueprintType === "workspace";
  const isSeating = blueprintType === "seating";

  // Human height standard: 68 inches (5'8")
  const humanHeight = 68;
  const primaryHeight = isBed
    ? headboardHeight || 42
    : isTable
    ? 30
    : isSeating
    ? seatHeight || 34
    : heightInches;

  const primaryWidth = lengthInches || widthInches;

  // Theme colors
  const strokeMain = isDark ? "#E4E4E7" : "#18181B";
  const strokeMuted = isDark ? "#71717A" : "#18181B";
  const fillPrimary = isDark ? "#27272A" : "#E2DDD5";
  const fillSecondary = isDark ? "#1E1E24" : "#EDE9E1";
  const accentColor = isDark ? "#FB923C" : "#9A3412";
  const humanColor = isDark ? "#A1A1AA" : "#18181B";
  const groundStroke = isDark ? "#52525B" : "#18181B";

  return (
    <div
      className={cn(
        "w-full h-full rounded-2xl p-4 sm:p-6 flex flex-col justify-between select-none transition-colors",
        isDark
          ? "bg-[#121215] border border-white/10 text-white"
          : "bg-[#F7F5F0] border border-[#18181B]/8 text-[#18181B]",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between pb-2 border-b",
          isDark ? "border-white/10" : "border-[#18181B]/10"
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isDark ? "bg-[#FB923C] shadow-[0_0_6px_rgba(251,146,60,0.8)]" : "bg-[#9A3412]"
            )}
          />
          <span
            className={cn(
              "text-xs uppercase tracking-[0.2em] font-bold",
              isDark ? "text-zinc-200" : "text-[#18181B]"
            )}
          >
            Architectural Scale Chart
          </span>
        </div>
        <span
          className={cn(
            "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
            isDark
              ? "text-zinc-300 bg-white/10 border-white/10"
              : "text-[#71717A] bg-white/80 border-black/5"
          )}
        >
          5&apos;8&quot; Human Silhouette Scale
        </span>
      </div>

      {/* Main Architectural SVG Canvas */}
      <div className="relative w-full flex-1 min-h-[220px] flex items-center justify-center py-2">
        <svg
          viewBox="0 0 340 190"
          className="w-full h-full max-h-[280px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground Baseline */}
          <line
            x1="15"
            y1="165"
            x2="325"
            y2="165"
            stroke={groundStroke}
            strokeWidth="1.5"
            strokeOpacity="0.35"
          />

          {isBed ? (
            /* BED BLUEPRINT */
            <g>
              {/* Headboard */}
              <rect
                x="40"
                y="65"
                width="16"
                height="100"
                rx="2"
                stroke={strokeMain}
                strokeWidth="2"
                fill={fillPrimary}
              />
              {/* Mattress / Frame */}
              <rect
                x="56"
                y="115"
                width="135"
                height="40"
                rx="3"
                stroke={strokeMain}
                strokeWidth="2"
                fill={fillSecondary}
              />
              {/* Bed Post Footboard */}
              <rect
                x="191"
                y="110"
                width="12"
                height="55"
                rx="2"
                stroke={strokeMain}
                strokeWidth="2"
                fill={fillPrimary}
              />
              {/* Slats Accent */}
              <line x1="85" y1="115" x2="85" y2="155" stroke={strokeMuted} strokeWidth="1" strokeOpacity="0.4" />
              <line x1="125" y1="115" x2="125" y2="155" stroke={strokeMuted} strokeWidth="1" strokeOpacity="0.4" />
              <line x1="165" y1="115" x2="165" y2="155" stroke={strokeMuted} strokeWidth="1" strokeOpacity="0.4" />

              {/* Headboard Height Dimension Line */}
              <line x1="28" y1="65" x2="28" y2="165" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" />
              <polygon points="28,65 26,70 30,70" fill={accentColor} />
              <polygon points="28,165 26,160 30,160" fill={accentColor} />
              <text x="22" y="118" fontSize="9" textAnchor="middle" fill={accentColor} fontWeight="700" transform="rotate(-90 22 118)">
                {headboardHeight || 42}&quot; H
              </text>

              {/* Length Dimension Line (Top) */}
              <line x1="40" y1="48" x2="203" y2="48" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" />
              <polygon points="40,48 45,46 45,50" fill={accentColor} />
              <polygon points="203,48 198,46 198,50" fill={accentColor} />
              <text x="121" y="42" fontSize="9" textAnchor="middle" fill={accentColor} fontWeight="700">
                {lengthInches || 78}&quot; L × {widthInches}&quot; W
              </text>
            </g>
          ) : isTable || isSeating ? (
            /* TABLE / SEATING BLUEPRINT */
            <g>
              {/* Table Top */}
              <rect
                x="45"
                y="95"
                width="145"
                height="14"
                rx="2"
                stroke={strokeMain}
                strokeWidth="2"
                fill={fillPrimary}
              />
              {/* Legs */}
              <rect x="52" y="109" width="10" height="56" rx="1" stroke={strokeMain} strokeWidth="2" fill={fillSecondary} />
              <rect x="172" y="109" width="10" height="56" rx="1" stroke={strokeMain} strokeWidth="2" fill={fillSecondary} />
              {/* Structural Crossbar */}
              <line x1="57" y1="135" x2="177" y2="135" stroke={strokeMuted} strokeWidth="1.5" strokeOpacity="0.5" />

              {/* Height Arrow */}
              <line x1="32" y1="95" x2="32" y2="165" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" />
              <polygon points="32,95 30,100 34,100" fill={accentColor} />
              <polygon points="32,165 30,160 34,160" fill={accentColor} />
              <text x="24" y="133" fontSize="9" textAnchor="middle" fill={accentColor} fontWeight="700" transform="rotate(-90 24 133)">
                {primaryHeight}&quot; H
              </text>

              {/* Width Arrow */}
              <line x1="45" y1="80" x2="190" y2="80" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" />
              <polygon points="45,80 50,78 50,82" fill={accentColor} />
              <polygon points="190,80 185,78 185,82" fill={accentColor} />
              <text x="117" y="74" fontSize="9" textAnchor="middle" fill={accentColor} fontWeight="700">
                {widthInches}&quot; W × {depthInches}&quot; D
              </text>
            </g>
          ) : (
            /* WARDROBE / STORAGE BLUEPRINT */
            <g>
              {/* Wardrobe Outline (Proportional Height) */}
              <rect
                x="50"
                y="22"
                width="95"
                height="143"
                rx="3"
                stroke={strokeMain}
                strokeWidth="2"
                fill={fillSecondary}
              />
              {/* 3-Door Panels */}
              <line x1="82" y1="22" x2="82" y2="165" stroke={strokeMuted} strokeWidth="1" strokeOpacity="0.5" />
              <line x1="114" y1="22" x2="114" y2="165" stroke={strokeMuted} strokeWidth="1" strokeOpacity="0.5" />
              {/* Door Handles */}
              <line x1="77" y1="90" x2="77" y2="108" stroke={strokeMain} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="87" y1="90" x2="87" y2="108" stroke={strokeMain} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="119" y1="90" x2="119" y2="108" stroke={strokeMain} strokeWidth="2.5" strokeLinecap="round" />
              {/* Locker Vault Secret Hatch Indicator */}
              <rect x="56" y="130" width="20" height="25" rx="1.5" stroke={accentColor} strokeWidth="1" strokeDasharray="2 2" fill="none" />

              {/* Width Arrow (Top) */}
              <line x1="50" y1="12" x2="145" y2="12" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" />
              <polygon points="50,12 55,10 55,14" fill={accentColor} />
              <polygon points="145,12 140,10 140,14" fill={accentColor} />
              <text x="97" y="8" fontSize="9" textAnchor="middle" fill={accentColor} fontWeight="700">
                {widthInches}&quot; W
              </text>

              {/* Height Arrow (Left) */}
              <line x1="36" y1="22" x2="36" y2="165" stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" />
              <polygon points="36,22 34,27 38,27" fill={accentColor} />
              <polygon points="36,165 34,160 38,160" fill={accentColor} />
              <text x="26" y="96" fontSize="9" textAnchor="middle" fill={accentColor} fontWeight="700" transform="rotate(-90 26 96)">
                {heightInches}&quot; H
              </text>
            </g>
          )}

          {/* Human Silhouette Figure (5'8" ~ 68-inch Scale) */}
          <g transform="translate(235, 40)">
            {/* Human Head */}
            <circle cx="16" cy="11" r="9" fill={humanColor} fillOpacity="0.85" />
            {/* Torso & Shoulders */}
            <path
              d="M6 26 C6 22, 26 22, 26 26 L29 70 C29 72, 3 72, 3 70 Z"
              fill={humanColor}
              fillOpacity="0.85"
            />
            {/* Legs & Shoes */}
            <line
              x1="11"
              y1="70"
              x2="9"
              y2="125"
              stroke={humanColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />
            <line
              x1="21"
              y1="70"
              x2="23"
              y2="125"
              stroke={humanColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />
            {/* Human Height Badge */}
            <text
              x="16"
              y="-4"
              fontSize="8"
              textAnchor="middle"
              fill={isDark ? "#A1A1AA" : "#71717A"}
              fontWeight="600"
            >
              5&apos;8&quot; (68&quot;)
            </text>
          </g>
        </svg>
      </div>

      {/* Live Dimension Pills Footer */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 pt-2 border-t",
          isDark ? "border-white/10" : "border-[#18181B]/10"
        )}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs border",
              isDark
                ? "bg-zinc-900 border-white/15 text-zinc-100"
                : "bg-white border-[#18181B]/15 text-[#18181B]"
            )}
          >
            H: {heightInches}&quot;
          </span>
          <span
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs border",
              isDark
                ? "bg-zinc-900 border-white/15 text-zinc-100"
                : "bg-white border-[#18181B]/15 text-[#18181B]"
            )}
          >
            W: {widthInches}&quot;
          </span>
          <span
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs border",
              isDark
                ? "bg-zinc-900 border-white/15 text-zinc-100"
                : "bg-white border-[#18181B]/15 text-[#18181B]"
            )}
          >
            D: {depthInches}&quot;
          </span>
          {lengthInches && (
            <span
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs border",
                isDark
                  ? "bg-zinc-900 border-white/15 text-zinc-100"
                  : "bg-white border-[#18181B]/15 text-[#18181B]"
              )}
            >
              L: {lengthInches}&quot;
            </span>
          )}
        </div>

        {note && (
          <span
            className={cn(
              "text-[11px] font-medium truncate max-w-xs",
              isDark ? "text-zinc-400" : "text-[#71717A]"
            )}
          >
            {note}
          </span>
        )}
      </div>
    </div>
  );
}
