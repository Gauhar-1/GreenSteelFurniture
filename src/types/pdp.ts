import { z } from "zod";

/**
 * Product Finish Schema
 */
export const ProductFinishSchema = z.object({
  id: z.string(),
  name: z.string(),
  hex: z.string(),
  outsideImage: z.string(),
  insideImage: z.string(),
});

export type ProductFinish = z.infer<typeof ProductFinishSchema>;

/**
 * Product Size Option Schema
 */
export const ProductSizeSchema = z.object({
  id: z.string(),
  label: z.string(), // e.g. "Standard 3-Door"
  specs: z.string(), // e.g. '36" W x 78" H'
  priceDelta: z.number().default(0),
});

export type ProductSize = z.infer<typeof ProductSizeSchema>;

/**
 * Gallery Image Item
 */
export const GalleryImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

export type GalleryImage = z.infer<typeof GalleryImageSchema>;

/**
 * PDP Product Schema
 */
export const PdpProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string(),
  slug: z.string(),
  basePrice: z.number().positive(),
  mrp: z.number().positive(),
  dimensions: z.object({
    heightInches: z.number(),
    widthInches: z.number(),
    depthInches: z.number(),
    note: z.string(),
  }),
  sizes: z.array(ProductSizeSchema).min(1),
  finishes: z.array(ProductFinishSchema).min(1),
  galleryOutside: z.array(GalleryImageSchema).min(1),
  galleryInside: z.array(GalleryImageSchema).min(1),
});

export type PdpProduct = z.infer<typeof PdpProductSchema>;
