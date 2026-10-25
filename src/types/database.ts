import { z } from "zod";

// ============================================================================
// 1. ENUMS & CONSTANTS
// ============================================================================

export const BlueprintTypeEnum = z.enum([
  "wardrobe",
  "bed",
  "seating",
  "table",
  "storage",
]);
export type BlueprintType = z.infer<typeof BlueprintTypeEnum>;

export const StockStatusEnum = z.enum(["in_stock", "made_to_order"]);
export type StockStatus = z.infer<typeof StockStatusEnum>;

export const PaymentModeEnum = z.enum(["token_advance", "full_prepaid", "cod"]);
export type PaymentMode = z.infer<typeof PaymentModeEnum>;

export const OrderStatusEnum = z.enum([
  "pending_token",
  "confirmed",
  "in_production",
  "dispatched",
  "delivered",
  "cancelled",
]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// ============================================================================
// 2. MEDIA & DIMENSIONS SCHEMAS
// ============================================================================

/**
 * Exact 4-slot media keys required for every product finish
 */
export const FinishMediaSchema = z
  .object({
    lifestyle: z.string().default(""),
    front: z.string().default(""),
    functional: z.string().default(""),
    macro: z.string().default(""),
  })
  .refine(
    (media) =>
      Boolean(
        (media.lifestyle && media.lifestyle.trim().length > 0) ||
        (media.front && media.front.trim().length > 0) ||
        (media.functional && media.functional.trim().length > 0) ||
        (media.macro && media.macro.trim().length > 0)
      ),
    {
      message: "At least one product photo is required for this color finish",
      path: ["lifestyle"],
    }
  );
export type FinishMedia = z.infer<typeof FinishMediaSchema>;

/**
 * Smart dimensions schema accommodating dynamic blueprint types
 */
export const DimensionsSchema = z.object({
  height: z.number().min(0, "Height cannot be negative").optional(),
  width: z.number().min(0, "Width cannot be negative").optional(),
  depth: z.number().min(0, "Depth cannot be negative").optional(),
  length: z.number().min(0, "Length cannot be negative").optional(),
  headboard_height: z.number().min(0, "Headboard height cannot be negative").optional(),
  total_height: z.number().min(0, "Total height cannot be negative").optional(),
  seat_height: z.number().min(0, "Seat height cannot be negative").optional(),
  unit: z.literal("inches").default("inches"),
});
export type Dimensions = z.infer<typeof DimensionsSchema>;

// ============================================================================
// 3. DATABASE TABLE SCHEMAS
// ============================================================================

/**
 * 1. categories
 */
export const CategorySchema = z.object({
  id: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  name_en: z.string().min(2, "English name is required"),
  name_hi: z.string().min(2, "Hindi name is required"),
  slug: z.string().min(2, "Slug is required"),
  blueprint_type: BlueprintTypeEnum,
  cover_image: z.string().min(1, "Cover image is required"),
  subtitle: z.string().nullable().optional(),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Category = z.infer<typeof CategorySchema>;

/**
 * 2. products
 */
export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid("Category is required"),
  sub_category_id: z.string().uuid().nullable().optional(),
  title_en: z.string().min(2, "English title is required"),
  title_hi: z.string().min(2, "Hindi title is required"),
  slug: z.string().min(2, "Slug is required"),
  tagline: z.string().min(4, "Tagline is required"),
  base_price: z.number().positive("Base price must be greater than zero"),
  highlights: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Product = z.infer<typeof ProductSchema>;

/**
 * 3. product_finishes
 */
export const ProductFinishSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
  finish_name: z.string().min(1, "Finish name is required"),
  hex_code: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid hex color required"),
  media: FinishMediaSchema,
  is_default: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type ProductFinish = z.infer<typeof ProductFinishSchema>;

/**
 * 4. product_sizes
 */
export const ProductSizeSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
  size_label: z.string().min(1, "Size label is required"),
  price: z.number().positive("Price must be greater than zero"),
  token_amount: z.number().positive("Token amount must be greater than zero").default(999),
  dimensions: DimensionsSchema,
  stock_status: StockStatusEnum.default("in_stock"),
  delivery_days: z.number().int().min(1).default(7),
  is_default: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type ProductSize = z.infer<typeof ProductSizeSchema>;

/**
 * 5. storefront_sections
 */
export const StorefrontSectionSchema = z.object({
  id: z.string().uuid().optional(),
  section_key: z.string().min(2, "Section key is required"),
  title_en: z.string().min(2, "English title is required"),
  title_hi: z.string().min(2, "Hindi title is required"),
  content: z.record(z.unknown()),
  is_active: z.boolean().default(true),
  display_order: z.number().default(0).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type StorefrontSection = z.infer<typeof StorefrontSectionSchema>;

/**
 * 6. bookings
 */
export const BookingSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid("Product is required"),
  finish_id: z.string().uuid("Finish is required"),
  size_id: z.string().uuid("Size is required"),
  customer_name: z.string().min(2, "Customer name is required"),
  customer_phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile number required"),
  pincode: z.string().regex(/^\d{6}$/, "Valid 6-digit Indian PIN code required"),
  city_district: z.string().min(2, "City / District is required"),
  payment_mode: PaymentModeEnum.default("token_advance"),
  total_amount: z.number().positive("Total amount is required"),
  amount_paid: z.number().min(0).default(0),
  order_status: OrderStatusEnum.default("pending_token"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Booking = z.infer<typeof BookingSchema>;

// ============================================================================
// 4. COMPOSITE ADMIN WIZARD SCHEMAS
// ============================================================================

export const ProductWizardFormSchema = z.object({
  id: z.string().optional(),
  // Step 1: Basics & Placement
  category_id: z.string().min(1, "Select a room category"),
  sub_category_id: z.string().nullable().optional(),
  blueprint_type: BlueprintTypeEnum,
  title_en: z.string().min(3, "Title must be at least 3 characters"),
  title_hi: z.string().min(3, "Hindi/Hinglish title is required"),
  slug: z.string().min(2, "Slug is required"),
  tagline: z.string().min(4, "Tagline must be at least 4 characters"),
  base_price: z.number().positive("Base price must be greater than zero"),
  highlights: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),

  // Step 2: Finishes with 4 photos
  finishes: z.array(ProductFinishSchema).min(1, "At least one color finish is required"),

  // Step 3: Sizes with smart dimensions
  sizes: z.array(ProductSizeSchema).min(1, "At least one size option is required"),
});
export type ProductWizardFormData = z.infer<typeof ProductWizardFormSchema>;

// ============================================================================
// 5. STOREFRONT VISUAL EDITOR TYPES
// ============================================================================

export interface HeroHotspot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  label: string;
  product_slug: string;
  product_id?: string;
  price: number;
}

export interface HeroShowcaseContent {
  image_url: string;
  badge: string;
  headline_en: string;
  headline_hi: string;
  hotspots: HeroHotspot[];
}

export interface BentoCardItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  col_span?: "tall" | "wide" | "standard";
  category_id?: string;
}

export interface BentoSpacesContent {
  cards: BentoCardItem[];
}

export interface WallColorItem {
  id: string;
  wallName: string;
  hex: string;
  advice: string;
  image: string;
  href?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface WallColorMatcherContent {
  combinations: WallColorItem[];
}

/**
 * 4. Complete the Look (Room Switcher) Block
 */
export const CompleteTheLookSetSchema = z.object({
  id: z.string(),
  tabName: z.string().min(1, "Tab name is required (e.g. Bedroom)"),
  badgeLabel: z.string().min(1, "Badge label is required (e.g. Master Bedroom Set)"),
  lifestyleImage: z.string().min(1, "Lifestyle room image is required"),
  linkedProductIds: z.array(z.string()).max(4, "Up to 4 linked products permitted per set"),
  exploreLink: z.object({
    text: z.string().min(1, "Explore link text is required (e.g. Explore Bedroom Collection)"),
    href: z.string().min(1, "Target category URL is required (e.g. /categories/bedroom)"),
  }),
});
export type CompleteTheLookSet = z.infer<typeof CompleteTheLookSetSchema>;

export const CompleteTheLookSchema = z.object({
  sets: z.array(CompleteTheLookSetSchema).min(1, "At least one room set is required"),
});
export type CompleteTheLookData = z.infer<typeof CompleteTheLookSchema>;
