import { z } from "zod";

/**
 * Color and texture variant schema
 */
export const MediaVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  hex: z.string(), // Hex code or CSS gradient
  outsideImageUrl: z.string().url(),
  insideImageUrl: z.string().url(),
});

export type MediaVariant = z.infer<typeof MediaVariantSchema>;

/**
 * PostgreSQL JSONB `media` column schema
 */
export const ProductMediaSchema = z.object({
  outsideView: z.string().url(),
  insideView: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  alt: z.string(),
  variants: z.array(MediaVariantSchema),
});

export type ProductMedia = z.infer<typeof ProductMediaSchema>;

/**
 * PostgreSQL JSONB `attributes` column schema
 */
export const ProductAttributesSchema = z.object({
  gauge: z.string(), // e.g., "Tata 20 Gauge CRCA"
  lockType: z.string().optional(), // e.g., "Ultra Lock + Secret Vault"
  dimensions: z.string().optional(), // e.g., "78H x 36W x 21D (inches)"
  tags: z.array(z.string()), // e.g., ["3-Door", "Wooden Finish", "Locker", "Royal Blue"]
  warranty: z.string().optional(), // e.g., "10 Years Anti-Rust Warranty"
});

export type ProductAttributes = z.infer<typeof ProductAttributesSchema>;

/**
 * Product Schema
 */
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string().optional(),
  slug: z.string(),
  category: z.string(),
  price: z.number().int().positive(),
  mrp: z.number().int().positive().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  media: ProductMediaSchema,
  attributes: ProductAttributesSchema,
  inStock: z.boolean().default(true),
});

export type Product = z.infer<typeof ProductSchema>;

/**
 * Visual Filter Pill Schema
 */
export const FilterPillSchema = z.object({
  id: z.string(),
  label: z.string(),
  tag: z.string(), // Tag to match against product.attributes.tags or "all"
  thumbnailUrl: z.string().url(),
});

export type FilterPill = z.infer<typeof FilterPillSchema>;
