import { z } from "zod";

/**
 * Subcategory schema
 */
export const SubCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
});

export type SubCategory = z.infer<typeof SubCategorySchema>;

/**
 * Master Category Schema
 */
export const MasterCategorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  name_hi: z.string().optional(),
  tagline: z.string(),
  lifestyle_image: z.string().min(1),
  item_count: z.number().int().nonnegative(),
  sub_categories: z.array(SubCategorySchema).min(1),
});

export type MasterCategory = z.infer<typeof MasterCategorySchema>;

export const CategoryProductFinishSchema = z.object({
  id: z.string(),
  name: z.string(),
  hex: z.string(),
  imageUrl: z.string(),
});

export type CategoryProductFinish = z.infer<typeof CategoryProductFinishSchema>;

/**
 * Category-First Product Schema
 */
export const CategoryProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  category_slug: z.string(),
  sub_category: z.string(),
  title: z.string(),
  price: z.number().int().positive(),
  mrp: z.number().int().positive().optional(),
  lifestyle_image: z.string().min(1),
  inside_image: z.string().min(1).optional(),
  available_colors: z.array(z.string()).min(1),
  specs: z.string().optional(),
  tagline: z.string().optional(),
  size_count: z.number().int().nonnegative().optional(),
  finishes: z.array(CategoryProductFinishSchema).optional(),
});

export type CategoryProduct = z.infer<typeof CategoryProductSchema>;

