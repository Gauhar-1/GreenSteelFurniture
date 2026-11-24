"use server";

import { z } from "zod";
import { verifyAdminSession } from "@/actions/authActions";
import { CategoryService } from "@/services/CategoryService";
import { sanitizeErrorMessage } from "@/lib/errorSanitizer";

export interface AIProductAnalysisData {
  title_en: string;
  tagline: string;
  description: string;
  highlights: string[];
  category_id: string | null;
  sub_category_id: string | null;
}

export interface AIProductAnalysisResult {
  success: boolean;
  data?: AIProductAnalysisData;
  error?: string;
}

const AIFurnitureResponseSchema = z.object({
  title_en: z.string().min(1, "Title is required"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().optional().default(""),
  highlights: z.array(z.string()).default([]),
  category_id: z.string().nullable().default(null),
  sub_category_id: z.string().nullable().default(null),
});

/**
 * Server Action: Analyze Furniture Photo via Groq Vision API
 * 
 * - Strictly guarded by admin authentication session.
 * - Injects live Supabase categories & subcategories taxonomy into prompt.
 * - Extracts structured luxury product metadata using Groq Vision API.
 * - Sanitizes category matches against live database records to prevent hallucinations.
 */
export async function analyzeFurniturePhotoAction(
  base64DataUrl: string
): Promise<AIProductAnalysisResult> {
  try {
    // 1. Admin Session Guard
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return {
        success: false,
        error: "Unauthorized: Administrator privileges are required to perform AI analysis.",
      };
    }

    // 2. Input Validation
    if (!base64DataUrl || typeof base64DataUrl !== "string") {
      return {
        success: false,
        error: "Invalid image data provided.",
      };
    }

    if (!base64DataUrl.startsWith("data:image/")) {
      return {
        success: false,
        error: "Image must be a valid base64 data URL (data:image/...).",
      };
    }

    // Limit payload to ~500KB to protect server memory and comply with limits
    if (base64DataUrl.length > 500_000) {
      return {
        success: false,
        error: "Compressed image payload exceeds 500KB. Please try a different photo.",
      };
    }

    // 3. Environment & Key Validation
    const apiKey = process.env.GROQ_API_KEY || process.env.API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return {
        success: false,
        error: "AI Auto-Fill is not configured yet. Please enter details manually.",
      };
    }

    const requestedModel = process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

    // 4. Fetch Live Database Taxonomy
    const allCategories = await CategoryService.getAllCategories();
    const parentCategories = allCategories
      .filter((c) => !c.parent_id && c.id)
      .map((c) => ({
        id: c.id!,
        name_en: c.name_en,
        slug: c.slug,
        blueprint_type: c.blueprint_type,
      }));

    const subCategories = allCategories
      .filter((c) => Boolean(c.parent_id) && c.id)
      .map((c) => ({
        id: c.id!,
        name_en: c.name_en,
        category_id: c.parent_id!,
        blueprint_type: c.blueprint_type,
      }));

    // 5. Construct Brand-Voice Vision System Prompt
    const systemPrompt = `You are the senior catalog copywriter for Green Steel Furniture, an Indian luxury architectural manufacturer specializing in 304-grade mirror-polished stainless steel furniture (tubular frames, spherical ball finials, laser-cut floral/geometric motifs, charcoal/black tufted upholstery, floral-etched black tempered glass).

Inspect the uploaded furniture photo and return ONLY a valid JSON object matching this exact schema:
{
  "title_en": "4-7 word luxury product title (e.g., 'Regal Mirror-Steel Arched King Bed')",
  "tagline": "One punchy 8-14 word editorial subtitle",
  "description": "2-3 refined sentences highlighting 304-grade stainless steel craftsmanship, zero termites, rust-proof durability, and modern Indian home styling.",
  "highlights": ["4 to 5 short scannable specs/features based on visible details (finials, laser-cut panel, etched glass, tufted cushions, heavy-gauge steel)"],
  "category_id": "exact matching UUID from the provided categories list, or null",
  "sub_category_id": "exact matching UUID from the provided sub_categories list belonging to category_id, or null"
}

STRICT CONSTRAINTS:
- Return ONLY the JSON object. Do not wrap in markdown quotes or preamble.
- Never invent prices, dimensions, or wood claims.
- Select category_id ONLY from the provided categories list. If no clean match, use null.
- Select sub_category_id ONLY from the sub_categories list that belongs to the selected category_id. If no clean match, use null.

AVAILABLE CATEGORIES:
${JSON.stringify(parentCategories, null, 2)}

AVAILABLE SUB-CATEGORIES:
${JSON.stringify(subCategories, null, 2)}`;

    // 6. Call Groq OpenAI-Compatible Chat Completions API with fallback support
    const callGroqAPI = async (modelName: string) => {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this furniture photo and generate luxury product details strictly conforming to our brand standards and taxonomy.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: base64DataUrl,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 700,
        }),
      });

      return response;
    };

    let response = await callGroqAPI(requestedModel);

    // If requested model is not found or decommissioned on Groq, fallback to active vision model
    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const isModelError =
        response.status === 404 ||
        errJson?.error?.code === "model_not_found" ||
        errJson?.error?.code === "model_decommissioned";

      if (isModelError && requestedModel !== "qwen/qwen3.8-27b") {
        response = await callGroqAPI("qwen/qwen3.8-27b");
      } else {
        if (response.status === 429) {
          return {
            success: false,
            error: "Groq AI rate limit reached. Please wait a moment or enter details manually.",
          };
        }
        return {
          success: false,
          error:
            errJson?.error?.message ||
            "Unable to analyze photo via Groq AI. Please enter details manually.",
        };
      }
    }

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          error: "Groq AI rate limit reached. Please wait a moment or enter details manually.",
        };
      }
      return {
        success: false,
        error: "AI service is currently unavailable. Please enter details manually.",
      };
    }

    const completion = await response.json();
    const rawContent = completion?.choices?.[0]?.message?.content;

    if (!rawContent || typeof rawContent !== "string") {
      return {
        success: false,
        error: "No response received from AI model.",
      };
    }

    // 7. Parse & Validate JSON
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawContent.trim());
    } catch {
      return {
        success: false,
        error: "Failed to parse structured response from AI model.",
      };
    }

    const validated = AIFurnitureResponseSchema.safeParse(parsedJson);
    if (!validated.success) {
      return {
        success: false,
        error: "AI returned incomplete product structure.",
      };
    }

    const aiData = validated.data;

    // 8. Ground & Sanitize Taxonomy (Zero Hallucinated Categories)
    let validatedCategoryId: string | null = null;
    let validatedSubCategoryId: string | null = null;

    if (aiData.category_id) {
      const matchedCategory = parentCategories.find((c) => c.id === aiData.category_id);
      if (matchedCategory) {
        validatedCategoryId = matchedCategory.id;

        if (aiData.sub_category_id) {
          const matchedSub = subCategories.find(
            (s) => s.id === aiData.sub_category_id && s.category_id === matchedCategory.id
          );
          if (matchedSub) {
            validatedSubCategoryId = matchedSub.id;
          }
        }
      }
    }

    return {
      success: true,
      data: {
        title_en: aiData.title_en,
        tagline: aiData.tagline,
        description: aiData.description,
        highlights: Array.isArray(aiData.highlights) ? aiData.highlights.filter(Boolean) : [],
        category_id: validatedCategoryId,
        sub_category_id: validatedSubCategoryId,
      },
    };
  } catch (error) {
    console.error("AI Photo Analysis Error:", error);
    return {
      success: false,
      error: sanitizeErrorMessage(
        error,
        "An unexpected error occurred while analyzing the photo. Please enter details manually."
      ),
    };
  }
}

