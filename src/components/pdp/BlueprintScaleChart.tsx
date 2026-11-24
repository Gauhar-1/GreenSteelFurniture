"use client";

import React, { useState, useMemo } from "react";
import { Ruler, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type BlueprintType,
  parseDimensionsToInches,
  formatDimension,
  inferStructuralCount,
} from "@/lib/blueprintUtils";

export interface BlueprintScaleChartProps {
  blueprintType: BlueprintType;
  selectedSize?: {
    size_label?: string;
    dimensions?: {
      height?: number;
      width?: number;
      depth?: number;
      length?: number;
      headboard_height?: number;
      total_height?: number;
      seat_height?: number;
      unit?: string;
    };
  } | null;
  productTitle?: string;
  className?: string;
  compact?: boolean;
}

/**
 * BlueprintScaleChart — Parametric SVG Architectural Scale Engine
 * 
 * Renders true-to-life architectural elevations alongside a fixed 5'8" (68")
 * human reference silhouette using our signature warm alabaster paper drafting aesthetic.
 */
export function BlueprintScaleChart({
  blueprintType = "generic_box",
  selectedSize,
  productTitle,
  className,
  compact = false,
}: BlueprintScaleChartProps) {
  // Default to feet since Indian homeowners measure rooms in feet
  const [unit, setUnit] = useState<"ft" | "in">("ft");

  const { widthIn, heightIn, depthIn, hasExactDims } = useMemo(() => {
    return parseDimensionsToInches(selectedSize, blueprintType);
  }, [selectedSize, blueprintType]);

  const structuralCount = useMemo(() => {
    return inferStructuralCount(selectedSize?.size_label || "", widthIn, blueprintType);
  }, [selectedSize?.size_label, widthIn, blueprintType]);

  // Coordinate Canvas Math
  const canvasW = 540;
  const canvasH = compact ? 240 : 270;
  const floorY = compact ? 205 : 225;

  // Single Shared Proportional Scale: Human = 68 inches
  const humanHeightIn = 68;
  const maxRefHeightIn = Math.max(humanHeightIn, heightIn, 72);
  const maxRefWidthIn = Math.max(widthIn, 54);

  const availableHeightPx = compact ? 135 : 155;
  const availableWidthPx = 320;

  const scaleY = availableHeightPx / maxRefHeightIn;
  const scaleX = availableWidthPx / maxRefWidthIn;
  const pxPerInch = Math.min(scaleY, scaleX, 2.3);

  // Scaled pixel dimensions
  const humanH = humanHeightIn * pxPerInch;
  const furnW = Math.max(30, widthIn * pxPerInch);
  const furnH = Math.max(30, heightIn * pxPerInch);

  const humanX = 35;
  const furnX = 140;
  const furnY = floorY - furnH;

  // Jhula-specific floating seat geometry
  const isJhula = blueprintType === "jhula";
  const jhulaSeatElevation = Math.max(26, 19 * pxPerInch);
  const jhulaSeatY = floorY - jhulaSeatElevation;
  const jhulaBackrestH = Math.max(28, furnH * 0.52);
  const jhulaBackrestY = jhulaSeatY - jhulaBackrestH;
  const ceilingBeamY = 22;

  // Color Tokens for Warm Alabaster Drafting Aesthetic
  const strokeMain = "#18181B";
  const strokeWidthMain = "1.75";
  const fillPrimary = "#EAE5DC";
  const fillSecondary = "#DFD9CE";
  const dimColor = "#9A3412"; // Warm terracotta
  const floorColor = "#D4CFC7";
  const humanColor = "#3F3F46";

  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-[#FAF8F5] text-[#18181B] border border-[#18181B]/10 select-none overflow-hidden transition-all",
        compact ? "p-2.5 sm:p-3 shadow-2xs" : "p-4 sm:p-5 shadow-xs",
        className
      )}
    >
      {/* ======================================================== */}
      {/* 1. TOP HEADER BAR                                       */}
      {/* ======================================================== */}
      {compact ? (
        <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-[#18181B]/10 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A3412] shrink-0" />
            <span className="font-bold tracking-wider text-[#18181B] uppercase truncate">
              {productTitle ? `${productTitle} Scale` : "Scale Blueprint"}
            </span>
          </div>

          <div className="inline-flex p-0.5 rounded-md bg-white border border-[#18181B]/10 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUnit("ft");
              }}
              className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer",
                unit === "ft" ? "bg-[#18181B] text-white" : "text-[#71717A] hover:text-[#18181B]"
              )}
            >
              ft
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUnit("in");
              }}
              className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer",
                unit === "in" ? "bg-[#18181B] text-white" : "text-[#71717A] hover:text-[#18181B]"
              )}
            >
              in
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#18181B]/10">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-2.5 h-2.5 rounded-full bg-[#9A3412] shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#18181B] uppercase">
                  Architectural Scale Chart
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#9A3412] font-bold border border-[#18181B]/10 shadow-2xs">
                  1 : 1 Proportions
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] mt-0.5">
                True-to-life elevations compared with a 5&apos;8&quot; (68 in) human scale
              </p>
            </div>
          </div>

          {/* Unit Toggle & Reference Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!hasExactDims && (
              <span
                title="Dimensions inferred from architectural standards"
                className="inline-flex items-center gap-1 text-[10px] font-mono text-[#9A3412] bg-[#9A3412]/10 border border-[#9A3412]/20 px-2 py-0.5 rounded-md"
              >
                <Info className="w-3 h-3" />
                <span>Estimated</span>
              </span>
            )}

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-[10px] font-mono font-semibold text-[#71717A] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#18181B]/50" />
              <span>5&apos;8&quot; Silhouette</span>
            </span>

            <div className="inline-flex p-0.5 rounded-xl bg-white border border-[#18181B]/10 text-[10px] font-mono font-bold shadow-2xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUnit("ft");
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                  unit === "ft"
                    ? "bg-[#18181B] text-white shadow-xs"
                    : "text-[#71717A] hover:text-[#18181B]"
                )}
              >
                Feet (ft)
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUnit("in");
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                  unit === "in"
                    ? "bg-[#18181B] text-white shadow-xs"
                    : "text-[#71717A] hover:text-[#18181B]"
                )}
              >
                Inches (in)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SVG ARCHITECTURAL CANVAS                              */}
      {/* ======================================================== */}
      <div
        className={cn(
          "relative w-full bg-[#F6F3EC] rounded-xl border border-[#18181B]/8 overflow-hidden",
          compact ? "mt-2 aspect-16/10" : "mt-3 aspect-2/1 sm:aspect-21/9"
        )}
      >
        <svg
          viewBox={`0 0 ${canvasW} ${canvasH}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Subtle Drafting Dot Grid Pattern */}
            <pattern id={`blueprint-grid-${compact ? "compact" : "full"}`} width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="rgba(24, 24, 27, 0.06)" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width={canvasW} height={canvasH} fill={`url(#blueprint-grid-${compact ? "compact" : "full"})`} />

          {/* Baseline Floor Line */}
          <line
            x1="16"
            y1={floorY}
            x2={canvasW - 16}
            y2={floorY}
            stroke={floorColor}
            strokeWidth="1.5"
          />
          <text
            x="20"
            y={floorY + 13}
            fill="#71717A"
            fontSize="8"
            fontFamily="monospace"
            letterSpacing="0.08em"
          >
            FINISH FLOOR (0&apos;)
          </text>

          {/* ======================================================== */}
          {/* A. FIXED 5'8" (68") HUMAN SCALE SILHOUETTE               */}
          {/* ======================================================== */}
          <g>
            {/* Head */}
            <circle
              cx={humanX + 14}
              cy={floorY - humanH + 11}
              r={9}
              fill={humanColor}
              stroke={strokeMain}
              strokeWidth="1"
            />
            {/* Torso & Limbs */}
            <path
              d={`
                M ${humanX + 7} ${floorY - humanH + 22}
                L ${humanX + 21} ${floorY - humanH + 22}
                L ${humanX + 24} ${floorY - humanH * 0.55}
                L ${humanX + 22} ${floorY}
                L ${humanX + 16} ${floorY}
                L ${humanX + 14} ${floorY - humanH * 0.45}
                L ${humanX + 12} ${floorY}
                L ${humanX + 6} ${floorY}
                L ${humanX + 4} ${floorY - humanH * 0.55}
                Z
              `}
              fill={humanColor}
              stroke={strokeMain}
              strokeWidth="1"
            />
            {/* Height Reference Dashed Line & Tag */}
            <line
              x1={humanX - 6}
              y1={floorY - humanH}
              x2={humanX + 34}
              y2={floorY - humanH}
              stroke={floorColor}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text
              x={humanX - 10}
              y={floorY - humanH + 3.5}
              fill="#71717A"
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="end"
            >
              {unit === "ft" ? "5' 8\"" : "68\""}
            </text>
            <text
              x={humanX + 14}
              y={floorY + 13}
              fill="#71717A"
              fontSize="7.5"
              fontFamily="monospace"
              textAnchor="middle"
            >
              HUMAN (5&apos;8&quot;)
            </text>
          </g>

          {/* ======================================================== */}
          {/* B. PARAMETRIC STEEL FURNITURE ARCHETYPE ELEVATION        */}
          {/* ======================================================== */}
          <g>
            {/* ARCHETYPE 1: WARDROBE (Plinth + N-Doors with handles) */}
            {blueprintType === "wardrobe" && (
              <g>
                {/* Plinth Base */}
                <rect
                  x={furnX}
                  y={floorY - 10}
                  width={furnW}
                  height={10}
                  fill={fillSecondary}
                  stroke={strokeMain}
                  strokeWidth={strokeWidthMain}
                />
                {/* Main Cabinet Box */}
                <rect
                  x={furnX}
                  y={furnY}
                  width={furnW}
                  height={furnH - 10}
                  fill={fillPrimary}
                  stroke={strokeMain}
                  strokeWidth={strokeWidthMain}
                  rx="2"
                />
                {/* Door Panels and Handles */}
                {Array.from({ length: structuralCount }).map((_, i) => {
                  const doorW = furnW / structuralCount;
                  const doorX = furnX + i * doorW;
                  const isRightEdge = i % 2 === 0;
                  const handleX = isRightEdge ? doorX + doorW - 5 : doorX + 5;
                  const handleY = furnY + (furnH - 10) * 0.45;

                  return (
                    <g key={i}>
                      {i > 0 && (
                        <line
                          x1={doorX}
                          y1={furnY}
                          x2={doorX}
                          y2={floorY - 10}
                          stroke={strokeMain}
                          strokeWidth="1.2"
                          strokeDasharray="4 2"
                        />
                      )}
                      {/* Handle */}
                      <rect
                        x={handleX - 1}
                        y={handleY}
                        width={2.5}
                        height={18}
                        rx="1"
                        fill={strokeMain}
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* ARCHETYPE 2: BED (Symmetrical normal bed with full-width headboard, mattress, pillows & clearance) */}
            {blueprintType === "bed" && (
              <g>
                {/* 1. Left & Right Posts with Spherical Steel Finials */}
                <rect x={furnX} y={furnY} width={6} height={floorY - furnY} fill={strokeMain} />
                <circle cx={furnX + 3} cy={furnY - 4} r={4.5} fill={dimColor} stroke={strokeMain} strokeWidth="1" />

                <rect
                  x={furnX + furnW - 6}
                  y={furnY}
                  width={6}
                  height={floorY - furnY}
                  fill={strokeMain}
                />
                <circle
                  cx={furnX + furnW - 3}
                  cy={furnY - 4}
                  r={4.5}
                  fill={dimColor}
                  stroke={strokeMain}
                  strokeWidth="1"
                />

                {/* 2. Full-Width Arched Headboard Top Rail */}
                <path
                  d={`M ${furnX + 6} ${furnY + 12} Q ${furnX + furnW / 2} ${furnY - 3} ${furnX + furnW - 6} ${furnY + 12}`}
                  stroke={strokeMain}
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1={furnX + 6}
                  y1={furnY + 14}
                  x2={furnX + furnW - 6}
                  y2={furnY + 14}
                  stroke={strokeMain}
                  strokeWidth="1.5"
                />

                {/* Headboard Decorative Panel across entire width */}
                <rect
                  x={furnX + 6}
                  y={furnY + 14}
                  width={furnW - 12}
                  height={Math.max(20, furnH * 0.42)}
                  fill={fillPrimary}
                  stroke={strokeMain}
                  strokeWidth="1.2"
                />
                {/* Vertical Steel Spindles across headboard */}
                {Array.from({ length: 7 }).map((_, i) => {
                  const x = furnX + 14 + i * ((furnW - 28) / 6);
                  return (
                    <line
                      key={i}
                      x1={x}
                      y1={furnY + 16}
                      x2={x}
                      y2={furnY + 14 + Math.max(20, furnH * 0.42)}
                      stroke={strokeMain}
                      strokeWidth="1"
                    />
                  );
                })}

                {/* 3. Bed Deck & Frame Base */}
                <rect
                  x={furnX + 2}
                  y={floorY - Math.max(20, 14 * pxPerInch)}
                  width={furnW - 4}
                  height={8}
                  fill={fillSecondary}
                  stroke={strokeMain}
                  strokeWidth="1.5"
                  rx="1.5"
                />

                {/* 4. Thick Plush Mattress */}
                <rect
                  x={furnX + 4}
                  y={floorY - Math.max(34, 23 * pxPerInch)}
                  width={furnW - 8}
                  height={Math.max(14, 9 * pxPerInch)}
                  rx="3"
                  fill="#FFFFFF"
                  stroke={strokeMain}
                  strokeWidth="1.6"
                />
                {/* Quilted seam line across mattress */}
                <line
                  x1={furnX + 8}
                  y1={floorY - Math.max(27, 18.5 * pxPerInch)}
                  x2={furnX + furnW - 8}
                  y2={floorY - Math.max(27, 18.5 * pxPerInch)}
                  stroke={floorColor}
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />

                {/* 5. Two Plump Sleeping Pillows resting on mattress */}
                <rect
                  x={furnX + furnW * 0.12}
                  y={floorY - Math.max(46, 31 * pxPerInch)}
                  width={furnW * 0.34}
                  height={Math.max(10, 7 * pxPerInch)}
                  rx="3.5"
                  fill="#FFFFFF"
                  stroke={strokeMain}
                  strokeWidth="1.2"
                />
                <rect
                  x={furnX + furnW * 0.54}
                  y={floorY - Math.max(46, 31 * pxPerInch)}
                  width={furnW * 0.34}
                  height={Math.max(10, 7 * pxPerInch)}
                  rx="3.5"
                  fill="#FFFFFF"
                  stroke={strokeMain}
                  strokeWidth="1.2"
                />

                {/* 6. Sturdy Steel Legs with Under-bed Floor Clearance */}
                <line
                  x1={furnX + 6}
                  y1={floorY - Math.max(20, 14 * pxPerInch)}
                  x2={furnX + 6}
                  y2={floorY}
                  stroke={strokeMain}
                  strokeWidth="2"
                />
                <line
                  x1={furnX + furnW - 6}
                  y1={floorY - Math.max(20, 14 * pxPerInch)}
                  x2={furnX + furnW - 6}
                  y2={floorY}
                  stroke={strokeMain}
                  strokeWidth="2"
                />
                {furnW > 120 && (
                  <line
                    x1={furnX + furnW / 2}
                    y1={floorY - Math.max(20, 14 * pxPerInch)}
                    x2={furnX + furnW / 2}
                    y2={floorY}
                    stroke={strokeMain}
                    strokeWidth="1.5"
                  />
                )}
              </g>
            )}

            {/* ARCHETYPE 3: DINING TABLE (Table surface + legs + distributed chairs) */}
            {blueprintType === "dining_table" && (
              <g>
                {/* Table Top Surface */}
                <rect
                  x={furnX}
                  y={furnY}
                  width={furnW}
                  height={10}
                  rx="2"
                  fill={fillPrimary}
                  stroke={strokeMain}
                  strokeWidth={strokeWidthMain}
                />
                {/* Heavy Steel Legs */}
                <rect x={furnX + 8} y={furnY + 10} width={7} height={furnH - 10} fill={strokeMain} />
                <rect x={furnX + furnW - 15} y={furnY + 10} width={7} height={furnH - 10} fill={strokeMain} />

                {/* Distributed Chair Silhouettes */}
                {Array.from({ length: Math.min(structuralCount, 6) }).map((_, i) => {
                  const step = (furnW - 40) / Math.max(1, Math.min(structuralCount, 6) - 1);
                  const cx = furnX + 20 + i * step;
                  return (
                    <g key={i} opacity="0.75">
                      <rect x={cx - 8} y={floorY - furnH * 0.55} width={16} height={4} fill={fillSecondary} stroke={strokeMain} strokeWidth="1" />
                      <line x1={cx - 6} y1={floorY - furnH * 0.55} x2={cx - 6} y2={floorY} stroke={strokeMain} strokeWidth="1" />
                      <line x1={cx + 6} y1={floorY - furnH * 0.55} x2={cx + 6} y2={floorY} stroke={strokeMain} strokeWidth="1" />
                      <line x1={cx - 7} y1={floorY - furnH * 0.55} x2={cx - 7} y2={floorY - furnH * 0.9} stroke={strokeMain} strokeWidth="1.2" />
                    </g>
                  );
                })}
              </g>
            )}

            {/* ARCHETYPE 4: JHULA (Ceiling beam + twin suspension chains + floating bench seat + clearance arc) */}
            {blueprintType === "jhula" && (
              <g>
                {/* 1. Heavy Ceiling Mounting Beam */}
                <rect
                  x={furnX - 16}
                  y={ceilingBeamY}
                  width={furnW + 32}
                  height={8}
                  rx="2"
                  fill={strokeMain}
                  stroke={strokeMain}
                />
                {/* Ceiling Anchor Plates */}
                <rect x={furnX + 8} y={ceilingBeamY + 8} width={8} height={4} fill={dimColor} />
                <rect x={furnX + furnW - 16} y={ceilingBeamY + 8} width={8} height={4} fill={dimColor} />

                {/* 2. Twin Suspension Chains with Interlocked Link Pattern */}
                <line
                  x1={furnX + 12}
                  y1={ceilingBeamY + 12}
                  x2={furnX + 12}
                  y2={jhulaSeatY + 3}
                  stroke={strokeMain}
                  strokeWidth="1.75"
                  strokeDasharray="4 2"
                />
                <line
                  x1={furnX + furnW - 12}
                  y1={ceilingBeamY + 12}
                  x2={furnX + furnW - 12}
                  y2={jhulaSeatY + 3}
                  stroke={strokeMain}
                  strokeWidth="1.75"
                  strokeDasharray="4 2"
                />

                {/* 3. Suspended Bench Seat Floating ~18-20" above ground */}
                <rect
                  x={furnX}
                  y={jhulaSeatY}
                  width={furnW}
                  height={9}
                  rx="2.5"
                  fill={fillPrimary}
                  stroke={strokeMain}
                  strokeWidth={strokeWidthMain}
                />

                {/* 4. Arched Backrest Frame & Vertical Laser Grille */}
                <path
                  d={`
                    M ${furnX + 4} ${jhulaSeatY}
                    Q ${furnX + furnW / 2} ${jhulaBackrestY - 6} ${furnX + furnW - 4} ${jhulaSeatY}
                  `}
                  fill={fillSecondary}
                  stroke={strokeMain}
                  strokeWidth={strokeWidthMain}
                />
                {/* Backrest Inner Spindles */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const x = furnX + 12 + i * ((furnW - 24) / 4);
                  return (
                    <line
                      key={i}
                      x1={x}
                      y1={jhulaSeatY}
                      x2={x}
                      y2={jhulaBackrestY + 8}
                      stroke={strokeMain}
                      strokeWidth="1"
                    />
                  );
                })}

                {/* 5. Side Armrests with Spherical Steel Finials */}
                <line x1={furnX} y1={jhulaSeatY} x2={furnX} y2={jhulaSeatY - 14} stroke={strokeMain} strokeWidth="2" />
                <circle cx={furnX} cy={jhulaSeatY - 16} r={3.5} fill={dimColor} stroke={strokeMain} strokeWidth="1" />
                <line x1={furnX + furnW} y1={jhulaSeatY} x2={furnX + furnW} y2={jhulaSeatY - 14} stroke={strokeMain} strokeWidth="2" />
                <circle cx={furnX + furnW} cy={jhulaSeatY - 16} r={3.5} fill={dimColor} stroke={strokeMain} strokeWidth="1" />

                {/* 6. Dashed Swing Arc Clearance Indicator Below Bench */}
                <path
                  d={`M ${furnX - 16} ${floorY - 10} Q ${furnX + furnW / 2} ${floorY - 26} ${furnX + furnW + 16} ${floorY - 10}`}
                  fill="none"
                  stroke={dimColor}
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
                <text
                  x={furnX + furnW / 2}
                  y={floorY - 12}
                  fill={dimColor}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Recommended Swing Clearance: 3 ft
                </text>
              </g>
            )}

            {/* ARCHETYPE 5: SOFA (Tubular armrest + finials + cushion bays) */}
            {blueprintType === "sofa" && (
              <g>
                {/* Main Back Frame */}
                <rect
                  x={furnX}
                  y={furnY}
                  width={furnW}
                  height={furnH - 8}
                  rx="3"
                  fill={fillPrimary}
                  stroke={strokeMain}
                  strokeWidth={strokeWidthMain}
                />
                {/* Tubular Armrests with Spherical Finials */}
                <rect x={furnX - 4} y={furnY + 12} width={8} height={furnH - 20} rx="2" fill={fillSecondary} stroke={strokeMain} strokeWidth="1.4" />
                <circle cx={furnX} cy={furnY + 9} r={3} fill={dimColor} stroke={strokeMain} strokeWidth="1" />
                <rect x={furnX + furnW - 4} y={furnY + 12} width={8} height={furnH - 20} rx="2" fill={fillSecondary} stroke={strokeMain} strokeWidth="1.4" />
                <circle cx={furnX + furnW} cy={furnY + 9} r={3} fill={dimColor} stroke={strokeMain} strokeWidth="1" />

                {/* Cushions */}
                {Array.from({ length: structuralCount }).map((_, i) => {
                  const bayW = (furnW - 16) / structuralCount;
                  const bayX = furnX + 8 + i * bayW;
                  return (
                    <rect
                      key={i}
                      x={bayX + 1.5}
                      y={floorY - furnH * 0.45}
                      width={bayW - 3}
                      height={furnH * 0.38}
                      rx="2"
                      fill={fillSecondary}
                      stroke={strokeMain}
                      strokeWidth="1.2"
                    />
                  );
                })}
              </g>
            )}

            {/* ARCHETYPE 6: DESK (Desktop + tubular leg + 3-drawer pedestal) */}
            {blueprintType === "desk" && (
              <g>
                {/* Desktop */}
                <rect x={furnX} y={furnY} width={furnW} height={8} fill={fillPrimary} stroke={strokeMain} strokeWidth={strokeWidthMain} rx="1.5" />
                {/* Left Tubular Leg */}
                <rect x={furnX + 4} y={furnY + 8} width={6} height={furnH - 8} fill={strokeMain} />
                {/* Right Pedestal Drawer Block */}
                <rect
                  x={furnX + furnW * 0.65}
                  y={furnY + 8}
                  width={furnW * 0.35}
                  height={furnH - 8}
                  fill={fillSecondary}
                  stroke={strokeMain}
                  strokeWidth={strokeWidthMain}
                />
                {/* 3 Drawer horizontal dividers & handles */}
                <line x1={furnX + furnW * 0.65} y1={furnY + (furnH - 8) * 0.33} x2={furnX + furnW} y2={furnY + (furnH - 8) * 0.33} stroke={strokeMain} strokeWidth="1" />
                <line x1={furnX + furnW * 0.65} y1={furnY + (furnH - 8) * 0.66} x2={furnX + furnW} y2={furnY + (furnH - 8) * 0.66} stroke={strokeMain} strokeWidth="1" />
                <rect x={furnX + furnW * 0.8} y={furnY + (furnH - 8) * 0.15} width={12} height={2} fill={strokeMain} rx="1" />
                <rect x={furnX + furnW * 0.8} y={furnY + (furnH - 8) * 0.48} width={12} height={2} fill={strokeMain} rx="1" />
                <rect x={furnX + furnW * 0.8} y={furnY + (furnH - 8) * 0.8} width={12} height={2} fill={strokeMain} rx="1" />

                {/* Knee Clearance Note */}
                <text x={furnX + furnW * 0.32} y={furnY + furnH * 0.55} fill="#71717A" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                  KNEE CLEARANCE
                </text>
              </g>
            )}

            {/* ARCHETYPE 7: CHAIR (Arched backrest + 18" seat height) */}
            {blueprintType === "chair" && (
              <g>
                {/* Top Arched Backrest */}
                <path
                  d={`M ${furnX + 4} ${furnY + 10} Q ${furnX + furnW / 2} ${furnY} ${furnX + furnW - 4} ${furnY + 10}`}
                  stroke={strokeMain}
                  strokeWidth={strokeWidthMain}
                  fill="none"
                />
                {/* Seat Cushion (~18" elevation) */}
                <rect
                  x={furnX}
                  y={floorY - 18 * pxPerInch}
                  width={furnW}
                  height={8}
                  rx="2"
                  fill={fillPrimary}
                  stroke={strokeMain}
                  strokeWidth={strokeWidthMain}
                />
                {/* Legs and backrest rails */}
                <line x1={furnX + 4} y1={furnY + 10} x2={furnX + 4} y2={floorY} stroke={strokeMain} strokeWidth="1.5" />
                <line x1={furnX + furnW - 4} y1={furnY + 10} x2={furnX + furnW - 4} y2={floorY} stroke={strokeMain} strokeWidth="1.5" />
              </g>
            )}

            {/* ARCHETYPE 8: GENERIC BOX / UNKNOWN */}
            {blueprintType === "generic_box" && (
              <g>
                <rect
                  x={furnX}
                  y={furnY}
                  width={furnW}
                  height={furnH}
                  rx="3"
                  fill={fillPrimary}
                  stroke={strokeMain}
                  strokeWidth={strokeWidthMain}
                />
                <line x1={furnX} y1={furnY} x2={furnX + furnW} y2={furnY + furnH} stroke={strokeMain} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <line x1={furnX + furnW} y1={furnY} x2={furnX} y2={furnY + furnH} stroke={strokeMain} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              </g>
            )}
          </g>

          {/* ======================================================== */}
          {/* C. TECHNICAL DIMENSION ARROWS & LABELS                   */}
          {/* ======================================================== */}
          {/* Horizontal Width Dimension Line (Above piece or above seat for jhula) */}
          <g>
            {/* Dashed Dimension Line */}
            <line
              x1={furnX}
              y1={Math.max(22, isJhula ? jhulaSeatY - 20 : furnY - 16)}
              x2={furnX + furnW}
              y2={Math.max(22, isJhula ? jhulaSeatY - 20 : furnY - 16)}
              stroke={dimColor}
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            {/* End ticks */}
            <line
              x1={furnX}
              y1={Math.max(17, (isJhula ? jhulaSeatY - 20 : furnY - 16) - 4)}
              x2={furnX}
              y2={Math.max(27, (isJhula ? jhulaSeatY - 20 : furnY - 16) + 4)}
              stroke={dimColor}
              strokeWidth="1.2"
            />
            <line
              x1={furnX + furnW}
              y1={Math.max(17, (isJhula ? jhulaSeatY - 20 : furnY - 16) - 4)}
              x2={furnX + furnW}
              y2={Math.max(27, (isJhula ? jhulaSeatY - 20 : furnY - 16) + 4)}
              stroke={dimColor}
              strokeWidth="1.2"
            />
            {/* Width Text Tag */}
            <text
              x={furnX + furnW / 2}
              y={Math.max(18, (isJhula ? jhulaSeatY - 20 : furnY - 16) - 5)}
              fill={dimColor}
              fontSize={compact ? "8.5" : "9.5"}
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              W: {formatDimension(widthIn, unit)}
            </text>
          </g>

          {/* Vertical Height Dimension Line (Right of piece) */}
          <g>
            <line
              x1={furnX + furnW + 14}
              y1={furnY}
              x2={furnX + furnW + 14}
              y2={floorY}
              stroke={dimColor}
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            {/* End ticks */}
            <line
              x1={furnX + furnW + 10}
              y1={furnY}
              x2={furnX + furnW + 18}
              y2={furnY}
              stroke={dimColor}
              strokeWidth="1.2"
            />
            <line
              x1={furnX + furnW + 10}
              y1={floorY}
              x2={furnX + furnW + 18}
              y2={floorY}
              stroke={dimColor}
              strokeWidth="1.2"
            />
            {/* Height Text Tag */}
            <text
              x={furnX + furnW + 22}
              y={furnY + furnH / 2 + 3}
              fill={dimColor}
              fontSize={compact ? "8.5" : "9.5"}
              fontFamily="monospace"
              fontWeight="bold"
            >
              H: {formatDimension(heightIn, unit)}
            </text>
          </g>
        </svg>
      </div>

      {/* ======================================================== */}
      {/* 3. FOOTER SPEC PILL STRIP                                */}
      {/* ======================================================== */}
      {compact ? (
        <div className="flex items-center justify-between gap-1 pt-1.5 mt-1 border-t border-[#18181B]/10 text-[9px] font-mono text-[#71717A]">
          <div className="flex items-center gap-1 font-bold text-[#18181B]">
            <span>W: {formatDimension(widthIn, unit)}</span>
            <span>•</span>
            <span>H: {formatDimension(heightIn, unit)}</span>
            <span>•</span>
            <span>D: {formatDimension(depthIn, unit)}</span>
          </div>
          <span className="truncate text-[#9A3412]">
            {isJhula ? "3ft Swing Clr" : "Precision Steel"}
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 mt-1 text-[11px] font-mono border-t border-[#18181B]/10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#71717A]">Dimensions:</span>
            <span className="font-bold text-[#18181B] bg-white border border-[#18181B]/10 px-2 py-0.5 rounded-md shadow-2xs">
              H: {formatDimension(heightIn, unit)}
            </span>
            <span className="font-bold text-[#18181B] bg-white border border-[#18181B]/10 px-2 py-0.5 rounded-md shadow-2xs">
              W: {formatDimension(widthIn, unit)}
            </span>
            <span className="font-bold text-[#18181B] bg-white border border-[#18181B]/10 px-2 py-0.5 rounded-md shadow-2xs">
              D: {formatDimension(depthIn, unit)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[#9A3412] font-semibold flex items-center gap-1">
              <span>
                {isJhula
                  ? "Recommended Swing Clearance: 3 ft front & back"
                  : `Wall Clearance: ~${Math.max(2, Math.round(depthIn * 0.1))}"`}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 text-[#71717A]">
              <span>•</span>
              <span>Laser-measured precision steel fabrication.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
