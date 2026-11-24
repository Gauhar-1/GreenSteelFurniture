/**
 * Parametric SVG Blueprint Scale Chart Utilities
 * 
 * Provides archetype resolution, dimension parsing (inches/feet),
 * structural count inference, and architectural formatting.
 */

export const BLUEPRINT_TYPES = [
  "wardrobe",
  "bed",
  "dining_table",
  "jhula",
  "sofa",
  "desk",
  "chair",
  "generic_box",
] as const;

export type BlueprintType = (typeof BLUEPRINT_TYPES)[number];

export interface ParsedDimensions {
  widthIn: number;
  heightIn: number;
  depthIn: number;
  hasExactDims: boolean;
}

/**
 * Architectural fallback defaults in inches
 */
export const ARCHITECTURAL_DEFAULTS: Record<BlueprintType, { widthIn: number; heightIn: number; depthIn: number }> = {
  wardrobe: { widthIn: 36, heightIn: 78, depthIn: 22 },
  bed: { widthIn: 72, heightIn: 48, depthIn: 80 },
  dining_table: { widthIn: 60, heightIn: 30, depthIn: 36 },
  jhula: { widthIn: 48, heightIn: 76, depthIn: 30 },
  sofa: { widthIn: 72, heightIn: 34, depthIn: 32 },
  desk: { widthIn: 48, heightIn: 30, depthIn: 24 },
  chair: { widthIn: 20, heightIn: 36, depthIn: 22 },
  generic_box: { widthIn: 36, heightIn: 36, depthIn: 24 },
};

/**
 * Human-friendly scale chart display labels
 */
export const BLUEPRINT_LABELS: Record<BlueprintType, string> = {
  wardrobe: "Wardrobe / Almirah (Auto 2/3/4-Door)",
  bed: "Steel Bed (Headboard & Finials)",
  dining_table: "Dining Table (Auto 4/6/8-Seater)",
  jhula: "Jhula Swing (Veranda Arc Clearance)",
  sofa: "Living Sofa (Modular Cushions)",
  desk: "Office Desk (Knee Clearance)",
  chair: "Dining / Accent Chair",
  generic_box: "Generic Wireframe Scale Box",
};

/**
 * Safely resolves the active blueprint archetype
 * 
 * Priority:
 * 1. Explicit product blueprint_type column (if valid)
 * 2. Smart keyword detection from fallbackText (title, sub-category, category)
 * 3. Category blueprint_type fallback
 * 4. "generic_box" fallback
 */
export function resolveBlueprintType(
  productBlueprint?: string | null,
  categoryBlueprint?: string | null,
  fallbackText?: string
): BlueprintType {
  const normalize = (val?: string | null): BlueprintType | null => {
    if (!val) return null;
    const clean = val.trim().toLowerCase();
    if (clean === "table") return "dining_table";
    if (clean === "seating") return "sofa";
    if (clean === "storage") return "wardrobe";
    if (BLUEPRINT_TYPES.includes(clean as BlueprintType)) {
      return clean as BlueprintType;
    }
    return null;
  };

  // 1. Explicit product blueprint has top priority
  const resolvedProduct = normalize(productBlueprint);
  if (resolvedProduct) return resolvedProduct;

  // 2. Smart Keyword Fallback on Product Title / Categories
  if (fallbackText) {
    const text = fallbackText.toLowerCase();
    if (text.includes("jhula") || text.includes("swing")) return "jhula";
    if (
      text.includes("almirah") ||
      text.includes("wardrobe") ||
      text.includes("locker") ||
      text.includes("cabinet")
    ) {
      return "wardrobe";
    }
    if (text.includes("bed") || text.includes("diwan")) return "bed";
    if (text.includes("dining")) return "dining_table";
    if (text.includes("sofa") || text.includes("couch") || text.includes("lounger")) return "sofa";
    if (text.includes("desk") || text.includes("study") || text.includes("computer")) return "desk";
    if (text.includes("chair") || text.includes("stool")) return "chair";
  }

  // 3. Category blueprint fallback
  const resolvedCategory = normalize(categoryBlueprint);
  if (resolvedCategory) return resolvedCategory;

  return "generic_box";
}

/**
 * Parses size variant data into normalized inches
 */
export function parseDimensionsToInches(
  sizeVariant: {
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
  } | null | undefined,
  blueprintType: BlueprintType = "generic_box"
): ParsedDimensions {
  const defaults = ARCHITECTURAL_DEFAULTS[blueprintType] || ARCHITECTURAL_DEFAULTS.generic_box;

  if (!sizeVariant) {
    return {
      widthIn: defaults.widthIn,
      heightIn: defaults.heightIn,
      depthIn: defaults.depthIn,
      hasExactDims: false,
    };
  }

  const dims = sizeVariant.dimensions;
  let widthIn = 0;
  let heightIn = 0;
  let depthIn = 0;
  let hasExactDims = false;

  // 1. Structured dimensions object
  if (dims) {
    widthIn = Number(dims.width || 0);
    heightIn = Number(dims.height || dims.total_height || dims.headboard_height || 0);
    depthIn = Number(dims.depth || 0);

    // Bed length is often stored in length
    if (blueprintType === "bed" && dims.length && dims.length > 0) {
      depthIn = Number(dims.length);
    }

    if (widthIn > 0 || heightIn > 0 || depthIn > 0) {
      hasExactDims = true;
    }
  }

  // 2. Parse from size_label string fallback if structured dimensions are missing
  if ((!widthIn || !heightIn) && sizeVariant.size_label) {
    const label = sizeVariant.size_label;

    // Check for "72 x 36 x 20" or "72" x 36" x 20""
    const matches = label.match(/(\d+(?:\.\d+)?)\s*(?:["']|ft|in)?\s*[x×by,-]\s*(\d+(?:\.\d+)?)(?:\s*(?:["']|ft|in)?\s*[x×by,-]\s*(\d+(?:\.\d+)?))?/i);
    if (matches) {
      const isFeet = /ft|feet|'/i.test(label);
      const mult = isFeet ? 12 : 1;
      const v1 = parseFloat(matches[1]) * mult;
      const v2 = parseFloat(matches[2]) * mult;
      const v3 = matches[3] ? parseFloat(matches[3]) * mult : 0;

      // Assign height as the largest number for vertical pieces like wardrobes, or standard order
      if (blueprintType === "wardrobe") {
        heightIn = Math.max(v1, v2);
        widthIn = Math.min(v1, v2);
        depthIn = v3 || defaults.depthIn;
      } else {
        widthIn = v1;
        depthIn = v2;
        heightIn = v3 || defaults.heightIn;
      }
      hasExactDims = true;
    }
  }

  return {
    widthIn: widthIn > 0 ? widthIn : defaults.widthIn,
    heightIn: heightIn > 0 ? heightIn : defaults.heightIn,
    depthIn: depthIn > 0 ? depthIn : defaults.depthIn,
    hasExactDims,
  };
}

/**
 * Formats inches into architectural notation (e.g., 72" or 6' 0")
 */
export function formatDimension(inches: number, unit: "in" | "ft"): string {
  if (isNaN(inches) || inches <= 0) return `--`;

  if (unit === "in") {
    return `${Math.round(inches)}"`;
  }

  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);

  if (remainingInches === 12) {
    return `${feet + 1}' 0"`;
  }

  return `${feet}' ${remainingInches}"`;
}

/**
 * Infers structural door, seat, or bay counts from label and width
 */
export function inferStructuralCount(
  sizeLabel: string = "",
  widthIn: number = 36,
  blueprintType: BlueprintType
): number {
  const clean = sizeLabel.toLowerCase();

  switch (blueprintType) {
    case "wardrobe": {
      const match = clean.match(/(\d+)\s*-?\s*door/i) || clean.match(/(\d+)\s*d\b/i);
      if (match) return Math.max(1, Math.min(6, parseInt(match[1], 10)));
      // Fallback based on width: <30" -> 2 doors, 31"-54" -> 3 doors, >54" -> 4 doors
      if (widthIn <= 32) return 2;
      if (widthIn <= 56) return 3;
      return 4;
    }

    case "dining_table": {
      const match = clean.match(/(\d+)\s*-?\s*seater/i) || clean.match(/(\d+)\s*s\b/i);
      if (match) return Math.max(2, Math.min(12, parseInt(match[1], 10)));
      // Fallback: <48" -> 4, <72" -> 6, >=72" -> 8
      if (widthIn <= 48) return 4;
      if (widthIn <= 72) return 6;
      return 8;
    }

    case "sofa": {
      const match = clean.match(/(\d+)\s*-?\s*seater/i) || clean.match(/(\d+)\s*s\b/i);
      if (match) return Math.max(1, Math.min(5, parseInt(match[1], 10)));
      if (widthIn <= 40) return 1;
      if (widthIn <= 64) return 2;
      return 3;
    }

    default:
      return 1;
  }
}

