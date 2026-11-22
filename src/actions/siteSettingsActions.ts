"use server";

import { revalidatePath } from "next/cache";
import { SiteSettingsSchema, type SiteSettings } from "@/types/database";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { LocalDataStore } from "@/services/LocalDataStore";
import { verifyAdminSession } from "@/actions/authActions";
import type { ServerActionResult } from "@/actions/adminActions";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("placeholder-project"));
}

/**
 * Server Action: Update Singleton Site Settings
 */
export async function updateSiteSettingsAction(
  rawInput: Partial<SiteSettings>
): Promise<ServerActionResult<SiteSettings>> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return {
        success: false,
        message: "Unauthorized: Administrator privileges are required to update site settings.",
      };
    }

    const validated = SiteSettingsSchema.parse({
      ...rawInput,
      id: "global",
    });

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("site_settings")
        .upsert(
          {
            id: "global",
            brand_name: validated.brand_name,
            footer_tagline: validated.footer_tagline,
            phone_primary: validated.phone_primary,
            whatsapp_number: validated.whatsapp_number,
            email: validated.email,
            showroom_address: validated.showroom_address,
            factory_address: validated.factory_address,
            google_maps_url: validated.google_maps_url,
            operating_hours: validated.operating_hours,
            service_districts: validated.service_districts,
            social_links: validated.social_links,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (error) {
        console.error("[updateSiteSettingsAction] Supabase error:", error);
        return {
          success: false,
          message: `Failed to update site settings: ${error.message}`,
        };
      }

      // Revalidate all pages and layouts
      revalidatePath("/", "layout");
      revalidatePath("/admin/settings");

      return {
        success: true,
        message: "Site settings updated successfully.",
        data: data as SiteSettings,
      };
    } else {
      LocalDataStore.saveSiteSettings(validated);
      revalidatePath("/", "layout");
      revalidatePath("/admin/settings");
      return {
        success: true,
        message: "Site settings updated locally (offline mode).",
        data: validated,
      };
    }
  } catch (err: unknown) {
    console.error("[updateSiteSettingsAction] Exception:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Internal error updating site settings.",
    };
  }
}

