import { z } from "zod";

/**
 * ============================================================
 * EDITORIAL SHOWROOM BLOCKS
 * ============================================================
 */

/**
 * Hotspot Pin Schema for "Shop the Room" Hero
 */
export const RoomHotspotSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.string(),
  href: z.string(),
  xPercent: z.number(),
  yPercent: z.number(),
  product_id: z.string().optional(),
  product_slug: z.string().optional(),
});

export type RoomHotspot = z.infer<typeof RoomHotspotSchema>;

/**
 * Section 1: HeroRoomShowcase Schema
 */
export const HeroRoomShowcaseBlockSchema = z.object({
  id: z.string(),
  type: z.literal("hero_room_showcase"),
  label: z.string().optional(), // e.g., "BUILT FOR EVERY ROOM"
  headline: z.string(), // e.g., "Furniture That Defines Your Home."
  imageUrl: z.string(), // Supports both local "/image.png" and remote URLs
  imageAlt: z.string().optional(),
  cta: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
  hotspots: z.array(RoomHotspotSchema).optional(),
});

export type HeroRoomShowcaseBlockData = z.infer<typeof HeroRoomShowcaseBlockSchema>;

/**
 * Bento Space Card Schema
 */
export const BentoSpaceCardSchema = z.object({
  id: z.string(),
  title: z.string(), // e.g., "Master Bedroom"
  subtitle: z.string(), // e.g., "Wardrobes, Beds & Dressers"
  href: z.string(),
  imageUrl: z.string(),
  imageAlt: z.string().optional(),
  gridSpan: z.enum([
    "master_bedroom",
    "living_hall",
    "dining_space",
    "study_office",
    "storage_almirah",
  ]).or(z.string()).optional(),
  category_id: z.string().optional(),
});

export type BentoSpaceCard = z.infer<typeof BentoSpaceCardSchema>;

/**
 * Section 2: AsymmetricSpacesBento Schema ("Shop by Space")
 */
export const AsymmetricSpacesBentoBlockSchema = z.object({
  id: z.string(),
  type: z.literal("asymmetric_spaces_bento"),
  title: z.string(), // e.g., "Designed for Every Space"
  cards: z.array(BentoSpaceCardSchema),
});

export type AsymmetricSpacesBentoBlockData = z.infer<typeof AsymmetricSpacesBentoBlockSchema>;

/**
 * Lookbook Furniture Piece Schema
 */
export const LookbookPieceSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.string(),
  imageUrl: z.string(),
  href: z.string(),
  product_id: z.string().optional(),
});

export type LookbookPiece = z.infer<typeof LookbookPieceSchema>;

/**
 * Lookbook Room Tab Schema
 */
export const LookbookRoomSchema = z.object({
  id: z.string(),
  tabLabel: z.string(), // "Bedroom" | "Living Room" | "Dining" | "Home Office"
  lifestyleImageUrl: z.string(),
  lifestyleImageAlt: z.string().optional(),
  products: z.array(LookbookPieceSchema),
});

export type LookbookRoom = z.infer<typeof LookbookRoomSchema>;

/**
 * Section 3: InteractiveRoomLookbook Schema ("Complete the Room")
 */
export const InteractiveRoomLookbookBlockSchema = z.object({
  id: z.string(),
  type: z.literal("interactive_room_lookbook"),
  title: z.string(), // e.g., "Complete the Look"
  subtitle: z.string().optional(),
  rooms: z.array(LookbookRoomSchema),
});

export type InteractiveRoomLookbookBlockData = z.infer<typeof InteractiveRoomLookbookBlockSchema>;

/**
 * Section 4: VisualCraftsmanshipSplit Schema ("Show, Don't Tell" Quality)
 */
export const CraftsmanshipSideSchema = z.object({
  caption: z.string(),
  imageUrl: z.string(),
  imageAlt: z.string().optional(),
  href: z.string().optional(),
});

export type CraftsmanshipSide = z.infer<typeof CraftsmanshipSideSchema>;

export const VisualCraftsmanshipSplitBlockSchema = z.object({
  id: z.string(),
  type: z.literal("visual_craftsmanship_split"),
  left: CraftsmanshipSideSchema.optional(),
  right: CraftsmanshipSideSchema.optional(),
});

export type VisualCraftsmanshipSplitBlockData = z.infer<typeof VisualCraftsmanshipSplitBlockSchema>;

/**
 * Section: WallColorMatcher Schema ("Design by Color")
 */
export const WallColorOptionSchema = z.object({
  id: z.string(),
  wallName: z.string(),
  hex: z.string(),
  advice: z.string(),
  image: z.string(),
  href: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
});

export type WallColorOption = z.infer<typeof WallColorOptionSchema>;

export const WallColorMatcherBlockSchema = z.object({
  id: z.string(),
  type: z.literal("wall_color_matcher"),
  label: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  combinations: z.array(WallColorOptionSchema).optional(),
});

export type WallColorMatcherBlockData = z.infer<typeof WallColorMatcherBlockSchema>;

/**
 * ============================================================
 * LEGACY BLOCKS (Retained for Backward Compatibility)
 * ============================================================
 */
export const TrustBadgeSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.enum(["rust-proof", "heavy-gauge", "factory-direct"]),
  description: z.string().optional(),
});
export type TrustBadge = z.infer<typeof TrustBadgeSchema>;

export const HeroBlockSchema = z.object({
  id: z.string(),
  type: z.literal("hero"),
  headline: z.string(),
  subheadline: z.string().optional(),
  imageUrl: z.string().min(1),
  imageAlt: z.string(),
  primaryCta: z.object({ label: z.string(), href: z.string() }),
  secondaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
  trustBadges: z.array(TrustBadgeSchema),
});
export type HeroBlockData = z.infer<typeof HeroBlockSchema>;

export const CategoryCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  designCount: z.string(),
  slug: z.string(),
  imageUrl: z.string().min(1),
  imageAlt: z.string(),
  startingPrice: z.string().optional(),
});
export type CategoryCard = z.infer<typeof CategoryCardSchema>;

export const CategoryGridBlockSchema = z.object({
  id: z.string(),
  type: z.literal("category_grid"),
  title: z.string(),
  subtitle: z.string().optional(),
  categories: z.array(CategoryCardSchema),
});
export type CategoryGridBlockData = z.infer<typeof CategoryGridBlockSchema>;

/**
 * Discriminated Union for Page Blocks
 */
export const PageBlockSchema = z.discriminatedUnion("type", [
  HeroRoomShowcaseBlockSchema,
  AsymmetricSpacesBentoBlockSchema,
  WallColorMatcherBlockSchema,
  InteractiveRoomLookbookBlockSchema,
  VisualCraftsmanshipSplitBlockSchema,
  HeroBlockSchema,
  CategoryGridBlockSchema,
]);

export type PageBlock = z.infer<typeof PageBlockSchema>;
