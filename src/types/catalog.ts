import { z } from "zod";

/**
 * Catalog Product Schema
 */
export const CatalogProductSchema = z.object({
  slug: z.string(),
  title: z.string(),
  tagline: z.string().optional(),
  price: z.number().int().positive(),
  mrp: z.number().int().positive().optional(),
  category: z.string(),
  tags: z.array(z.string()),
  lifestyle_image: z.string().min(1),
  inside_image: z.string().min(1),
  available_colors: z.array(z.string()).min(1), // array of hex codes
});

export type CatalogProduct = z.infer<typeof CatalogProductSchema>;

/**
 * Filter Pill Item Schema
 */
export const FilterPillItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  tag: z.string(),
  swatchHex: z.string().optional(),
  iconName: z.string().optional(),
});

export type FilterPillItem = z.infer<typeof FilterPillItemSchema>;
