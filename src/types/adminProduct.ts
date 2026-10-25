import { z } from "zod";

/**
 * Supported Product Category Identifiers
 */
export const ProductCategoryEnum = z.enum([
  "wardrobes_storage",
  "beds",
  "seating",
]);

export type ProductCategory = z.infer<typeof ProductCategoryEnum>;

/**
 * 4-Slot Images Schema for each variant
 * Exactly 4 slots supported: at least 1 image is required, other 3 are optional (stored as empty strings).
 */
export const VariantImagesSchema = z
  .object({
    lifestyle_image: z.string(),
    studio_front_image: z.string(),
    functional_view_image: z.string(),
    macro_detail_image: z.string(),
  })
  .refine(
    (imgs) =>
      Boolean(
        (imgs.lifestyle_image && imgs.lifestyle_image.trim().length > 0) ||
        (imgs.studio_front_image && imgs.studio_front_image.trim().length > 0) ||
        (imgs.functional_view_image && imgs.functional_view_image.trim().length > 0) ||
        (imgs.macro_detail_image && imgs.macro_detail_image.trim().length > 0)
      ),
    {
      message: "At least one photo is required for this variant (the other three are optional)",
      path: ["lifestyle_image"],
    }
  );

export type VariantImages = z.infer<typeof VariantImagesSchema>;

/**
 * Variant Stock Status
 */
export const VariantStockStatusEnum = z.enum(["in_stock", "made_to_order"]);
export type VariantStockStatus = z.infer<typeof VariantStockStatusEnum>;

/**
 * Flat Product Variant Schema
 */
export const ProductVariantFormItemSchema = z.object({
  id: z.string(),
  size_config_label: z.string().min(1, "Size/config label is required (e.g. Standard 3-Door)"),
  finish_name: z.string().min(1, "Finish/color name is required (e.g. Matte Charcoal)"),
  ui_hex_code: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid hex color code required (e.g. #36454F)"),
  price: z.number().positive("Variant price must be greater than zero"),
  stock_status: VariantStockStatusEnum,
  images: VariantImagesSchema,
});

export type ProductVariantFormItem = z.infer<typeof ProductVariantFormItemSchema>;

const optionalDimensionNumber = z.number().positive("Must be a positive number").optional();

/**
 * Dynamic Dimensions Object Schema
 * Accommodates Wardrobes, Beds, and Seating parameters cleanly
 */
export const DynamicDimensionsSchema = z.object({
  // Wardrobes & Storage
  height: optionalDimensionNumber,
  width: optionalDimensionNumber,
  depth: optionalDimensionNumber,

  // Beds
  length: optionalDimensionNumber,
  headboard_height: optionalDimensionNumber,

  // Seating
  total_height: optionalDimensionNumber,
  seat_height: optionalDimensionNumber,
});

export type DynamicDimensions = z.infer<typeof DynamicDimensionsSchema>;

/**
 * Master Product Blueprint Form Schema
 */
export const ProductBlueprintSchema = z
  .object({
    title: z.string().min(3, "Product title must be at least 3 characters"),
    tagline: z.string().min(5, "Tagline must be at least 5 characters"),
    category_id: ProductCategoryEnum,
    base_price: z.number().positive("Base price must be greater than zero"),
    material_gauge: z.string().min(2, "Material gauge is required (e.g. Tata 20-Gauge CRCA Steel)"),
    warranty_years: z.number().int().min(1, "Warranty years must be at least 1"),
    dimensions: DynamicDimensionsSchema,
    variants: z
      .array(ProductVariantFormItemSchema)
      .min(1, "At least one variant must be configured with at least one photo"),
  })
  .superRefine((data, ctx) => {
    // Validate required dimensions based on chosen category
    if (data.category_id === "wardrobes_storage") {
      if (!data.dimensions.height) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Height is required for Wardrobes",
          path: ["dimensions", "height"],
        });
      }
      if (!data.dimensions.width) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Width is required for Wardrobes",
          path: ["dimensions", "width"],
        });
      }
      if (!data.dimensions.depth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Depth is required for Wardrobes",
          path: ["dimensions", "depth"],
        });
      }
    } else if (data.category_id === "beds") {
      if (!data.dimensions.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Length is required for Beds",
          path: ["dimensions", "length"],
        });
      }
      if (!data.dimensions.width) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Width is required for Beds",
          path: ["dimensions", "width"],
        });
      }
      if (!data.dimensions.headboard_height) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Headboard height is required for Beds",
          path: ["dimensions", "headboard_height"],
        });
      }
    } else if (data.category_id === "seating") {
      if (!data.dimensions.total_height) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Total height is required for Seating",
          path: ["dimensions", "total_height"],
        });
      }
      if (!data.dimensions.seat_height) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seat height is required for Seating",
          path: ["dimensions", "seat_height"],
        });
      }
      if (!data.dimensions.width) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Width is required for Seating",
          path: ["dimensions", "width"],
        });
      }
    }
  });

export type ProductBlueprintFormData = z.infer<typeof ProductBlueprintSchema>;
