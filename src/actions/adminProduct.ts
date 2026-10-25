"use server";

import { revalidatePath } from "next/cache";
import { ProductBlueprintSchema, type ProductBlueprintFormData } from "@/types/adminProduct";
import { ProductService } from "@/services/ProductService";

export interface ActionResult {
  success: boolean;
  message: string;
  productId?: string;
  variantCount?: number;
  errors?: Record<string, string[] | undefined>;
}

/**
 * Server Action: Create Product Blueprint
 * 
 * Validates at Server Action boundary using Zod before passing to Service layer
 */
export async function createProductBlueprintAction(
  formData: ProductBlueprintFormData
): Promise<ActionResult> {
  try {
    // 1. Boundary validation using strict Zod schema
    const validatedData = ProductBlueprintSchema.parse(formData);

    // 2. Delegate to Service Layer
    const result = await ProductService.saveProductBlueprint(validatedData);

    // 3. Revalidate Next.js cache paths
    revalidatePath("/categories");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: result.message,
      productId: result.productId,
      variantCount: result.variantCount,
    };
  } catch (error) {
    if (error && typeof error === "object" && "flatten" in error) {
      const zodError = error as import("zod").ZodError;
      return {
        success: false,
        message: "Validation failed on the server. Please verify all fields.",
        errors: zodError.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected server error occurred.",
    };
  }
}
